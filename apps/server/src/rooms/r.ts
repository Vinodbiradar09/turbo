import { Router } from "express";
import { AuthHandler } from "../middleware";
import { Rooms } from "./c";
const roomRouter = Router();

roomRouter.get("/", AuthHandler, Rooms.getRoomsNearMe);
roomRouter.post("/", AuthHandler, Rooms.createRoom);
roomRouter.post("/:roomId/join", AuthHandler, Rooms.joinRoom);
roomRouter.delete("/:roomId/leave", AuthHandler, Rooms.leaveRoom);
roomRouter.patch(
  "/:roomId/members/:userId/promote",
  AuthHandler,
  Rooms.makeRoomAdmins,
);
roomRouter.delete("/:roomId", AuthHandler, Rooms.deleteRoom);
roomRouter.patch(
  "/:roomId/admins/:userId/degrade",
  AuthHandler,
  Rooms.degradeRoomAdmins,
);
roomRouter.delete("/:roomId/members", AuthHandler, Rooms.removeRoomMembers);
roomRouter.get("/:roomId/messages", AuthHandler, Rooms.getRoomMessages);
roomRouter.get("/:roomId/members", AuthHandler, Rooms.getRoomMembers);
roomRouter.post("/:roomId/report", AuthHandler, Rooms.reportRoom);
export { roomRouter };
