import { Request, Response, NextFunction } from "express";
import { ForbiddenException } from "../shared/utils/catch-errors";
import { ErrorCode } from "../shared/enums/error-code.enum";
import { logger } from "../shared/utils/logger";

type Roles = "user" | "admin";

export const authorizeRole = (role: Roles) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id || "unknown";
    const userEmail = req.user?.email || "unknown";
    const ip = req.ip || "unknown IP";
    const userAgent = req.headers["user-agent"] || "unknown user-agent";

    if (!req.user || req.user.role !== role) {
      logger.warn(
        `Access denied for user ID: ${userId}, Email: ${userEmail}, IP: ${ip}, User-Agent: ${userAgent}. Required role: ${role} `
      );

      throw new ForbiddenException(
        `Access denied. Required role: ${role}`,
        ErrorCode.ACCESS_FORBIDDEN
      );

    }
    
    next();
  };
};
