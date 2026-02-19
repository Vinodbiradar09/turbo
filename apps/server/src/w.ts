import WebSocket, { WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import http from "http";
import { auth, User } from "@repo/auth";
import { fromNodeHeaders } from "better-auth/node";
import { cache } from "./index";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@repo/db";
import { pubsub } from "./index";

interface AuthenticatedWebSocket extends WebSocket {
  user: User;
  socketId: string;
}

export class RoomConnectioManager {
  private wss: WebSocketServer;

  constructor(private readonly server: http.Server) {
    this.wss = new WebSocketServer({ noServer: true });
    this.setupUpgradeHandler();
    this.connectionInitialize();
  }

  private rooms = new Map<string, Set<WebSocket>>();
  private roomCounts = new Map<string, number>();

  private setupUpgradeHandler() {
    this.server.on("upgrade", async (req: IncomingMessage, socket, head) => {
      const { pathname } = new URL(req.url || "", `http://${req.headers.host}`);
      if (pathname === "/room") {
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
            const authenticatedWs = ws as AuthenticatedWebSocket;
            authenticatedWs.user = session.user;
            authenticatedWs.socketId = uuidv4();
            this.wss.emit("connection", authenticatedWs, req);
          });
        } catch (error) {
          console.error("WS Auth Error:", error);
          socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
          socket.destroy();
        }
      }
    });
  }

  private connectionInitialize() {
    this.wss.on(
      "connection",
      (ws: AuthenticatedWebSocket, req: IncomingMessage) => {
        console.log("connection made", ws.user.email);
        ws.on("message", (raw) => this.onMessages(ws, raw));
        ws.on("close", () => this.onClose(ws));
      },
    );
  }

  private async onMessages(ws: AuthenticatedWebSocket, raw: WebSocket.RawData) {
    const { event, data } = JSON.parse(raw.toString());
    switch (event) {
      case "JOIN":
        await this.joinRooms(ws, data);
        break;

      case "LEAVE":
        await this.endRooms(ws, data);
        break;

      case "BROADCAST": 
        await this.SendMessages(ws , data);  
    }
  }

  private async joinRooms(ws: AuthenticatedWebSocket, data: any) {
    // check the user is in room or not
    const isMember = await prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId: ws.user.id,
          roomId: data.roomId,
        },
      },
    });
    if (!isMember) {
      this.sendMessageToClient(ws, {
        message: "not a room member",
        success: false,
      });
      return;
    }

    if (!this.rooms.has(data.roomId)) {
      this.rooms.set(data.roomId, new Set());
    }
    this.rooms.get(data.roomId)!.add(ws);

    const count = this.roomCounts.get(data.roomId) ?? 0;
    if (count === 0) {
      await pubsub.subscribe(`room:${data.roomId}:pubsub`, (message) => {
        const sockets = this.rooms.get(data.roomId);
        if (!sockets) return;
        for (const client of sockets) {
          if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(message));
          }
        }
      });
    }

    this.roomCounts.set(data.roomId, count + 1);
    this.sendMessageToClient(ws, {
      message: "you joined room",
      success: true,
    });
  }

  private async endRooms(ws: AuthenticatedWebSocket, data: any) {
    const room = this.rooms.get(data.roomId);
    if (!room) return;

    room.delete(ws);
    const count = (this.roomCounts.get(data.roomId) ?? 1) - 1;
    if (count === 0) {
      this.roomCounts.delete(data.roomId);
      this.rooms.delete(data.roomId);
      await pubsub.unsubscribe(`room:${data.roomId}:pubsub`);
    } else {
      this.roomCounts.set(data.roomId, count);
    }
  }

  private async SendMessages(ws: AuthenticatedWebSocket, data: any) {
    const { roomId, content } = data;
    const isMember = await prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId: ws.user.id,
          roomId,
        },
      },
    });
    if (!isMember) {
      this.sendMessageToClient(ws, {
        success: false,
        message: "not a room member",
      });
      return;
    }
    await pubsub.publish(`room:${roomId}:pubsub`, {
        event : "MESSAGE",
        playload : content
    });
  }
  private async sendMessageToClient(ws: AuthenticatedWebSocket, data: any) {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify(data));
    }
  }

  private async onClose(ws: AuthenticatedWebSocket) {}
}
