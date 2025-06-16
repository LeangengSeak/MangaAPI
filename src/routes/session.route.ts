import { Router } from "express";
import { SessionController } from "../controllers/session.controller";
import { SessionService } from "../services/session.service";

const sessionRoutes = Router();

const sessionService = new SessionService()
const sessionController = new SessionController(sessionService)

sessionRoutes.get('/all', sessionController.getAllSessions)

sessionRoutes.get("/", sessionController.getSession);

sessionRoutes.delete('/:sessionId', sessionController.deleteSession)

export default sessionRoutes;