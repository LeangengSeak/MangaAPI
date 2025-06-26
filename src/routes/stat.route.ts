import { Router } from "express";
import { authorizeRole } from "../middlewares/authorizeRole";
import { StatController } from "../controllers/stat.controller";
import { StatService } from "../services/stat.service";

const statService = new StatService();
const statController = new StatController(statService); 

const statRoutes = Router();

statRoutes.use(authorizeRole('admin'))

statRoutes.get('/', statController.getStats);

export default statRoutes;