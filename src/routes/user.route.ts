import { Router } from "express";
import { UserService } from "../services/user.service";
import { UserController } from "../controllers/user.controller";

const userService = new UserService();
const userController = new UserController(userService);

const userRoutes = Router();

userRoutes.put('/info', userController.updateInfo)
userRoutes.put('/avatar', userController.updateAvatar)
userRoutes.delete('/avatar', userController.deleteAvatar)
userRoutes.put('/password', userController.updatePassword)

export default userRoutes;