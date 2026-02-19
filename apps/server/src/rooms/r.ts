import { Router } from "express";
import { AuthHandler } from "../middleware";
import { Rooms } from "./c";
const roomRouter = Router();

roomRouter.get("/", AuthHandler, Rooms.getRooms);
roomRouter.post("/", AuthHandler, Rooms.createRoom);
roomRouter.post("/:roomId/join", AuthHandler, Rooms.joinRoom);
roomRouter.delete("/:roomId/leave", AuthHandler, Rooms.leaveRoom);
roomRouter.patch(
  "/:roomId/members/:userId/promote",
  AuthHandler,
  Rooms.makeRoomMemberToAdmin,
);
roomRouter.delete("/:roomId", AuthHandler, Rooms.deleteRoom);
roomRouter.patch(
  "/:roomId/admins/:userId/degrade",
  AuthHandler,
  Rooms.degradeAdminToMember,
);
roomRouter.delete(
  "/:roomId/members/:userId",
  AuthHandler,
  Rooms.removeMemberFromRoom,
);

export { roomRouter };
