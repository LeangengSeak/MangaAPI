import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { SessionService } from "../services/session.service";
import { HTTPSTATUS } from "../config/http.config";
import { NotFoundExpection } from "../shared/utils/catch-errors";
import { boolean, z } from "zod";

export class SessionController {
  constructor(private sessionService: SessionService) {
    this.sessionService = sessionService;
  }

  public getAllSessions = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const userId = req.user?.id;
      const sessionId = req.sessionId;
      console.log("userId", req.user, "sessionId", sessionId);
      console.log('userid  dddd', userId);

      const { sessions } = await this.sessionService.getAllSessions(userId);

      if(sessions.length === 0) throw new NotFoundExpection("No sessions found for this user.");

      const modifySessions = sessions.map((session) => ({
        ...session.toObject(),
          ...(session.id === sessionId && { isCurrent: true })
      }));
      console.log(sessions.length)
      return res.status(HTTPSTATUS.OK).json({
        message: "All sessions fetched successfully",
        sessions: modifySessions,
      });
    }
  );

  public getSession = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const sessionId = req?.sessionId;

      if (!sessionId)
        throw new NotFoundExpection(
          "Session ID not found. Please login again."
        );

      const { user } = await this.sessionService.getSessionById(sessionId);

      return res.status(HTTPSTATUS.OK).json({
        message: "Session fetched successfully",
        user,
      });
    }
  );

  public deleteSession = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const sessionId = z.string().parse(req.params.sessionId);
      const userId = req.user?.id;
      console.log(userId, sessionId);

      await this.sessionService.deleteSession(sessionId, userId);

      return res.status(HTTPSTATUS.OK).json({
        message: "Session deleted successfully",
      });
    }
  );
}
