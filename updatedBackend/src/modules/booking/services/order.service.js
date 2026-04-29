import fs from "fs";
import { model } from "../../../models/index.js";
import { uploadOnCloudinary } from "../../../shared/cloudinary/cloudinary.service.js";
import { orderNotificationQueue } from "../../../shared/queue/queues.js";
import {
  DEFAULT_BROADCAST_RADIUS_KM,
  findTailorBroadcastTargets
} from "./tailorGeo.service.js";

const ORDER_RESPONSE_POPULATE = [
  { path: "customer", select: "fullName email pnoneNo avatar" },
  {
    path: "confirmedTailor",
    select: "fullName email username shopName shopAddress rating yearsOfExperience servicesOffered workExperiencePhotos"
  },
  {
    path: "broadcastedTailors.tailor",
    select: "fullName email username shopName shopAddress rating yearsOfExperience servicesOffered workExperiencePhotos"
  },
  {
    path: "tailorResponses.tailor",
    select: "fullName email username shopName shopAddress rating yearsOfExperience servicesOffered workExperiencePhotos"
  }
];

const createHttpError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const sameId = (a, b) => a?.toString() === b?.toString();

const cleanupFileIfExists = (file) => {
  if (file?.path && fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }
};

const enqueueOrderNotification = (payload) => {
  orderNotificationQueue.add("order-notification", payload).catch((error) => {
    console.log("Order notification queue error", error.message);
  });
};

const uploadImageFile = async (file) => {
  const response = await uploadOnCloudinary(file.path);

  return {
    url: response.secure_url || response.url,
    publicId: response.public_id
  };
};

const uploadOrderImages = async (files = {}, body = {}) => {
  const referenceImages = [];
  const referenceFiles = files.referenceImages || [];

  for (const url of body.referenceImageUrls || []) {
    referenceImages.push({ url });
  }

  for (const file of referenceFiles) {
    referenceImages.push(await uploadImageFile(file));
  }

  const measurementFile = files.measurementImage?.[0];
  const measurementImage = measurementFile
    ? await uploadImageFile(measurementFile)
    : undefined;

  return {
    referenceImages,
    measurementImage
  };
};

const hasMeasurementValues = (measurements) => (
  measurements
  && typeof measurements === "object"
  && Object.keys(measurements).length > 0
);

const getMeasurementPreference = ({ requestedPreference, measurements, measurementImage }) => (
  requestedPreference
  || (hasMeasurementValues(measurements) ? "manual_values" : measurementImage ? "measurement_image" : "tailor_visit")
);

export const cleanupOrderUploads = (files = {}) => {
  for (const file of [
    ...(files.referenceImages || []),
    ...(files.measurementImage || [])
  ]) {
    cleanupFileIfExists(file);
  }
};

const buildBroadcastedTailors = (targets) => targets.map((target) => ({
  tailor: target.tailor._id,
  distanceKm: target.distanceKm,
  matchedService: target.matchedService,
  matchedServiceType: target.matchedServiceType,
  listedServicePrice: target.listedServicePrice,
  notifiedAt: new Date(),
  notificationStatus: target.tailor.email ? "queued" : "skipped"
}));

const resolveTailorAcceptedPrice = ({ broadcastInfo, estimatedPrice }) => {
  const listedServicePrice = Number(broadcastInfo?.listedServicePrice);

  if (broadcastInfo?.matchedService && Number.isFinite(listedServicePrice) && listedServicePrice >= 0) {
    return {
      estimatedPrice: listedServicePrice,
      priceSource: "listed_service"
    };
  }

  if (estimatedPrice === undefined || estimatedPrice === null || estimatedPrice === "") {
    throw createHttpError("estimatedPrice is required because this garment is not in your listed services");
  }

  const quotedPrice = Number(estimatedPrice);
  if (!Number.isFinite(quotedPrice) || quotedPrice < 0) {
    throw createHttpError("estimatedPrice must be a positive number");
  }

  return {
    estimatedPrice: quotedPrice,
    priceSource: "tailor_quote"
  };
};

const enqueueBroadcastEmails = ({ order, targets }) => {
  for (const target of targets) {
    if (!target.tailor.email) continue;

    enqueueOrderNotification({
      type: "new_order_for_tailor",
      to: target.tailor.email,
      tailorName: target.tailor.fullName,
      orderId: order._id.toString(),
      garmentType: order.garmentType,
      fabricType: order.fabricType,
      distanceKm: target.distanceKm,
      matchedService: target.matchedService,
      listedServicePrice: target.listedServicePrice,
      customerAddress: order.deliveryAddress?.line1
    });
  }
};

