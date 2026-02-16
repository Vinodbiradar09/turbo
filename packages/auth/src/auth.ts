import { prisma } from "@repo/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from 'better-auth/adapters/prisma'

export const auth = betterAuth({
    baseURL : process.env.BETTER_AUTH_URL,
    secret : process.env.BETTER_AUTH_SECRET,
    database : prismaAdapter(prisma , {
        provider : "postgresql",
    }),
    emailAndPassword : {
        enabled : true,
    },
   socialProviders : {
    google : {
        clientId : process.env.GOOGLE_CLIENT_ID!,
        clientSecret : process.env.GOOGLE_CLIENT_SECRET!,
    },
    github : {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }
   }
})

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;

export type AuthSession = {
  session: Session;
  user: User;
};
