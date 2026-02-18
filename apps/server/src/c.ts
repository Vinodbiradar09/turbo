import { prisma } from "@repo/db";
import { Request, Response } from "express";
import { cache } from "./index";
import { roomSchema, joinRoomSchema, roomMemberSchema, makeAdminSchema } from "@repo/zod";

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
      const { success, data } = roomSchema.safeParse(req.body);
      if (!success) {
        return res.status(403).json({
          error: "room details required",
          success: false,
        });
      }
      await prisma.$transaction(async (tx) => {
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
      });

      return res.status(200).json({
        message: "Room created",
        success: true,
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
    const { success, data } = joinRoomSchema.safeParse(req.body);
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
      const body = req.body;
      const { success, data } = roomMemberSchema.safeParse(body);
      if (!success) {
        return res.status(400).json({
          message: "room member id is required",
          success: false,
        });
      }
      const isRoomMember = await prisma.roomMember.findUnique({
        where: {
          userId_roomId: {
            roomId: data.roomMemberId,
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
            roomId: data.roomMemberId,
          },
        },
      });
      return res.status(200).json({
        message: "you left the room successfully",
        success: true,
      });
    } catch (error) {}
  },

  async makeRoomMemberToAdmin( req : Request , res : Response){
    try {
      if(!req.user || !req.user.id){
        return res.status(401).json({
          message : "Unauthorized User",
          success : false,
        })
      }
      const body = req.body; 
      const { success , data } = makeAdminSchema.safeParse(body);
      if (!success) {
        return res.status(400).json({
          message: "room id and userId is required",
          success: false,
        });
      }
      await prisma.$transaction(async( tx )=>{
       const room =  await tx.room.findUnique({
          where : {
            id : data.roomId
          },
        })

        if(!room ){
          return res.status(404).json({
            message : "room not found",
            success : false,
          })
        }

        const checkIfRequesterIsAdmin = await tx.roomMember.findFirst({
          where : {
            userId : req.user.id,
            roomId : data.roomId,
            role : "ADMIN",
          },
        })

        if(!checkIfRequesterIsAdmin){
          return res.status(400).json({
            message : "you are not admin of the room",
            success : false
          })
        }

        const isMemberExists = await tx.roomMember.findUnique({
          where : {
            userId_roomId : {
              userId : data.userId,
              roomId : data.roomId,
            }
          },
          select : {
            role : true,
          }
        })
        
        if(!isMemberExists){
          return res.status(404).json({
            message : "the user you are requesting is not present in the room",
            success : false,
          })
        }
        
        if(isMemberExists.role === "ADMIN"){
          return res.status(400).json({
            message : "the user you are requesting is already admin of the room",
            success : false,
          })
        }

        const getAdminCount = await tx.roomMember.count({
          where : {
            role : "ADMIN",
          }
        })
        if(getAdminCount >= 5){
          return res.status(400).json({
            message : "room can have 5 admins only",
            success : false
          })
        }

        await tx.roomMember.update({
          where : {
            userId_roomId : {
              roomId : data.roomId,
              userId : data.roomId,
            }
          },
          data : {
            role : "ADMIN",
          }
        })
      })
      return res.status(200).json({
        message : "the requested user as upgrade to room admin",
        success : true
      })
    } catch (error) {
      console.log("error" , error);
      return res.status(500).json({
        message : "internal server error",
        success : false,
      })
    }
  },

  async getUser(req: Request, res: Response) {
    try {
      const user = await cache.getOrSet(
        "user",
        [req.user.id],
        async () => {
          return await prisma.user.findUnique({
            where: {
              id: req.user.id,
            },
          });
        },
        { ttl: 300, lockTTL: 10 },
      );

      return res.status(200).json({
        message: "user got",
        success: true,
        user,
      });
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({
        error: "internal server error",
        success: false,
      });
    }
  },
};

export { Rooms };
