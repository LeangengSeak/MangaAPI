import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { StatService } from "../services/stat.service";
import { HTTPSTATUS } from "../config/http.config";

export class StatController{
    constructor(private statService: StatService) {
        this.statService = statService
    }

    public getStats = asyncHandler(async (req: Request, res: Response): Promise<any> => {
        const stats = await this.statService.getStats();
        
        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Statistics retrieved successfully",
            data: stats
        });
        
    })
}