const enqueueCustomerAcceptedEmail = ({ order, tailor, response }) => {
  if (!order.customer?.email) return;

  enqueueOrderNotification({
    type: "tailor_accepted_customer",
    to: order.customer.email,
    customerName: order.customer.fullName,
    tailorName: tailor.fullName,
    tailorShopName: tailor.shopName,
    orderId: order._id.toString(),
    garmentType: order.garmentType,
    estimatedPrice: response.estimatedPrice,
    estimatedDays: response.estimatedDays
  });
};

const enqueueTailorConfirmedEmail = ({ order, tailor }) => {
  if (!tailor?.email) return;

  enqueueOrderNotification({
    type: "customer_confirmed_tailor",
    to: tailor.email,
    tailorName: tailor.fullName,
    orderId: order._id.toString(),
    garmentType: order.garmentType,
    customerName: order.customer?.fullName,
    customerAddress: order.deliveryAddress?.line1,
    amount: order.confirmedQuote?.amount
  });
};

const enqueueCustomerStatusEmail = ({ order }) => {
  if (!order.customer?.email) return;

  enqueueOrderNotification({
    type: "order_status_customer",
    to: order.customer.email,
    customerName: order.customer.fullName,
    orderId: order._id.toString(),
    garmentType: order.garmentType,
    status: order.status,
    amount: order.payment?.amount
  });
};

const populateOrder = async (query) => query.populate(ORDER_RESPONSE_POPULATE);

const getOrderForUserQuery = ({ orderId, user }) => {
  if (user.role === "customer") {
    return {
      _id: orderId,
      customer: user._id
    };
  }

  if (user.role === "tailor") {
    return {
      _id: orderId,
      $or: [
        { confirmedTailor: user._id },
        { "broadcastedTailors.tailor": user._id },
        { "tailorResponses.tailor": user._id }
      ]
    };
  }

  return { _id: orderId };
};

export const createOrder = async ({ customerId, data, files }) => {
  const { lat, lng } = data.coordinates;
  const uploadedImages = await uploadOrderImages(files, data);
  const measurementPreference = getMeasurementPreference({
    requestedPreference: data.measurementPreference,
    measurements: data.measurements,
    measurementImage: uploadedImages.measurementImage
  });

  const order = new model.Order({
    customer: customerId,
    garmentType: data.garmentType,
    fabricType: data.fabricType,
    fabricColor: data.fabricColor,
    fabricProvidedBy: data.fabricProvidedBy || "customer",
    measurementPreference,
    measurements: measurementPreference === "manual_values" ? data.measurements : undefined,
    measurementImage: measurementPreference === "measurement_image" ? uploadedImages.measurementImage : undefined,
    deliveryMethod: data.deliveryMethod || "tailor_pickup",
    deliveryAddress: data.deliveryAddress,
    customerCoordinates: {
      type: "Point",
      coordinates: [lng, lat]
    },
    referenceImages: uploadedImages.referenceImages,
    customerNote: data.customerNote,
    broadcastRadius: DEFAULT_BROADCAST_RADIUS_KM,
    broadcastExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  });

  const broadcast = await findTailorBroadcastTargets({
    garmentType: order.garmentType,
    lat,
    lng,
    radiusKm: DEFAULT_BROADCAST_RADIUS_KM
  });

  order.broadcastMode = broadcast.mode;
  order.broadcastedTailors = buildBroadcastedTailors(broadcast.targets);
  order.status = broadcast.targets.length ? "broadcasted" : "no_tailors_found";
  order.broadcastedAt = broadcast.targets.length ? new Date() : undefined;

  await order.save();
  enqueueBroadcastEmails({ order, targets: broadcast.targets });

  return populateOrder(model.Order.findById(order._id));
};

export const getOrderDetails = async ({ orderId, user }) => {
  const order = await populateOrder(model.Order.findOne(getOrderForUserQuery({ orderId, user })));

  if (!order) {
    throw createHttpError("Order not found", 404);
  }

  return order;
};

export const getMyOrders = async ({ user }) => {
  const query = user.role === "customer"
    ? { customer: user._id }
    : {
      $or: [
        { confirmedTailor: user._id },
        { "broadcastedTailors.tailor": user._id },
        { "tailorResponses.tailor": user._id }
      ]
    };

  return populateOrder(model.Order.find(query).sort({ createdAt: -1 }));
};

