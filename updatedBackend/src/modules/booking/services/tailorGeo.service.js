import { redisClient } from "../../../core/redis/redis.js";
import { model } from "../../../models/index.js";

const TAILOR_GEO_KEY = "tailorgo:geo:verified-tailors";
const TAILOR_GEO_SYNC_KEY = "tailorgo:geo:verified-tailors:synced";
const GEO_SYNC_TTL_SECONDS = 10 * 60;

export const DEFAULT_BROADCAST_RADIUS_KM = 15;
export const FALLBACK_TAILOR_LIMIT = 15;
const REDIS_NEARBY_LIMIT = 100;

const normalizeServiceText = (value = "") => String(value)
  .toLowerCase()
  .trim()
  .replace(/\s+/g, " ");

const isVerifiedActiveTailor = (tailor) => (
  tailor?.status === "active" && tailor?.verificationStatus === "verified"
);

const getTailorCoordinates = (tailor) => {
  const coordinates = tailor?.shopCoordinates?.coordinates || [];
  const lng = Number(coordinates[0]);
  const lat = Number(coordinates[1]);

  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
};

export const cacheTailorInRedis = async (tailor) => {
  if (!isVerifiedActiveTailor(tailor)) return;

  const coordinates = getTailorCoordinates(tailor);
  if (!coordinates) return;

  await redisClient.geoadd(
    TAILOR_GEO_KEY,
    coordinates.lng,
    coordinates.lat,
    tailor._id.toString()
  );
};

export const refreshTailorGeoIndex = async ({ force = false } = {}) => {
  if (!force) {
    const alreadySynced = await redisClient.get(TAILOR_GEO_SYNC_KEY);
    if (alreadySynced) return;
  }

  const tailors = await model.Tailor.find({
    status: "active",
    verificationStatus: "verified",
    "shopCoordinates.coordinates.0": { $exists: true },
    "shopCoordinates.coordinates.1": { $exists: true }
  }).select("_id shopCoordinates status verificationStatus");

  const pipeline = redisClient.pipeline();
  pipeline.del(TAILOR_GEO_KEY);

  for (const tailor of tailors) {
    const coordinates = getTailorCoordinates(tailor);
    if (!coordinates) continue;

    pipeline.geoadd(
      TAILOR_GEO_KEY,
      coordinates.lng,
      coordinates.lat,
      tailor._id.toString()
    );
  }

  pipeline.set(TAILOR_GEO_SYNC_KEY, String(Date.now()), "EX", GEO_SYNC_TTL_SECONDS);
  await pipeline.exec();
};

const getNearbyTailorIdsFromRedis = async ({ lat, lng, radiusKm, limit }) => {
  await refreshTailorGeoIndex();

  const results = await redisClient.georadius(
    TAILOR_GEO_KEY,
    lng,
    lat,
    radiusKm,
    "km",
    "WITHDIST",
    "ASC",
    "COUNT",
    limit
  );

  return results.map(([tailorId, distanceKm]) => ({
    tailorId,
    distanceKm: Number(Number(distanceKm).toFixed(2))
  }));
};

const getNearbyTailorsFromMongo = async ({ lat, lng, radiusKm, limit }) => {
  const tailors = await model.Tailor.aggregate([
    {
      $geoNear: {
        key: "shopCoordinates",
        near: {
          type: "Point",
          coordinates: [lng, lat]
        },
        distanceField: "distance",
        maxDistance: radiusKm * 1000,
        spherical: true,
        query: {
          status: "active",
          verificationStatus: "verified"
        }
      }
    },
    { $limit: limit },
    {
      $project: {
        fullName: 1,
        email: 1,
        username: 1,
        shopName: 1,
        shopAddress: 1,
        shopCoordinates: 1,
        servicesOffered: 1,
        rating: 1,
        yearsOfExperience: 1,
        workExperiencePhotos: 1,
        distanceKm: { $round: [{ $divide: ["$distance", 1000] }, 2] }
      }
    }
  ]);

  return tailors.map((tailor) => ({
    tailor,
    distanceKm: tailor.distanceKm
  }));
};

const hydrateTailors = async (nearbyIds = []) => {
  const ids = nearbyIds.map((item) => item.tailorId);
  if (!ids.length) return [];

  const tailors = await model.Tailor.find({
    _id: { $in: ids },
    status: "active",
    verificationStatus: "verified"
  }).select("fullName email username shopName shopAddress shopCoordinates servicesOffered rating yearsOfExperience workExperiencePhotos");

  const byId = new Map(tailors.map((tailor) => [tailor._id.toString(), tailor]));

  return nearbyIds
    .map((item) => {
      const tailor = byId.get(item.tailorId);
      if (!tailor) return null;

      return {
        tailor,
        distanceKm: item.distanceKm
      };
    })
    .filter(Boolean);
};

const findMatchedService = (tailor, garmentType) => {
  const wanted = normalizeServiceText(garmentType);

  return (tailor.servicesOffered || []).find((service) => {
    const serviceType = normalizeServiceText(service.serviceType);
    return serviceType.includes(wanted) || wanted.includes(serviceType);
  });
};

export const findTailorBroadcastTargets = async ({
  garmentType,
  lat,
  lng,
  radiusKm = DEFAULT_BROADCAST_RADIUS_KM
}) => {
  const coordinates = {
    lat: Number(lat),
    lng: Number(lng)
  };

  let nearbyTailors;

  try {
    const nearbyIds = await getNearbyTailorIdsFromRedis({
      ...coordinates,
      radiusKm,
      limit: REDIS_NEARBY_LIMIT
    });

    nearbyTailors = await hydrateTailors(nearbyIds);
  } catch (error) {
    console.log("Redis tailor geo lookup failed, using Mongo geo fallback", error.message);
    nearbyTailors = await getNearbyTailorsFromMongo({
      ...coordinates,
      radiusKm,
      limit: REDIS_NEARBY_LIMIT
    });
  }

  const matchingTailors = nearbyTailors
    .map((item) => ({
      ...item,
      matchedService: findMatchedService(item.tailor, garmentType)
    }))
    .filter((item) => item.matchedService);

  const selected = matchingTailors.length
    ? matchingTailors
    : nearbyTailors.slice(0, FALLBACK_TAILOR_LIMIT).map((item) => ({
      ...item,
      matchedService: null
    }));

  return {
    mode: !selected.length
      ? "none"
      : matchingTailors.length
        ? "service_match"
        : "fallback_nearest",
    targets: selected.map((item) => ({
      tailor: item.tailor,
      distanceKm: item.distanceKm,
      matchedService: Boolean(item.matchedService),
      matchedServiceType: item.matchedService?.serviceType,
      listedServicePrice: item.matchedService?.price
    }))
  };
};
