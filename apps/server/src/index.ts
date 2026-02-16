import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { auth } from "@repo/auth";
import { AuthHandler } from "./middleware";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
    origin : process.env.WEB_URL || "http://localhost:3000",
    credentials : true,
}));

app.use(express.json());
app.use(express.urlencoded({extended : true}));


app.get("/" , AuthHandler ,async(req : Request , res : Response)=>{
    try {
        const user = req.user;
        console.log("user" , user);
        return res.status(200).json({
            message : "user found",
            success : false,
            user,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error : "internal server error",
            success : false,
        })
    }
})

app.get("/api/protected", AuthHandler, (req, res) => {
  const user = req.user;
  res.json({ 
    message: "This is a protected route",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    timestamp: new Date().toISOString(),
  });
});


app.listen(PORT , ()=>{
    console.log(`server is running at http://localhost:${PORT}`);
})