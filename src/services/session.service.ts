import SessionModel from "../models/session.model";
import { NotFoundException } from "../shared/utils/catch-errors";

export class SessionService {
  public getAllSessions = async (userId: string) => {
    const sessions = await SessionModel.find(
      {
        userId,
        expiredAt: { $gt: Date.now() },
      },
      {
        _id: 1,
        userId: 1,
        userAgent: 1,
        createdAt: 1,
        expiredAt: 1,
      },
      {
        sort: { createdAt: -1 },
      }
    );    
    return { sessions };
  };
  public getSessionById = async (sessionId: string) => {
    const session = await SessionModel.findById(sessionId)
      .populate("userId")
      .select("-expiredAt");

    if (!session) throw new NotFoundException("Session not found.");

    const { userId: user } = session;

    return { user };
  };
  public deleteSession = async (sessionId: string, userId: string) => {
    const deletedSession = await SessionModel.findByIdAndDelete({
      _id: sessionId,
      userId: userId,
    });
    if (!deletedSession)
      throw new NotFoundException("Session not found or already deleted.");

    return;
  };
}
