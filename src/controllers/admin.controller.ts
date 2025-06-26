import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { AdminService } from "../services/admin.service";
import { BadRequestException } from "../shared/utils/catch-errors";
import {
  ContentSchema,
  EpisodeSchema,
  MangaSchema,
} from "../shared/validators/admin.validator";
import { uploadToCloudinary } from "../shared/utils/cloudinary";
import { HTTPSTATUS } from "../config/http.config";
import { z } from "zod";

export class AdminController {
  constructor(private adminService: AdminService) {
    this.adminService = adminService;
  }

  public createContent = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      if (!req.files || !req.files.imageFile)
        throw new BadRequestException("Image file is required");

      const body = ContentSchema.parse({ ...req.body });
      const imageFile = req.files.imageFile;

      const imageUrl = await uploadToCloudinary(imageFile);

      const { content } = await this.adminService.createContent(body, imageUrl);

      return res.status(HTTPSTATUS.CREATED).json({
        message: "Content created successfully",
        data: content,
      });
    }
  );

  public deleteContent = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const contentId = z.string().parse(req.params.id);
      if (!contentId) throw new BadRequestException("Content ID is required");

      await this.adminService.deleteContent(contentId);

      return res.status(HTTPSTATUS.OK).json({
        message: "Content deleted successfully",
      });
    }
  );

  public createEpisode = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      if (!req.files || !req.files.imageFile)
        throw new BadRequestException("Image file is required");

      const body = EpisodeSchema.parse({ ...req.body });
      const imageFile = req.files.imageFile;

      const imageUrl = await uploadToCloudinary(imageFile);

      const { episode } = await this.adminService.createEpisode(body, imageUrl);

      return res.status(HTTPSTATUS.CREATED).json({
        message: "Episode created successfully",
        data: episode,
      });
    }
  );

  public deleteEpisode = asyncHandler(
      async (req: Request, res: Response): Promise<any> => {
          const episodeId = z.string().parse(req.params.id);
          if (!episodeId) throw new BadRequestException("Episode ID is required");
          
          await this.adminService.deleteEpisode(episodeId);
          
            return res.status(HTTPSTATUS.OK).json({
                message: "Episode deleted successfully",
            });
    }
  );

  public createManga = asyncHandler(
      async (req: Request, res: Response): Promise<any> => {
        if (!req.files || !req.files.imageFile)
          throw new BadRequestException("Image file is required");

        const body = MangaSchema.parse({ ...req.body }); 
        const imageFile = req.files.imageFile;

        const imageUrl = await uploadToCloudinary(imageFile);

        const { manga } = await this.adminService.createManga(body, imageUrl);

        return res.status(HTTPSTATUS.CREATED).json({
          message: "Manga created successfully",
          data: manga,
        });
    }
  );

  public deleteManga = asyncHandler(
      async (req: Request, res: Response): Promise<any> => {
          const mangaId = z.string().parse(req.params.id);
          if (!mangaId) throw new BadRequestException("Manga ID is required");

          await this.adminService.deleteManga(mangaId);
          
            return res.status(HTTPSTATUS.OK).json({
                message: "Manga deleted successfully",
            });
    }
  );
}
