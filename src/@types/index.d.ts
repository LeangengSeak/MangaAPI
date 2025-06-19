import { UserPreferences } from "typescript";
import { UserDocument } from "../models/user.model";
import { Request } from "express";
import { Role } from "../shared/utils/role-hierarchy";

declare global {
  namespace Express {
    interface User extends UserDocument {}
    interface Request {
      user?: User;
      sessionId?: string;
    }
  }
}
