import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { MangaService } from "../services/manga.service";
import { HTTPSTATUS } from "../config/http.config";
import { z } from "zod";

export class MangaController{
    constructor(private mangaService: MangaService) {
        this.mangaService = mangaService;
    }

    public getAllMangas = asyncHandler(async (req: Request, res: Response): Promise<any> => {

        const query = req.query

        const { mangas } = await this.mangaService.getAllMangas(query);

        return res.status(HTTPSTATUS.OK).json({
          message: "All mangas fetched successfully",
          mangas
        });
        
    })

    public getMangaById = asyncHandler(async (req: Request, res: Response): Promise<any> => {

        const mangaId = z.string().parse(req.params.mangaId);

        if (!mangaId) {
            return res.status(HTTPSTATUS.BAD_REQUEST).json({
                message: "Manga ID is required"
            });
        }

        const manga = await this.mangaService.getMangaById(mangaId);

        return res.status(HTTPSTATUS.OK).json({
            message: "Manga fetched successfully",
            manga
        });
        
    })
}