import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { FavoriteService } from "../services/favorite.service";
import { BadRequestException } from "../shared/utils/catch-errors";
import { z } from "zod";
import { HTTPSTATUS } from "../config/http.config";

export class FavoriteController{
    constructor(private favoriteService: FavoriteService) {
        this.favoriteService = favoriteService;
    }

    public addFavorite = asyncHandler(async (req: Request, res: Response): Promise<any> => {
        
        if (!req.user || !req.user.id) {
            throw new BadRequestException("User ID is required");
        }

        const userId = req.user.id; 
        const mangaId = z.string().parse(req.body.mangaId);

        if (!mangaId) {
            throw new BadRequestException("Manga ID is required");
        }

        const favorite = await this.favoriteService.addFavorite(userId, mangaId);

        return res.status(HTTPSTATUS.CREATED).json({
            message: "Favorite added successfully",
            favorite
        })
    })

    public removeFavorite = asyncHandler(async (req: Request, res: Response): Promise<any> => {
        if (!req.user || !req.user.id) {
            throw new BadRequestException("User ID is required");
        }

        const userId = req.user.id; 
        const favoriteId = z.string().parse(req.params.id);

        if (!favoriteId) {
            throw new BadRequestException("Manga ID is required");
        }

        await this.favoriteService.removeFavorite(userId, favoriteId);

        return res.status(HTTPSTATUS.OK).json({
            message: "Favorite removed successfully",
        })
        
    })

    public getFavorites = asyncHandler(async (req: Request, res: Response): Promise<any> => {
        if (!req.user || !req.user.id) {
            throw new BadRequestException("User ID is required");
        }

        const userId = req.user.id; 

        const favorites = await this.favoriteService.getFavorites(userId);

        return res.status(HTTPSTATUS.OK).json({
            message: "Favorites fetched successfully",
            favorites
        })
        
    })
}
