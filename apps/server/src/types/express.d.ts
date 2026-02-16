import type { User , Session } from "@repo/auth";

declare global {
  namespace Express {
    interface Request {
      user: User;
      session: Session;
    }
  }
}

export {};
