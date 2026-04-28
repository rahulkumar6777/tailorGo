import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { ENV } from '../../lib/env.js';


cloudinary.config({
    cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
    api_key: ENV.CLOUDINARY_API_KEY,
    api_secret: ENV.CLOUDINARY_API_SECRET
});

const safeUnlink = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

const optimizeImageToWebp = async (filePath) => {
    const parsedPath = path.parse(filePath);
    const optimizedPath = path.join(parsedPath.dir, `${parsedPath.name}-optimized.webp`);

    await sharp(filePath)
        .rotate()
        .resize({
            width: 1920,
            height: 1920,
            fit: 'inside',
            withoutEnlargement: true
        })
        .webp({
            quality: 85,
            effort: 6,
            smartSubsample: true
        })
        .toFile(optimizedPath);

    return optimizedPath;
}

export const uploadOnCloudinary = async (filePath) => {
    let optimizedPath;

    try {

        if (!filePath) return null;

        optimizedPath = await optimizeImageToWebp(filePath);

        const response = await cloudinary.uploader.upload(optimizedPath, {
            resource_type: 'image'
        })

        safeUnlink(filePath);
        safeUnlink(optimizedPath);

        return response;

    } catch (error) {
        safeUnlink(optimizedPath);
        throw error;
    }
}

export const deleteFromCloudinary = async (publicId) => {
    try {

        if (!publicId) return null;

        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: 'image'
        })

        return response;

    } catch (error) {
        throw error;
    }
}
