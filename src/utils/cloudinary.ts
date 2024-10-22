import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from "../constants";
import logger from "./logger";

// Configuration
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadToCloudinary = async (localFilePath: string) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    logger.info("File uploaded on cloudinary. File src: " + response.url);

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    logger.error("Could not upload to Cloudinary: ", error);
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteFromCloudinary = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info("Deleted from Cloudinary, Public_ID: ", publicId);
  } catch (error) {
    logger.error("Error Deleting from Cloudinary");
    return null;
  }
};

export { uploadToCloudinary, deleteFromCloudinary };
