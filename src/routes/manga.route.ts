import { Router } from "express";
import { MangaService } from "../services/manga.service";
import { MangaController } from "../controllers/manga.controller";

const mangaService = new MangaService();
const mangaController = new MangaController(mangaService);

const mangaRoutes = Router();

mangaRoutes.get("/", mangaController.getAllMangas);
mangaRoutes.get("/:mangaId", mangaController.getMangaById);

export default mangaRoutes;
