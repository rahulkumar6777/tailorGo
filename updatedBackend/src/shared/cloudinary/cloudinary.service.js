import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import { ENV } from '../../lib/env.js';


cloudinary.config({
    cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
    api_key: ENV.CLOUDINARY_API_KEY,
    api_secret: ENV.CLOUDINARY_API_SECRET
});


export const uploadOnCloudinary = async (filePath) => {
    try {

        if (!filePath) return null;

        const response = await cloudinary.uploader.upload(filePath, {
            resource_type: 'auto'
        })

        fs.unlinkSync(filePath);

        return response;

    } catch (error) {
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