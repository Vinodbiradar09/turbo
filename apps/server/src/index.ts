import "dotenv/config";
import cors from "cors";
import http from "http";
import express from "express";
import { roomRouter } from "./rooms/r";
import { RedisCache, RedisPubSub } from "@repo/redis";
const app = express();
const server = http.createServer(app);
export const cache = new RedisCache();
export const pubsub = new RedisPubSub();
import { RoomConnectioManager } from "./w";
import { userRouter } from "./users/r";

app.use(
  cors({
    origin: process.env.WEB_URL,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/rooms", roomRouter);
app.use("/api/v1/users", userRouter);

new RoomConnectioManager(server);
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`server is running at http://localhost:${PORT}`);
});
