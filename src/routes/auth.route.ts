import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();
const authController = new AuthController(authService);

const authRoutes = Router();

authRoutes.post('/register', authController.register)

export default authRoutes