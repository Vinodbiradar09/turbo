import { Request, Response } from "express";
import { cache } from "../index";
import { prisma } from "@repo/db";

const Users = {
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
};

export { Users };
