import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import { asyncHandler } from "../middlewares/asyncHandler";
import { UserService } from "../services/user.service";
import { BadRequestException } from "../shared/utils/catch-errors";
import {
  updateDataSchema,
  updatePasswordSchema,
} from "../shared/validators/user.validator";
import { HTTPSTATUS } from "../config/http.config";
import { uploadToCloudinary } from "../shared/utils/cloudinary";
import { extractAndValidateFile } from "../shared/utils/fileValidation";

export class UserController {
  constructor(private userService: UserService) {
    this.userService = userService;
  }

  public updateInfo = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      if (!req.user) throw new BadRequestException("User not authenticated");

      const userId = req.user.id;
      const updateData = updateDataSchema.parse(req.body);
      const updatedUser = await this.userService.updateInfo(userId, updateData);

      return res.status(HTTPSTATUS.OK).json({
        message: "User information updated successfully",
        user: updatedUser,
      });
    }
  );

  public updateAvatar = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      if (!req.user) throw new BadRequestException("User not authenticated");

      const userId = req.user.id;

      if (!req.files || !req.files.avatar) {
        throw new BadRequestException("Avatar file is required");
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      const avatarFile = extractAndValidateFile(
        "avatar",
        req.files,
        allowedTypes
      );

      const avatarUrl = await uploadToCloudinary(avatarFile);
      const updatedUser = await this.userService.updateAvatar(
        userId,
        avatarUrl
      );

      return res.status(HTTPSTATUS.OK).json({
        message: "Avatar updated successfully",
        user: updatedUser,
      });
    }
  );

  public deleteAvatar = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      if (!req.user) throw new BadRequestException("User not authenticated");

      const userId = req.user.id;

      const updatedUser = await this.userService.deleteAvatar(userId);

      return res.status(HTTPSTATUS.OK).json({
        message: "Avatar deleted successfully",
      });
    }
  );

  public updatePassword = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      if (!req.user) throw new BadRequestException("User not authenticated");

      const userId = req.user.id;
      const updatePassword = updatePasswordSchema.parse(req.body);
      const updatedUser = await this.userService.updatePassword(
        userId,
        updatePassword
      );

      return res.status(HTTPSTATUS.OK).json({
        message: "Password updated successfully",
      });
    }
  );
}