export const getTailorRequests = async ({ tailorId }) => {
  const orders = await model.Order.find({
    "broadcastedTailors.tailor": tailorId,
    status: "broadcasted"
  })
    .populate({ path: "customer", select: "fullName email pnoneNo avatar" })
    .sort({ createdAt: -1 });

  return orders.map((order) => {
    const broadcastInfo = order.broadcastedTailors.find((item) => sameId(item.tailor, tailorId));
    const existingResponse = order.tailorResponses.find((item) => (
      sameId(item.tailor, tailorId) && item.status === "accepted"
    ));

    return {
      _id: order._id,
      garmentType: order.garmentType,
      fabricType: order.fabricType,
      fabricColor: order.fabricColor,
      measurementPreference: order.measurementPreference,
      deliveryMethod: order.deliveryMethod,
      deliveryAddress: order.deliveryAddress,
      customerCoordinates: order.customerCoordinates,
      referenceImages: order.referenceImages,
      measurementImage: order.measurementImage,
      customerNote: order.customerNote,
      broadcast: broadcastInfo,
      customer: order.customer,
      hasAccepted: Boolean(existingResponse),
      quote: existingResponse || null,
      createdAt: order.createdAt
    };
  });
};

export const acceptOrderByTailor = async ({ orderId, tailorId, data }) => {
  const order = await model.Order.findById(orderId).populate({ path: "customer", select: "fullName email" });

  if (!order) {
    throw createHttpError("Order not found", 404);
  }

  if (order.status !== "broadcasted") {
    throw createHttpError("Order is not open for tailor responses");
  }

  if (order.broadcastExpiresAt && order.broadcastExpiresAt < new Date()) {
    throw createHttpError("Order broadcast has expired");
  }

  const broadcastInfo = order.broadcastedTailors.find((item) => sameId(item.tailor, tailorId));
  if (!broadcastInfo) {
    throw createHttpError("This order was not broadcasted to this tailor", 403);
  }

  const tailor = await model.Tailor.findById(tailorId).select("fullName email shopName");
  if (!tailor) {
    throw createHttpError("Tailor not found", 404);
  }

  const acceptedPrice = resolveTailorAcceptedPrice({
    broadcastInfo,
    estimatedPrice: data.estimatedPrice
  });
  const existingResponse = order.tailorResponses.find((item) => sameId(item.tailor, tailorId));
  const responseData = {
    tailor: tailorId,
    estimatedPrice: acceptedPrice.estimatedPrice,
    estimatedDays: data.estimatedDays ? Number(data.estimatedDays) : undefined,
    priceSource: acceptedPrice.priceSource,
    status: "accepted",
    acceptedAt: new Date()
  };

  if (existingResponse) {
    existingResponse.set(responseData);
  } else {
    order.tailorResponses.push(responseData);
  }

  await order.save();

  const savedResponse = order.tailorResponses.find((item) => sameId(item.tailor, tailorId));
  enqueueCustomerAcceptedEmail({
    order,
    tailor,
    response: savedResponse
  });

  return getOrderDetails({
    orderId,
    user: {
      _id: tailorId,
      role: "tailor"
    }
  });
};

export const getAcceptedTailorResponses = async ({ orderId, customerId }) => {
  const order = await populateOrder(model.Order.findOne({
    _id: orderId,
    customer: customerId
  }));

  if (!order) {
    throw createHttpError("Order not found", 404);
  }

  const acceptedResponses = order.tailorResponses.filter((response) => response.status === "accepted");
  const tailorIds = acceptedResponses.map((response) => response.tailor?._id).filter(Boolean);

  const reviewStats = await model.Review.aggregate([
    { $match: { tailor: { $in: tailorIds } } },
    {
      $group: {
        _id: "$tailor",
        reviewCount: { $sum: 1 },
        averageRating: { $avg: "$rating" }
      }
    }
  ]);

  const statsByTailor = new Map(reviewStats.map((stat) => [
    stat._id.toString(),
    {
      reviewCount: stat.reviewCount,
      averageRating: Number(stat.averageRating.toFixed(1))
    }
  ]));

  return acceptedResponses.map((response) => {
    const tailor = response.tailor;
    const broadcastInfo = order.broadcastedTailors.find((item) => (
      sameId(item.tailor?._id || item.tailor, tailor?._id)
    ));
    const stats = statsByTailor.get(tailor?._id?.toString()) || {
      reviewCount: 0,
      averageRating: tailor?.rating || 0
    };

    return {
      responseId: response._id,
      estimatedPrice: response.estimatedPrice,
      estimatedDays: response.estimatedDays,
      priceSource: response.priceSource,
      acceptedAt: response.acceptedAt,
      tailor: {
        _id: tailor._id,
        fullName: tailor.fullName,
        username: tailor.username,
        shopName: tailor.shopName,
        shopAddress: tailor.shopAddress,
        rating: tailor.rating,
        averageRating: stats.averageRating,
        reviewCount: stats.reviewCount,
        yearsOfExperience: tailor.yearsOfExperience,
        servicesOffered: tailor.servicesOffered,
        image: tailor.workExperiencePhotos?.[0]?.photo
      },
      broadcast: {
        distanceKm: broadcastInfo?.distanceKm,
        matchedService: broadcastInfo?.matchedService,
        matchedServiceType: broadcastInfo?.matchedServiceType,
        listedServicePrice: broadcastInfo?.listedServicePrice
      }
    };
  });
};

