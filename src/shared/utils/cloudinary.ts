import cloudinary from "../../config/cloudinary";
import { UploadedFile } from "express-fileupload";

interface CloudinaryUploadResult {
  secure_url: string;
}

type CloudinaryUploader = {
  upload: (
    file: string,
    options: { resource_type: "auto" | "image" | "video" | "raw" }
  ) => Promise<CloudinaryUploadResult>;
};

export const uploadToCloudinary = async (
  file: UploadedFile | UploadedFile[]
): Promise<string> => {
  try {
    let filePath: string;

    if (Array.isArray(file)) {

        if (file.length === 0) {
        throw new Error("No files provided");
      }
      filePath = file[0].tempFilePath;
    } else {
      filePath = file.tempFilePath;
    }

    const result = await (cloudinary.uploader as CloudinaryUploader).upload(
      filePath,
      {
        resource_type: "auto",
      }
    );

    return result.secure_url;
  } catch (error) {
    console.error(
      `Error in uploadToCloudinary: ${error instanceof Error ? error.message : error}`
    );
    throw new Error("Error uploading to Cloudinary!");
  }
};
