import { prisma } from "@repo/db";
import { Request, Response } from "express";
import { cache, pipeline, ratelimit } from "@repo/redis";
import {
  createRoomSchema,
  degradeAdminSchema,
  deleteRoomSchema,
  getUserCells,
  haversineDistance,
  joinRoomSchema,
  leaveRoomSchema,
  makeAdminSchema,
  RADIUS_KM,
  removeMembersSchema,
} from "@repo/zod";
import { roomEvents } from "@repo/kafka";
import { AppError } from "../error";

interface NearbyRoom {
  id: string;
  name: string;
  img: string | null;
  lat: number;
  lng: number;
  memberCount: number;
  maxMembers: number;
  createdAt: string;
  expiresAt: string | null;
  distance_km: number;
}

const Rooms = {
  // getRoomsNearMe
  // createRoom
  // joinRoom
  // leaveRoom
  // deleteRoom
  // removeRoomMembers
  // getRoomMembers
  // getRoomMessages
  // makeAdmins
  // blackListRooms

  // move this http to wss
  async getRoomsNearMe(req: Request, res: Response) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          error: "Unauthorized User",
          success: false,
        });
      }
      const lat = Number(req.query.lat);
      const lng = Number(req.query.lng);
      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        return res.status(400).json({
          message: "lat and lng are required",
          success: false,
        });
      }
      const cells = getUserCells(lat, lng);
      const pip = pipeline.pipeline();
      for (const cell of cells) {
        pip.hgetall(`geo:cell:${cell}`);
      }
      const results = await pip.exec();
      const room = new Map<string, NearbyRoom>();
      for (const [err, cellData] of results ?? []) {
        if (err || !cellData) continue;
        for (const [roomId, rawRoom] of Object.entries(
          cellData as Record<string, string>,
        )) {
          if (room.has(roomId)) continue;
          const rm = JSON.parse(rawRoom);
          if (rm.expiresAt && new Date(rm.expiresAt) < new Date()) continue;
          const distance_km = haversineDistance(lat, lng, rm.lat, rm.lng);
          if (distance_km > RADIUS_KM) continue;

          room.set(roomId, {
            ...rm,
            distance_km: Math.round(distance_km * 1000) / 1000,
          });
        }
      }
      const rooms = Array.from(room.values()).sort(
        (a, b) => a.distance_km - b.distance_km,
      );
      return res.status(200).json({
        success: true,
        message: rooms.length === 0 ? "no rooms near you" : "rooms near you",
        rooms,
      });
    } catch (error) {
      console.log(error);
      if (error instanceof AppError) {
        return res.status(error.status).json({
          message: error.message,
          success: false,
        });
      }
      return res.status(500).json({
        error: "internal server error",
        success: false,
      });
    }
  },

  async createRoom(req: Request, res: Response) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          error: "Unauthorized User",
          success: false,
        });
      }
      const { success, data } = createRoomSchema.safeParse(req.body);
      if (!success) {
        return res.status(403).json({
          error: "room details required",
          success: false,
        });
      }
      const lat = Number(data.lat);
      const lng = Number(data.lng);
      const isUserBlacklisted = await prisma.user.findFirst({
        where: {
          id: req.user.id,
          isBlacklisted: true,
        },
      });
      if (isUserBlacklisted) {
        return res.status(403).json({
          message: "you are blacklisted",
          success: false,
        });
      }
      const room = await prisma.$transaction(async (tx) => {
        const room = await tx.room.create({
          data: {
            name: data.name,
            expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
            createdBy: req.user.id,
            memberCount: 1,
            lat,
            lng,
          },
        });
        await tx.roomMember.create({
          data: {
            userId: req.user.id,
            roomId: room.id,
            role: "ADMIN",
          },
        });
        return room;
      });
      await roomEvents("room-created", {
        id: room.id,
        name: room.name,
        img: room.img,
        lat: room.lat,
        lng: room.lng,
        memberCount: room.memberCount,
        maxMembers: room.maxMembers,
        createdAt: room.createdAt.toISOString(),
        expiresAt: room.expiresAt?.toISOString() ?? null,
        isDeleted: room.isDeleted,
        isBlacklisted: room.isBlacklisted,
      });
      return res.status(200).json({
        message: "Room created",
        success: true,
        room,
      });
    } catch (error) {
      console.log("error", error);
      if (error instanceof AppError) {
        return res.status(error.status).json({
          message: error.message,
          success: false,
        });
      }
      return res.status(500).json({
        error: "internal server error",
        success: false,
      });
    }
  },

  async joinRoom(req: Request, res: Response) {
    try {
      if (!req.user.id) {
        return res.status(401).json({
          message: "unauthorized user",
          success: false,
        });
      }
      const { success, data } = joinRoomSchema.safeParse(req.params);
      if (!success) {
        return res.status(400).json({
          message: "room id required",
          success: false,
        });
      }
      // check user blacklisted or not
      const isUserBlacklisted = await prisma.user.findFirst({
        where: { id: req.user.id, isBlacklisted: true },
      });
      if (isUserBlacklisted) {
        throw new AppError("you are Blacklisted", 403);
      }
      // check user is a member of room
      const isMember = await prisma.roomMember.findFirst({
        where: {
          userId: req.user.id,
          roomId: data.roomId,
        },
        select: { role: true, leftAt: true },
      });
      if (isMember) {
        throw new AppError(
          `you are already a ${isMember.role} of the room`,
          409,
        );
      }
      const { member, room } = await prisma.$transaction(async (tx) => {
        // lock room row for preventing the race conditions for member count
        const rows = await tx.$queryRaw<
          {
            id: string;
            isBlacklisted: boolean;
            isDeleted: boolean;
            expiresAt: Date | null;
            memberCount: number;
            maxMembers: number;
            lat: number;
            lng: number;
          }[]
        >`
            SELECT
            id,
            "isBlacklisted",
            "isDeleted",
            "expiresAt",
            "memberCount",
            "maxMembers",
            lat,
            lng
            FROM "Room"
            WHERE id = ${data.roomId}
            FOR UPDATE
          `;
        const room = rows[0];
        if (!room) throw new AppError("room not found", 404);
        if (room.isBlacklisted) throw new AppError("room is blacklisted", 403);
        if (room.isDeleted) throw new AppError("room not found", 404);
        if (room.expiresAt && room.expiresAt < new Date()) {
          throw new AppError("room has expired", 410);
        }
        if (room.memberCount >= room.maxMembers) {
          throw new AppError("room is full", 409);
        }
        const [updatedRoom, member] = await Promise.all([
          tx.room.update({
            where: { id: data.roomId },
            data: { memberCount: { increment: 1 } },
            select: { memberCount: true, lat: true, lng: true },
          }),

          tx.roomMember.upsert({
            where: {
              userId_roomId: {
                userId: req.user.id,
                roomId: data.roomId,
              },
            },
            update: { joinedAt: new Date() },
            create: {
              userId: req.user.id,
              roomId: data.roomId,
              role: "MEMBER",
              joinedAt: new Date(),
            },
          }),
        ]);
        return {
          member,
          room: { ...room, memberCount: updatedRoom.memberCount },
        };
      });
      await roomEvents("room-membercount", {
        id: data.roomId,
        lat: room.lat,
        lng: room.lng,
        memberCount: room.memberCount,
      });
      return res.status(200).json({
        message: "room joined",
        success: true,
        member,
      });
    } catch (error) {
      console.log("error", error);
      if (error instanceof AppError) {
        return res.status(error.status).json({
          message: error.message,
          success: false,
        });
      }
      return res.status(500).json({
        message: "internal server error",
        success: false,
      });
    }
  },

  async leaveRoom(req: Request, res: Response) {
    try {
      if (!req.user.id) {
        return res.status(401).json({
          message: "Unauthorized User",
          success: false,
        });
      }
      const { success, data } = leaveRoomSchema.safeParse(req.params);
      if (!success) {
        return res.status(400).json({
          message: "room id required",
          success: false,
        });
      }
      const isMember = await prisma.roomMember.findUnique({
        where: {
          userId_roomId: {
            userId: req.user.id,
            roomId: data.roomId,
          },
        },
      });
      if (!isMember) {
        return res.status(404).json({
          message: "you are not a room member",
          success: false,
        });
      }
      const room = await prisma.$transaction(async (tx) => {
        // lock room row to prevent concurrent leave request can lead to race conditions for memberCount
        const rows = await tx.$queryRaw<
          {
            id: string;
            memberCount: number;
            lat: number;
            lng: number;
            isDeleted: boolean;
          }[]
        >`
        SELECT id, "memberCount", lat, lng, "isDeleted"
        FROM "Room"
        WHERE id = ${data.roomId}
        FOR UPDATE
      `;
        const room = rows[0];
        if (!room) throw new AppError("room not found", 404);
        if (room.isDeleted) throw new AppError("room not found", 404);
        if (room.memberCount <= 0)
          throw new AppError("room has no member", 409);
        // recheck the membership
        const member = await tx.roomMember.findUnique({
          where: {
            userId_roomId: { userId: req.user.id, roomId: data.roomId },
          },
          select: { id: true },
        });
        if (!member) throw new AppError("you are not a room member", 404);

        const [, updatedRoom] = await Promise.all([
          tx.roomMember.delete({
            where: {
              userId_roomId: {
                userId: req.user.id,
                roomId: data.roomId,
              },
            },
          }),

          tx.room.update({
            where: {
              id: data.roomId,
            },
            data: {
              memberCount: { decrement: 1 },
            },
          }),
        ]);
        return updatedRoom;
      });
      await roomEvents("room-membercount", {
        id: room.id,
        lat: room.lat,
        lng: room.lng,
        memberCount: room.memberCount,
      });
      return res.status(200).json({
        message: "you left room",
        success: true,
      });
    } catch (error) {
      console.log("error", error);
      if (error instanceof AppError) {
        return res.status(error.status).json({
          message: error.message,
          success: false,
        });
      }
      return res.status(500).json({
        message: "internal server error",
        success: false,
      });
    }
  },

  async deleteRoom(req: Request, res: Response) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          message: "Unauthorized User",
          success: false,
        });
      }
      // check room is present or not , only admins can delete the room , gracefully remove the members , keep the chats

      const { success, data } = deleteRoomSchema.safeParse(req.params);
      if (!success) {
        return res.status(400).json({
          message: "room id is required",
          success: false,
        });
      }

      await prisma.$transaction(async (tx) => {
        // check room exists and user should be creator of the room
        const room = await tx.room.findFirst({
          where: {
            id: data.roomId,
            isDeleted: false,
            createdBy: req.user.id,
          },
        });

        if (!room) {
          throw new Error(
            "either room is not present or you are not a room creator",
          );
        }
        // remove the roomId from the members
        await tx.roomMember.deleteMany({
          where: {
            roomId: data.roomId,
          },
        });
        // soft delete while persisting the chats
        await tx.room.update({
          where: {
            id: data.roomId,
          },
          data: {
            isDeleted: true,
          },
        });
      });
      return res.status(200).json({
        success: true,
        message: "room deleted successfully",
      });
    } catch (error) {
      console.log("error", error);
      if (error instanceof AppError) {
        return res.status(error.status).json({
          message: error.message,
          success: false,
        });
      }
      return res.status(500).json({
        message: "internal server error",
        success: false,
      });
    }
  },

  async removeRoomMembers(req: Request, res: Response) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          message: "Unauthorized user",
          success: false,
        });
      }
      const { roomId } = req.params;
      const body = req.body;
      const { success, data } = removeMembersSchema.safeParse(body);
      if (!success) {
        return res.status(400).json({
          message: "user ids are required",
          success: false,
        });
      }
      if (!roomId || Array.isArray(roomId)) {
        return res.status(400).json({
          message: "room id required",
          success: false,
        });
      }

      const memberIds = new Set(data.userIds);
      const memIds = [...memberIds];
      const members = await prisma.$transaction(async (tx) => {
        // the remover must be admin of the room
        const isAdmin = await tx.roomMember.findFirst({
          where: {
            roomId,
            userId: req.user.id,
            role: "ADMIN",
          },
        });
        if (!isAdmin) {
          throw new Error("you are not admin for the room");
        }

        return await tx.roomMember.deleteMany({
          where: {
            roomId,
            userId: { in: memIds },
            role: "MEMBER",
          },
        });
      });
      return res.status(200).json({
        message: `${members.count} has been removed from room`,
        success: true,
      });
    } catch (error) {
      console.log("error", error);
      if (error instanceof AppError) {
        return res.status(error.status).json({
          message: error.message,
          success: false,
        });
      }
      return res.status(500).json({
        message: "internal server error",
        success: false,
      });
    }
  },

  async getRoomMembers(req: Request, res: Response) {
    try {
      if (!req.user.id) {
        return res.status(401).json({
          message: "Unauthorized User",
          success: false,
        });
      }
      const { roomId } = req.params;
      if (!roomId || Array.isArray(roomId)) {
        return res.status(400).json({
          message: "room id required",
          success: false,
        });
      }
      // check the member existences
      const isMember = await prisma.roomMember.findUnique({
        where: {
          userId_roomId: {
            roomId,
            userId: req.user.id,
          },
        },
      });
      if (!isMember) {
        return res.status(404).json({
          message: "not a room member",
          success: false,
        });
      }
      const members = await cache.getOrSet(
        "members",
        [roomId],
        async () => {
          const rows = await prisma.roomMember.findMany({
            where: {
              roomId,
              room: {
                isDeleted: false,
              },
            },
            select: { id: true, role: true, user: true },
          });
          return rows.map((mem) => ({
            id: mem.id,
            name: mem.user.name,
            img: mem.user.image,
            userId: mem.user.id,
            role: mem.role,
          }));
        },
        { ttl: 60, lockTTL: 10, maxRetries: 5 },
      );
      return res.status(200).json({
        message: "members of the room",
        success: true,
        members,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.status).json({
          message: error.message,
          success: false,
        });
      }
      return res
        .status(500)
        .json({ success: false, message: "internal server error" });
    }
  },

  async getRoomMessages(req: Request, res: Response) {
    try {
      // the room members can access them
      // any one can access member and admin
      // the message should be isDeleted false
      // the message must be returned in order
      // the details like name who sent and at what time may be

      if (!req.user.id) {
        return res.status(401).json({
          message: "Unauthorized User",
          success: false,
        });
      }
      const { roomId } = req.params;
      if (!roomId || Array.isArray(roomId)) {
        return res.status(400).json({
          message: "room id is required",
          success: false,
        });
      }
      // offset from query
      const beforeOffset = req.query.beforeOffset
        ? BigInt(req.query.beforeOffset as string)
        : null;
      const offsetKey = beforeOffset ? beforeOffset.toString() : "latest";
      // check the member existance in room
      const isMember = await prisma.roomMember.findUnique({
        where: {
          userId_roomId: {
            userId: req.user.id,
            roomId,
          },
        },
        select: { userId: true },
      });
      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: "Not a room member",
        });
      }
      // check for the cache messages not found query to db
      const messages = await cache.getOrSet(
        "roomMessages",
        [roomId, offsetKey, "50"],
        async () => {
          const rows = await prisma.messages.findMany({
            where: {
              roomId,
              isDeleted: false,
              ...(beforeOffset && { offset: { lt: beforeOffset } }),
            },
            orderBy: {
              offset: "desc",
            },
            take: 50,
            select: {
              id: true,
              content: true,
              offset: true,
              createdAt: true,
              sender: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          });

          rows.reverse();

          return rows.map((msg) => ({
            id: msg.id,
            content: msg.content,
            createdAt: msg.createdAt,
            offset: msg.offset.toString(),
            sender: msg.sender,
          }));
        },
        {
          ttl: beforeOffset ? 60 : 10,
          lockTTL: 5,
          maxRetries: 5,
        },
      );

      return res.status(200).json({
        message: "room messages accessed from db",
        success: true,
        messages,
      });
    } catch (error) {
      console.log("error", error);
      if (error instanceof AppError) {
        return res.status(error.status).json({
          message: error.message,
          success: false,
        });
      }
      return res.status(500).json({
        message: "internal server error",
        success: false,
      });
    }
  },

  async makeRoomAdmins(req: Request, res: Response) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          message: "Unauthorized User",
          success: false,
        });
      }
      const { success, data } = makeAdminSchema.safeParse(req.params);
      if (!success) {
        return res.status(400).json({
          message: "room id and userId is required",
          success: false,
        });
      }
      await prisma.$transaction(async (tx) => {
        const room = await tx.room.findFirst({
          where: {
            id: data.roomId,
            isDeleted: false,
            createdBy: req.user.id,
          },
          select: { id: true },
        });

        if (!room) {
          throw new Error("room not found or you are not an room creator");
        }

        const [targetMember, adminCount] = await Promise.all([
          tx.roomMember.findUnique({
            where: {
              userId_roomId: {
                roomId: data.roomId,
                userId: data.userId,
              },
            },
            select: {
              role: true,
            },
          }),

          tx.roomMember.count({
            where: {
              roomId: data.roomId,
              role: "ADMIN",
            },
          }),
        ]);

        if (!targetMember) {
          throw new Error(
            "the user you are requesting is not present in the room",
          );
        }

        if (targetMember.role === "ADMIN") {
          throw new Error(
            "the user you are requesting is already admin of the room",
          );
        }

        if (adminCount >= 5) {
          throw new Error("room can have 5 admins only");
        }

        await tx.roomMember.update({
          where: {
            userId_roomId: {
              roomId: data.roomId,
              userId: data.userId,
            },
          },
          data: {
            role: "ADMIN",
          },
        });
      });
      return res.status(200).json({
        message: "the requested user as upgrade to room admin",
        success: true,
      });
    } catch (error) {
      console.log("error", error);
      if (error instanceof AppError) {
        return res.status(error.status).json({
          message: error.message,
          success: false,
        });
      }
      return res.status(500).json({
        message: "internal server error",
        success: false,
      });
    }
  },

  async degradeRoomAdmins(req: Request, res: Response) {
    try {
      if (!req.user.id) {
        return res.status(401).json({
          message: "Unauthorized user",
          success: false,
        });
      }
      const { success, data } = degradeAdminSchema.safeParse(req.params);
      if (!success) {
        return res.status(400).json({
          message: "room id and user id required",
          success: false,
        });
      }
      // check the room creator is valid
      const isRoomCreator = await prisma.room.findFirst({
        where: {
          id: data.roomId,
          isBlacklisted: false,
          isDeleted: false,
          createdBy: req.user.id,
        },
      });
      if (!isRoomCreator) {
        return res.status(404).json({
          message:
            "you are not room creator or either room is delete or blacklisted",
          success: false,
        });
      }
      const isAdminPresent = await prisma.roomMember.findFirst({
        where: {
          userId: data.userId,
          roomId: data.roomId,
          role: "ADMIN",
        },
      });
      if (!isAdminPresent) {
        return res.status(404).json({
          message:
            "the user admin you are requesting is not present in room or he is not an admin",
          success: false,
        });
      }
      await prisma.roomMember.update({
        where: {
          userId_roomId: {
            userId: data.userId,
            roomId: data.roomId,
          },
        },
        data: {
          role: "MEMBER",
        },
      });
      return res.status(200).json({
        message: "success",
        success: true,
      });
    } catch (error) {
      console.log("error", error);
      if (error instanceof AppError) {
        return res.status(error.status).json({
          message: error.message,
          success: false,
        });
      }
      return res.status(500).json({
        message: "internal server error",
        success: false,
      });
    }
  },
};

export { Rooms };
