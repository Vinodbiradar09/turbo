import { Router } from "express";
import { AuthHandler } from "../middleware";
import { Users } from "./c";

const userRouter = Router();

userRouter.get("/", AuthHandler, Users.getUser);

export { userRouter };

