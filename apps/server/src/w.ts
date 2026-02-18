import WebSocket, { WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import http from "http";
import { auth, User } from "@repo/auth";
import { fromNodeHeaders } from "better-auth/node";
import { cache } from "./index";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@repo/db";

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
        await this.JoinRoom(ws, data);
        break;

      case "LEAVE":
        await this.EndRoom(ws, data);
        break;
    }
  }

  private async JoinRoom(ws: AuthenticatedWebSocket, data: any) {
    const newRoomMember = await prisma.$transaction(async (tx) => {
      const roomExists = await tx.room.findFirst({
        where: {
          id: data.roomId,
          isDeleted: false,
        },
        select: {
          id: true,
          name: true,
          _count: {
            select: { members: true },
          },
        },
      });
      if (!roomExists) {
        ws.send(JSON.stringify({ error: "room not found", success: false }));
        return;
      }
      if (roomExists._count.members >= 50) {
        ws.send(
          JSON.stringify({
            error: `${roomExists.name} is full max 50 members`,
            success: false,
          }),
        );
        return;
      }

      return await tx.roomMember.upsert({
        where: {
          userId_roomId: {
            userId: ws.user.id,
            roomId: data.roomId,
          },
        },
        update: {},
        create: {
          userId: ws.user.id,
          roomId: data.roomId,
          role: "MEMBER",
        },
        select: {
          id: true,
          roomId: true,
          userId: true,
          role: true,
          room: {
            select: {
              name: true,
            },
          },
          user: {
            select: {
              name: true,
            },
          },
          joinedAt: true,
        },
      });
    });

    if (newRoomMember) {
      await cache.join(data.roomId, ["members"], ws.socketId);
      ws.send(
        JSON.stringify({
          message: `you joined${newRoomMember.room.name}`,
          success: true,
          newRoomMember,
        }),
      );
    }
  }

  private async EndRoom(ws: AuthenticatedWebSocket, data: any) {
    const socketId = ws?.socketId!;
    await cache.end(data.roomId, ["members"], socketId);
    await prisma.room.update({
      where: {
        id: data.roomId,
      },
      data: {
        members: {
          disconnect: {
            id: data.roomMemberId,
          },
        },
      },
    });
    ws.send(JSON.stringify({ message: "you are removed", success: true }));
  }

  private async onClose(ws: AuthenticatedWebSocket) {}
}
