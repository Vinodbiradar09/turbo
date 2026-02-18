import { z } from "zod";

const roomSchema = z.object({
    name : z.string().min(1 , "Name is required"),
    img : z.instanceof(File).optional(),
})

const joinRoomSchema = z.object({
    roomId : z.string(),
})

const roomMemberSchema = z.object({
    roomMemberId : z.string(),
})

const makeAdminSchema = z.object({
    roomId : z.string(),
    userId : z.string(),
})
export { roomSchema , joinRoomSchema , roomMemberSchema , makeAdminSchema };