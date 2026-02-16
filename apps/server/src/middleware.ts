import { auth } from "@repo/auth";
import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
dotenv.config();

export async function AuthHandler(req : Request , res : Response , next : NextFunction) {
    try {
        const header = req.headers.authorization;
        if(!header || !header.startsWith("Bearer ")){
            return res.status(401).json({
                error : "No token provided",
                success : false,
            })
        }
        const token = header.split(" ")[1];
        console.log("token" , token);
        const session = await auth.api.getSession({
            headers : {
                authorization : `Bearer ${token}`,
            }
        })
        if(!session || !session.user || !session.session){
            return res.status(401).json({
                error : "Invalid session , Authentication Required",
                success : false,
            })
        }
        
        req.user = session.user;
        req.session = session.session;
        next();
    } catch (error) {
        console.log("error in auth handler " , error);
        return res.status(401).json({
            error : "Invalid or expired session",
            success : false,
        })
    }
}