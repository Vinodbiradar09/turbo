import { z } from "zod";

const createRoomSchema = z.object({
    name : z.string().min(1 , "Name is required"),
    img : z.instanceof(File).optional(),
})

const joinRoomSchema = z.object({
    roomId : z.string(),
})

const leaveRoomSchema = z.object({
    roomId : z.string(),
})

const makeAdminSchema = z.object({
    roomId : z.string(),
    userId : z.string(),
})

const degradeAdminSchema = z.object({
    roomId : z.string(),
    userId : z.string(),
})

const deleteRoomSchema = z.object({
    roomId : z.string(),
})

const removeMemberSchema = z.object({
    roomId : z.string(),
    userId : z.string(),
})
export { createRoomSchema , joinRoomSchema , leaveRoomSchema , makeAdminSchema , deleteRoomSchema , degradeAdminSchema , removeMemberSchema };