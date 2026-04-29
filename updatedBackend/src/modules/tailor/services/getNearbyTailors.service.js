import { model } from '../../../models/index.js';

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildTailorMatch = ({ location, outfit }) => {
    const match = {};

    if (location?.trim()) {
        const locationRegex = new RegExp(escapeRegex(location.trim()), 'i');

        match.$or = [
            { shopAddress: locationRegex },
            { shopName: locationRegex },
            { fullName: locationRegex },
            { username: locationRegex }
        ];
    }

    if (outfit?.trim()) {
        match.servicesOffered = {
            $elemMatch: {
                serviceType: new RegExp(escapeRegex(outfit.trim()), 'i')
            }
        };
    }

    return match;
};

const projectTailorCard = {
    fullName: 1,
    username: 1,
    shopName: 1,
    shopAddress: 1,
    rating: 1,
    yearsOfExperience: 1,
    servicesOffered: 1,

    minPrice: { $min: "$servicesOffered.price" },

    image: {
        $arrayElemAt: ["$workExperiencePhotos.photo", 0]
    },
};

export const getNearbyTailors = async (data) => {

    const { lat, lng, radius, location, outfit } = data

    const parseradius = parseFloat(radius || 10);
    const match = buildTailorMatch({ location, outfit });
    const hasCoordinates = lat !== undefined && lng !== undefined;

    if (!hasCoordinates) {
        return model.Tailor.aggregate([
            {
                $match: match
            },
            {
                $project: {
                    ...projectTailorCard,
                    distance: null
                }
            },
            {
                $sort: { rating: -1, minPrice: 1 }
            },
            {
                $limit: 20
            }
        ]);
    }

    const parselat = parseFloat(lat);
    const parselng = parseFloat(lng);

    return model.Tailor.aggregate([
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
                query: match,
            },
        },
        {
            $project: {
                ...projectTailorCard,

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
}