export const confirmTailorForOrder = async ({ orderId, customerId, responseId, tailorId }) => {
  const order = await model.Order.findOne({
    _id: orderId,
    customer: customerId
  }).populate({ path: "customer", select: "fullName email" });

  if (!order) {
    throw createHttpError("Order not found", 404);
  }

  if (order.status !== "broadcasted") {
    throw createHttpError("Order is not ready for tailor confirmation");
  }

  const selectedResponse = order.tailorResponses.find((response) => {
    const responseMatches = responseId && sameId(response._id, responseId);
    const tailorMatches = tailorId && sameId(response.tailor, tailorId);
    return response.status === "accepted" && (responseMatches || tailorMatches);
  });

  if (!selectedResponse) {
    throw createHttpError("Accepted tailor response not found", 404);
  }

  order.confirmedTailor = selectedResponse.tailor;
  order.confirmedQuote = {
    responseId: selectedResponse._id,
    tailor: selectedResponse.tailor,
    amount: selectedResponse.estimatedPrice,
    estimatedDays: selectedResponse.estimatedDays,
    priceSource: selectedResponse.priceSource
  };
  order.payment = {
    ...order.payment?.toObject?.(),
    amount: selectedResponse.estimatedPrice,
    currency: "INR",
    status: "pending",
    payWhen: "after_delivery",
    gateway: "razorpay"
  };
  order.status = "confirmed";
  order.confirmedAt = new Date();

  await order.save();

  const tailor = await model.Tailor.findById(order.confirmedTailor).select("fullName email");
  enqueueTailorConfirmedEmail({ order, tailor });

  return getOrderDetails({
    orderId,
    user: {
      _id: customerId,
      role: "customer"
    }
  });
};

export const updateOrderStatusByTailor = async ({ orderId, tailorId, status }) => {
  const order = await model.Order.findOne({
    _id: orderId,
    confirmedTailor: tailorId
  }).populate({ path: "customer", select: "fullName email" });

  if (!order) {
    throw createHttpError("Order not found", 404);
  }

  const allowedTransitions = {
    confirmed: ["cloth_received"],
    cloth_received: ["in_progress"],
    in_progress: ["ready"],
    ready: ["delivered"]
  };

  if (order.status === status) {
    return getOrderDetails({
      orderId,
      user: {
        _id: tailorId,
        role: "tailor"
      }
    });
  }

  if (!allowedTransitions[order.status]?.includes(status)) {
    throw createHttpError(`Cannot move order from ${order.status} to ${status}`);
  }

  order.status = status;

  if (status === "delivered") {
    order.deliveredAt = new Date();
    order.payment = {
      ...order.payment?.toObject?.(),
      amount: order.payment?.amount || order.confirmedQuote?.amount,
      currency: order.payment?.currency || "INR",
      status: order.payment?.status === "paid" ? "paid" : "pending",
      payWhen: "after_delivery",
      gateway: "razorpay"
    };
  }

  await order.save();
  enqueueCustomerStatusEmail({ order });

  return getOrderDetails({
    orderId,
    user: {
      _id: tailorId,
      role: "tailor"
    }
  });
};

export const cancelOrder = async ({ orderId, user, reason }) => {
  const query = user.role === "customer"
    ? { _id: orderId, customer: user._id }
    : { _id: orderId, confirmedTailor: user._id };

  const order = await model.Order.findOne(query);

  if (!order) {
    throw createHttpError("Order not found", 404);
  }

  const canCustomerCancel = user.role === "customer"
    && ["pending_broadcast", "broadcasted", "no_tailors_found"].includes(order.status);
  const canTailorCancel = user.role === "tailor" && order.status === "confirmed";

  if (!canCustomerCancel && !canTailorCancel) {
    throw createHttpError("Order cannot be cancelled at this stage");
  }

  order.status = "cancelled";
  order.cancelledBy = user.role === "tailor" ? "tailor" : "customer";
  order.cancellationReason = reason;
  order.cancelledAt = new Date();

  await order.save();

  return getOrderDetails({ orderId, user });
};
