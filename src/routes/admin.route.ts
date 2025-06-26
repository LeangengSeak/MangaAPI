import { Router } from "express";
import { authorizeRole } from "../middlewares/authorizeRole";
import { AdminController } from "../controllers/admin.controller";
import { AdminService } from "../services/admin.service";

const adminService = new AdminService()
const adminController = new AdminController(adminService)

const adminRoutes = Router();

adminRoutes.use(authorizeRole('admin'))

adminRoutes.post('/content', adminController.createContent)
adminRoutes.delete('/content/:id', adminController.deleteContent)

adminRoutes.post('/episode', adminController.createEpisode)
adminRoutes.delete('/episode/:id', adminController.deleteEpisode)

adminRoutes.post('/manga', adminController.createManga)
adminRoutes.delete('/manga/:id', adminController.deleteManga)

export default adminRoutes;