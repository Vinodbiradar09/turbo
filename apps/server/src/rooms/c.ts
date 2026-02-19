import { prisma } from "@repo/db";
import { Request, Response } from "express";
import { cache } from "../index";
import {
  createRoomSchema,
  degradeAdminSchema,
  deleteRoomSchema,
  joinRoomSchema,
  leaveRoomSchema,
  makeAdminSchema,
  removeMemberSchema,
} from "@repo/zod";

const Rooms = {
  async getRooms(req: Request, res: Response) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          error: "Unauthorized User",
          success: false,
        });
      }
      const rooms = await cache.getOrSet(
        "rooms",
        ["available"],
        async () => {
          return prisma.room.findMany({
            where: {
              isDeleted: false,
            },
          });
        },
        { ttl: 300, lockTTL: 10 },
      );
      if (rooms.length === 0) {
        return res.status(200).json({
          message: "no rooms available",
          success: true,
        });
      }
      return res.status(200).json({
        success: true,
        message: "All rooms",
        rooms,
      });
    } catch (error) {
      console.log(error);
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
      const room = await prisma.$transaction(async (tx) => {
        const room = await tx.room.create({
          data: {
            name: data.name,
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

      await cache.del("rooms", ["available"]);

      return res.status(200).json({
        message: "Room created",
        success: true,
        room,
      });
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({
        error: "internal server error",
        success: false,
      });
    }
  },

  async joinRoom(req: Request, res: Response) {
    if (!req.user?.id) {
      return res.status(401).json({
        error: "Unauthorized User",
        success: false,
      });
    }
    const { success, data } = joinRoomSchema.safeParse(req.params);
    if (!success) {
      return res.status(400).json({
        error: "roomId is required",
        success: false,
      });
    }
    const { roomId } = data;

    try {
      const member = await prisma.$transaction(async (tx) => {
        // Lock room row
        const room = await tx.$queryRaw<{ id: string; name: string }[]>`
        SELECT id, name
        FROM "Room"
        WHERE id = ${roomId}
          AND "isDeleted" = false
        FOR UPDATE
      `;

        if (room.length === 0) {
          throw new Error("ROOM_NOT_FOUND");
        }

        // Count members under lock if above 50 return them
        const membersCount = await tx.roomMember.count({
          where: { roomId },
        });

        if (membersCount >= 50) {
          throw new Error("room full max 50 members");
        }

        return tx.roomMember.upsert({
          where: {
            userId_roomId: {
              userId: req.user.id,
              roomId,
            },
          },
          update: {},
          create: {
            userId: req.user.id,
            roomId,
            role: "MEMBER",
          },
          select: {
            id: true,
            roomId: true,
            userId: true,
            role: true,
            joinedAt: true,
            room: {
              select: { name: true },
            },
            user: {
              select: { name: true },
            },
          },
        });
      });

      return res.status(200).json({
        success: true,
        message: `You joined ${member.room.name} as ${member.role}`,
        member,
      });
    } catch (err) {
      console.error("joinRoom error:", err);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },

  async leaveRoom(req: Request, res: Response) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          message: "Unauthorized User",
          success: false,
        });
      }
      const { success, data } = leaveRoomSchema.safeParse(req.params);
      if (!success) {
        return res.status(400).json({
          message: "room member id is required",
          success: false,
        });
      }
      const isRoomMember = await prisma.roomMember.findUnique({
        where: {
          userId_roomId: {
            roomId: data.roomId,
            userId: req.user.id,
          },
        },
      });
      if (!isRoomMember) {
        return res.status(404).json({
          message: `you are not a member of this room`,
          success: false,
        });
      }
      await prisma.roomMember.delete({
        where: {
          userId_roomId: {
            userId: req.user.id,
            roomId: data.roomId,
          },
        },
      });
      return res.status(200).json({
        message: "you left the room successfully",
        success: true,
      });
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({
        message: "internal server error",
        success: false,
      });
    }
  },

  async makeRoomMemberToAdmin(req: Request, res: Response) {
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
            members: {
              some: {
                userId: req.user.id,
                role: "ADMIN",
              },
            },
          },
          select: { id: true },
        });

        if (!room) {
          throw new Error("room not found or you are not an admin");
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
        // check room exists and user should be admin
        const room = await tx.room.findFirst({
          where: {
            id: data.roomId,
            isDeleted: false,
            members: {
              some: {
                userId: req.user.id,
                role: "ADMIN",
              },
            },
          },
        });

        if (!room) {
          throw new Error("either room is not present or you are not an admin");
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
      return res.status(500).json({
        message: "internal server error",
        success: false,
      });
    }
  },

  async degradeAdminToMember(req: Request, res: Response) {
    try {
      // any admin can degrade the admin to member , no rules for the first admin and shit
      // the remover must the admin of the same room , the degrading user should be also admin of the same room
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          message: "Unauthorized User",
          success: false,
        });
      }
      const { success, data } = degradeAdminSchema.safeParse(req.params);
      if (!success) {
        return res.status(400).json({
          message: "userId and roomId are required",
          success: false,
        });
      }
      const updatedMember = await prisma.$transaction(async (tx) => {
        const admins = await tx.roomMember.findMany({
          where: {
            roomId: data.roomId,
            role: "ADMIN",
            userId: { in: [req.user.id, data.userId] },
          },
          select: {
            userId: true,
          },
        });

        const adminIds = new Set(admins.map((ads) => ads.userId));
        if (!adminIds.has(req.user.id)) {
          throw new Error(
            "either room is not present or you are not admin of the room",
          );
        }
        if (!adminIds.has(data.userId)) {
          throw new Error(
            "either user you are requesting is not present in room or is not admin of the room",
          );
        }

        return await tx.roomMember.update({
          where: {
            userId_roomId: {
              userId: data.userId,
              roomId: data.roomId,
            },
          },
          data: {
            role: "MEMBER",
          },
          select: {
            id: true,
            user: {
              select: {
                name: true,
              },
            },
            room: {
              select: {
                name: true,
              },
            },
          },
        });
      });
      res.status(200).json({
        message: `the user ${updatedMember.user.name} has degraded to member of ${updatedMember.room.name} room`,
        success: true,
        updatedMember,
      });
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({
        message: "internal server error",
        success: false,
      });
    }
  },

  async removeMemberFromRoom(req: Request, res: Response) {
    try {
      // the remover must be admin , the user should be present in room and he must not be the admin
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          message: "Unauthorized User",
          success: false,
        });
      }
      const { success, data } = removeMemberSchema.safeParse(req.params);
      if (!success) {
        return res.status(400).json({
          message: "roomId and userid required",
          success: false,
        });
      }
      const removedMember = await prisma.$transaction(async (tx) => {
        const existOfMemberAndAdmin = await tx.roomMember.findMany({
          where: {
            userId: { in: [req.user.id, data.userId] },
            roomId: data.roomId,
          },
          select: {
            userId: true,
            role: true,
          },
        });
        if(existOfMemberAndAdmin.length < 2){
          throw new Error("room or members not found");
        }
        const isAdmin = existOfMemberAndAdmin.find(
          (adm) => adm.userId === req.user.id,
        );
        const isMember = existOfMemberAndAdmin.find(
          (mem) => mem.userId === data.userId,
        );

        if (!isAdmin || isAdmin.role !== "ADMIN") {
          throw new Error("you are not admin of the room");
        }

        if (!isMember) {
          throw new Error("the user is not present in room");
        }

        if (isMember.role !== "MEMBER") {
          throw new Error(
            "the user you are requesting is not a member of room he is admin of the room",
          );
        }
        return await tx.roomMember.delete({
          where: {
            userId_roomId: {
              userId: data.userId,
              roomId: data.roomId,
            },
          },
          select: {
            user: { select: { name: true } },
            room: { select: { name: true } },
          },
        });
      });

      return res.status(200).json({
        message: `${removedMember.user.name} has been removed from the ${removedMember.room.name}`,
        success: true,
        removedMember,
      });
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({
        message: "internal server error",
        success: false,
      });
    }
  },
};

export { Rooms };
