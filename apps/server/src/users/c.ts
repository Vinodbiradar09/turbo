import { Request, Response } from "express";
import { cache } from "@repo/redis";
import { prisma } from "@repo/db";
import { uniqueNamesGenerator, starWars, names } from "unique-names-generator";
import { AppError } from "../error";
import { blacklistRoomSchema, reportUser } from "@repo/zod";
const uniqueName = () => {
  return uniqueNamesGenerator({
    dictionaries: [names, starWars],
    separator: "-",
    style: "capital",
  });
};

const Users = {
  // getUser
  // assignUniqueName
  // blackListUser

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
      if (user?.isBlacklisted) {
        return res.status(409).json({
          message: `your acccount has been suspended until ${user.suspendedUntil?.toISOString()}`,
          success: false,
        });
      }
      return res.status(200).json({
        message: "user got",
        success: true,
        user: {
          id: user?.id,
          name: user?.name,
          email: user?.email,
          image: user?.image,
        },
      });
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({
        message: "internal server errro",
        success: false,
      });
    }
  },

  async assignUniqueName(req: Request, res: Response) {
    try {
      // the user should be exists and email verified
      // the name is assigned based on the email and other stuff
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
      const newName = await prisma.user.update({
        where: {
          id: user?.id,
        },
        data: {
          name: uniqueName(),
        },
      });
      // after generating the name cache delete
      await cache.del("user", [req.user.id]);
      return res.status(200).json({
        message: "your name has been generated",
        success: true,
        user: newName,
      });
    } catch (error) {
      console.log("error", error);
      return res.status(200).json({
        message: "internal server error",
        success: false,
      });
    }
  },

  async reportUser(req: Request, res: Response) {
    try {
      if (!req.user.id) {
        return res.status(401).json({
          message: "Unauthorized User",
          success: false,
        });
      }
      const { userId } = req.params;
      if (!userId || Array.isArray(userId)) return;
      const { success, data } = reportUser.safeParse(req.body);
      if (!success) {
        return res.status(400).json({
          message: "reason required",
          success: false,
        });
      }
      // first the check the reporter is blacklisted or not
      const isUserBlacklisted = await prisma.user.findFirst({
        where: {
          id: req.user.id,
          isBlacklisted: true,
        },
      });
      if (isUserBlacklisted) {
        return res.status(409).json({
          message: "you are blacklisted",
          success: false,
        });
      }

      const isReported = await prisma.blacklistUser.findUnique({
        where: {
          reportedUserId_reportedById: {
            reportedById: req.user.id,
            reportedUserId: userId,
          },
        },
      });
      if (isReported) {
        return res.status(200).json({
          message: "your have reported this user earlier",
          success: true,
        });
      }
      await prisma.blacklistUser.create({
        data: {
          reportedUserId: userId,
          reportedById: req.user.id,
          reason: data.reason,
        },
      });
      return res.status(200).json({
        message: "you have successfully reported user",
        success: true,
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
        message: "internal server error",
        success: false,
      });
    }
  },
};

export { Users };
