import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";
import { roomRouter } from "./rooms/r";
import { userRouter } from "./users/r";
import { messageRouter } from "./messages/r";

export function createHttpApp(): Express {
  const app = express();
  app.use(
    cors({
      origin: process.env.WEB_URL,
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(helmet());
  app.use("/api/v1/rooms", roomRouter);
  app.use("/api/v1/users", userRouter);
  app.use("/api/v1/messages", messageRouter);

  return app;
}
