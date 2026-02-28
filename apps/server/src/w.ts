import WebSocket, { WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import http from "http";
import { auth, User } from "@repo/auth";
import { fromNodeHeaders } from "better-auth/node";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@repo/db";
import { pubsub } from "@repo/redis";
import { sendBatchMessages } from "@repo/kafka";

interface AuthenticatedWebSocket extends WebSocket {
  user: User;
  socketId: string;
}

export class RoomManager {
  private wss: WebSocketServer;
  // in memory rooms key :- roomId value :- sockets
  private rooms = new Map<string, Set<AuthenticatedWebSocket>>();
  // in memory rooms id , value :- unique roomIds to maintain the pub subs ( subscribe and unsubscribe)
  private subscribedRooms = new Set<string>();

  constructor(private readonly server: http.Server) {
    this.wss = new WebSocketServer({ noServer: true });
    this.setupUpgradeHandler();
    this.initializeConnections();
  }

  // middleware for the authentication , get the session and attach to sockets
  private setupUpgradeHandler() {
    this.server.on("upgrade", async (req: IncomingMessage, socket, head) => {
      const { pathname } = new URL(req.url || "", `http://${req.headers.host}`);
      if (pathname !== "/room") return;
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(req.headers),
        });
        if (!session || !session.user) {
          socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
          socket.destroy();
          return;
        }

        this.wss.handleUpgrade(req, socket, head, (ws) => {
          const aws = ws as AuthenticatedWebSocket;
          aws.user = session.user;
          aws.socketId = uuidv4();
          this.wss.emit("connection", aws, req);
        });
      } catch (error) {
        console.error("WS upgrade error", error);
        socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
        socket.destroy();
      }
    });
  }

  // on socket connection
  private initializeConnections() {
    this.wss.on("connection", async (ws: AuthenticatedWebSocket) => {
      console.log(
        `ws connected | user=${ws.user.email} | server=${process.env.PORT}`,
      );
      // handle message of client
      ws.on("message", (raw) => this.onMessages(ws, raw));
      // close the connection
      ws.on("close", () => this.onClose(ws));
    });
  }

  private onMessages(ws: AuthenticatedWebSocket, raw: WebSocket.RawData) {
    const { event, data } = JSON.parse(raw.toString());
    switch (event) {
      case "JOIN":
        this.joinWsRooms(ws, data);
        break;
      case "LEAVE":
        this.leaveWsRooms(ws, data);
        break;
      case "BROADCAST":
        this.sendMessagesToWsRooms(ws, data);
        break;
      case "ROOMSNEARME":
        this.roomsNearMe(ws, data);
        break;
    }
  }

  private async joinWsRooms(ws: AuthenticatedWebSocket, data: any) {
    // verify user belongs to room
    const { roomId } = data;
    const isMember = await prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          roomId,
          userId: ws.user.id,
        },
      },
    });
    if (!isMember) {
      this.safeSend(ws, { success: false, message: "Not a room member" });
      return;
    }

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(ws);

    if (!this.subscribedRooms.has(roomId)) {
      console.log(
        `SERVER ${process.env.PORT} subscribing to room:${roomId}:pubsub`,
      );
      // fanout and subscribe to messages for this roomId
      // if any message persists fanout and send to local room's sockets
      await pubsub.subscribe(`room:${roomId}:pubsub`, (message) => {
        const sockets = this.rooms.get(roomId);
        if (!sockets) return;
        for (const client of sockets) {
          if (client.readyState === WebSocket.OPEN) {
            if (client.user.id === message.senderId) continue;
            client.send(JSON.stringify(message));
          }
        }
      });
      this.subscribedRooms.add(roomId);
    }
  }

  private async leaveWsRooms(ws: AuthenticatedWebSocket, data: any) {
    const { roomId } = data;
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.delete(ws);
    // if this server has zero sockets for this room - unsubscribe the room
    if (room.size === 0) {
      console.log(
        `server ${process.env.PORT} unsubscribing from room:${roomId}:pubsub`,
      );

      this.rooms.delete(roomId);
      this.subscribedRooms.delete(roomId);
      await pubsub.unsubscribe(`room:${roomId}:pubsub`);
    }
  }

  private async sendMessagesToWsRooms(ws: AuthenticatedWebSocket, data: any) {
    const { roomId, content, type } = data;
    // before sending message , validate the user belongs to room or not
    // get the sockets from the roomId
    const room = this.rooms.get(roomId);
    // validate the whether present or not
    if (!room || !room.has(ws)) {
      this.safeSend(ws, { success: false, message: "you are not in room" });
      return;
    }
    // one timestamp
    const now = new Date();
    // just publish to pub subs each subscribed server receives the messages
    await pubsub.publish(`room:${roomId}:pubsub`, {
      event: "MESSAGE",
      roomId,
      senderId: ws.user.id,
      content,
      type,
      createdAt: now.getTime(),
    });
    // push the message to kafka
    // messageProduce(msgData);
    sendBatchMessages([
      {
        roomId,
        senderId: ws.user.id,
        content,
        createdAt: now.toISOString(),
        type,
      },
    ]).catch((err) => console.log("error in pushing messages to kafka", err));
  }

  private async roomsNearMe(ws: AuthenticatedWebSocket, data: any) {}
  // on close connection remove the socket , check for the last if there is zero sockets then unsubscribe to this roomId
  private onClose(ws: AuthenticatedWebSocket) {
    for (const [roomId, sockets] of this.rooms.entries()) {
      if (sockets.has(ws)) {
        sockets.delete(ws);

        if (sockets.size === 0) {
          this.rooms.delete(roomId);
          this.subscribedRooms.delete(roomId);
          pubsub.unsubscribe(`room:${roomId}:pubsub`);
        }
      }
    }
  }

  private safeSend(ws: AuthenticatedWebSocket, payload: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    }
  }
}
