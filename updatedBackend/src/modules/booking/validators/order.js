import { body, param } from "express-validator";

const parseJsonField = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
};

const toArray = (value) => {
  const parsed = parseJsonField(value);
  if (parsed === undefined) return [];
  if (Array.isArray(parsed)) return parsed;
  return [parsed];
};

const hasMeasurementValues = (measurements) => (
  measurements
  && typeof measurements === "object"
  && Object.keys(measurements).length > 0
);

const hasMeasurementImageFile = (req) => (req.files?.measurementImage || []).length > 0;

const resolveMeasurementPreference = (req) => {
  const hasMeasurements = hasMeasurementValues(req.body.measurements);
  const hasMeasurementImage = hasMeasurementImageFile(req);

  if (hasMeasurements && hasMeasurementImage) {
    throw new Error("send either measurements or measurementImage, not both");
  }

  const preference = req.body.measurementPreference
    || (hasMeasurements ? "manual_values" : hasMeasurementImage ? "measurement_image" : "tailor_visit");

  if (preference === "manual_values" && !hasMeasurements) {
    throw new Error("measurements are required when measurementPreference is manual_values");
  }

  if (preference === "manual_values" && hasMeasurementImage) {
    throw new Error("measurementImage is not allowed when measurementPreference is manual_values");
  }

  if (preference === "measurement_image" && !hasMeasurementImage) {
    throw new Error("measurementImage is required when measurementPreference is measurement_image");
  }

  if (preference === "measurement_image" && hasMeasurements) {
    throw new Error("measurements are not allowed when measurementPreference is measurement_image");
  }

  if (preference === "tailor_visit" && (hasMeasurements || hasMeasurementImage)) {
    throw new Error("measurements and measurementImage are not allowed when measurementPreference is tailor_visit");
  }

  req.body.measurementPreference = preference;
  return true;
};

const normalizeCoordinates = (value, req) => {
  const parsed = parseJsonField(value) || {};
  const lat = Number(parsed.lat ?? parsed.latitude ?? req.body.lat);
  const lng = Number(parsed.lng ?? parsed.longitude ?? req.body.lng);

  if (Number.isNaN(lat) || lat < -90 || lat > 90) {
    throw new Error("valid latitude is required");
  }

  if (Number.isNaN(lng) || lng < -180 || lng > 180) {
    throw new Error("valid longitude is required");
  }

  return { lat, lng };
};

const normalizeAddress = (value, req) => {
  const parsed = parseJsonField(value);

  if (parsed && typeof parsed === "object") {
    return {
      line1: parsed.line1 || parsed.addressLine1 || parsed.address || "",
      line2: parsed.line2 || "",
      landmark: parsed.landmark || "",
      city: parsed.city || "",
      state: parsed.state || "",
      pincode: parsed.pincode || parsed.pinCode || parsed.zipCode || ""
    };
  }

  return {
    line1: parsed || req.body.address || req.body.addressLine1 || "",
    line2: req.body.addressLine2 || "",
    landmark: req.body.landmark || "",
    city: req.body.city || "",
    state: req.body.state || "",
    pincode: req.body.pincode || req.body.pinCode || req.body.zipCode || ""
  };
};

export const validateCreateOrder = [
  body("garmentType").custom((value, { req }) => {
    const garmentType = String(value || req.body.outfit || req.body.item || "").trim();

    if (garmentType.length < 2 || garmentType.length > 80) {
      throw new Error("garmentType must be 2-80 characters");
    }

    req.body.garmentType = garmentType;
    return true;
  }),

  body("fabricType")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 60 }).withMessage("fabricType must be less than 60 characters"),

  body("fabricColor")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 40 }).withMessage("fabricColor must be less than 40 characters"),

  body("fabricProvidedBy")
    .optional({ checkFalsy: true })
    .isIn(["customer", "tailor", "undecided"]).withMessage("fabricProvidedBy is invalid"),

  body("measurementPreference")
    .optional({ checkFalsy: true })
    .isIn(["manual_values", "measurement_image", "tailor_visit"])
    .withMessage("measurementPreference is invalid"),

  body("deliveryMethod")
    .optional({ checkFalsy: true })
    .isIn(["self_deliver", "tailor_pickup"]).withMessage("deliveryMethod is invalid"),

  body("coordinates").custom((value, { req }) => {
    req.body.coordinates = normalizeCoordinates(value, req);
    return true;
  }),

  body("deliveryAddress").custom((value, { req }) => {
    const address = normalizeAddress(value, req);

    if (!String(address.line1 || "").trim()) {
      throw new Error("delivery address is required");
    }

    req.body.deliveryAddress = address;
    return true;
  }),

  body("measurements")
    .optional({ checkFalsy: true })
    .custom((value, { req }) => {
      const measurements = parseJsonField(value);

      if (measurements && typeof measurements !== "object") {
        throw new Error("measurements must be an object");
      }

      req.body.measurements = measurements;
      return true;
    }),

  body().custom((value, { req }) => resolveMeasurementPreference(req)),

  body("referenceImageUrls")
    .optional({ checkFalsy: true })
    .custom((value, { req }) => {
      req.body.referenceImageUrls = toArray(value)
        .map((url) => String(url || "").trim())
        .filter(Boolean);

      return true;
    }),

  body("customerNote")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 }).withMessage("customerNote must be less than 1000 characters")
];

export const validateOrderId = [
  param("orderId").isMongoId().withMessage("invalid orderId")
];

export const validateAcceptOrder = [
  ...validateOrderId,
  body("estimatedPrice")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }).withMessage("estimatedPrice must be a positive number"),

  body("estimatedDays")
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 365 }).withMessage("estimatedDays must be between 1 and 365")
];

export const validateConfirmTailor = [
  ...validateOrderId,
  body().custom((value) => {
    if (!value.responseId && !value.tailorId) {
      throw new Error("responseId or tailorId is required");
    }

    return true;
  }),
  body("responseId")
    .optional({ checkFalsy: true })
    .isMongoId().withMessage("invalid responseId"),
  body("tailorId")
    .optional({ checkFalsy: true })
    .isMongoId().withMessage("invalid tailorId")
];

export const validateStatusUpdate = [
  ...validateOrderId,
  body("status")
    .isIn(["cloth_received", "in_progress", "ready", "delivered"])
    .withMessage("invalid order status")
];

export const validateCancelOrder = [
  ...validateOrderId,
  body("reason")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 }).withMessage("reason must be less than 500 characters")
];

export const validatePaymentVerify = [
  ...validateOrderId,
  body("razorpayOrderId").notEmpty().withMessage("razorpayOrderId is required"),
  body("razorpayPaymentId").notEmpty().withMessage("razorpayPaymentId is required"),
  body("razorpaySignature").notEmpty().withMessage("razorpaySignature is required")
];
