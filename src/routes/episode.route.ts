import { Router } from "express";
import { EpisodeService } from "../services/episode.service";
import { EpisodeController } from "../controllers/episode.controller";

const episodeService = new EpisodeService();
const episodeController = new EpisodeController(episodeService);

const episodeRoutes = Router();

episodeRoutes.get('/manga/:mangaId', episodeController.getAllEpisodes)
episodeRoutes.get('/:episodeId',episodeController.getEpisodeById);

export default episodeRoutes;