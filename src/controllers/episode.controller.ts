import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { EpisodeService } from "../services/episode.service";
import { z } from "zod";
import { BadRequestException } from "../shared/utils/catch-errors";
import { HTTPSTATUS } from "../config/http.config";
import MangaModel from "../models/manga.model";

export class EpisodeController {
    constructor(private episodeService: EpisodeService) {
        this.episodeService = episodeService;
    }

    public getAllEpisodes = asyncHandler(async (req: Request, res: Response): Promise<any> => {
        const mangaId = z.string().parse(req.params.mangaId);

        if (!mangaId) {
         throw new BadRequestException("Manga ID is required");
        }

        const { episodes } = await this.episodeService.getAllEpisodes(mangaId);

        return res.status(HTTPSTATUS.OK).json({
            message: "All episodes fetched successfully",
            episodes
        });
        
    })

    public getEpisodeById = asyncHandler(async (req: Request, res: Response): Promise<any> => { 
        const episodeId = z.string().parse(req.params.episodeId);

        if (!episodeId) 
         throw new BadRequestException("Episode ID is required");

        if (!req.user || !req.user.id) throw new BadRequestException("User ID is required");
        
        const userId = req.user.id;

        const { episode } = await this.episodeService.getEpisodeById(episodeId, userId);

        const manga = await MangaModel.findById(episode[0].mangaId);

        if (!manga) throw new BadRequestException("Manga not found for this episode");

        if (!manga.viewedBy.includes(userId)) { 
            manga.views += 1
            manga.viewedBy.push(userId);
            await manga.save();
        }

        return res.status(HTTPSTATUS.OK).json({
            message: "Episode fetched successfully",
            episode
        });
    })
}