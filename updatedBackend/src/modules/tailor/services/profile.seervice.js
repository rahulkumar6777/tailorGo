import { model } from "../../../models/index.js";
import { redisClient } from '../../../core/redis/redis.js';

export const tailorProfile = async (data) => {
    const { username } = data;
    const cacheKey = `tailorProfile:${username}`;

    
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        return JSON.parse(cachedData);
    }

    
    const tailorData = await model.Tailor.findOne({ username })
        .select("fullName username yearsOfExperience avatar shopName shopAddress servicesOffered rating status verificationStatus workExperiencePhotos");

    if (!tailorData) {
        const err = new Error("Tailor Not Found With this username");
        err.status = 400;
        throw err;
    }

    
    const workExperiencePhotos = (tailorData.workExperiencePhotos || []).map(p => p.photo);

    
    const tailorReviewsData = await model.Review.find({ tailor: tailorData._id })
        .select("reviewerName rating comment createdAt")
        .sort({ createdAt: -1 })
        .limit(10);


    const response = {
        tailor: {
            ...tailorData.toObject(),
            workExperiencePhotos
        },
        reviews: tailorReviewsData
    };

    
    await redisClient.set(
        cacheKey,
        JSON.stringify(response),
        "EX",
        60 * 60 * 2
    );

    return response;
};