import { Router } from "express";
import { UserService } from "../services/user.service";
import { UserController } from "../controllers/user.controller";
import { authorizeRole } from "../middlewares/authorizeRole";

const userService = new UserService();
const userController = new UserController(userService);

const userRoutes = Router();

userRoutes.put('/info', userController.updateInfo)
userRoutes.put('/avatar', userController.updateAvatar)
userRoutes.delete('/avatar', userController.deleteAvatar)
userRoutes.put('/password', userController.updatePassword)

userRoutes.delete('/user/delete', authorizeRole('user'), userController.deleteAccount)

export default userRoutes;