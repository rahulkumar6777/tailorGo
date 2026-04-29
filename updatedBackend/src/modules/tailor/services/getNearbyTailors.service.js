import { model } from '../../../models/index.js';

export const getNearbyTailors = async (data) => {

    const { lat, lng, radius } = data

    const parselat = parseFloat(lat);
    const parselng = parseFloat(lng);
    const parseradius = parseFloat(radius || 10);

    const tailors = await model.Tailor.aggregate([
        {
            $geoNear: {
                key: "shopCoordinates",
                near: {
                    type: "Point",
                    coordinates: [parselng, parselat],
                },
                distanceField: "distance",
                maxDistance: parseradius * 1000,
                spherical: true,
            },
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                shopName: 1,
                shopAddress: 1,
                rating: 1,

                minPrice: { $min: "$servicesOffered.price" },

                image: {
                    $arrayElemAt: ["$workExperiencePhotos.photo", 0]
                },

                distance: {
                    $round: [{ $divide: ["$distance", 1000] }, 2]
                }
            },
        },
        {
            $sort: { distance: 1 }
        },
        {
            $limit: 20
        }
    ]);

    return tailors;
}