import { Router } from "express";
import { AuthHandler } from "../middleware";
import { Users } from "./c";

const userRouter = Router();

userRouter.get("/", AuthHandler, Users.getUser);
userRouter.patch("/name", AuthHandler, Users.assignUniqueName);
userRouter.post("/:userId/report", AuthHandler, Users.reportUser);
userRouter.post("/:roomId/report", AuthHandler, Users.reportRoom);
export { userRouter };
