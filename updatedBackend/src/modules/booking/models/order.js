import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String }
  },
  { _id: false }
);

const measurementsSchema = new mongoose.Schema(
  {
    unit: {
      type: String,
      enum: ["inch", "cm"],
      default: "inch"
    },
    chest: Number,
    waist: Number,
    hips: Number,
    shoulder: Number,
    sleeveLength: Number,
    inseam: Number,
    neck: Number,
    thigh: Number,
    length: Number,
    extra: { type: Map, of: mongoose.Schema.Types.Mixed }
  },
  { _id: false }
);

const broadcastedTailorSchema = new mongoose.Schema(
  {
    tailor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tailor",
      required: true
    },
    distanceKm: { type: Number },
    matchedService: { type: Boolean, default: false },
    matchedServiceType: { type: String, trim: true },
    listedServicePrice: { type: Number },
    notifiedAt: { type: Date },
    notificationStatus: {
      type: String,
      enum: ["queued", "sent", "failed", "skipped"],
      default: "queued"
    }
  },
  { _id: false }
);

const tailorResponseSchema = new mongoose.Schema(
  {
    tailor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tailor",
      required: true
    },
    acceptedAt: { type: Date, default: Date.now },
    estimatedPrice: { type: Number, required: true, min: 0 },
    estimatedDays: { type: Number, min: 1 },
    priceSource: {
      type: String,
      enum: ["listed_service", "tailor_quote"],
      default: "tailor_quote"
    },
    status: {
      type: String,
      enum: ["accepted", "withdrawn"],
      default: "accepted"
    }
  },
  { _id: true }
);

const paymentSchema = new mongoose.Schema(
  {
    gateway: {
      type: String,
      enum: ["razorpay"],
      default: "razorpay"
    },
    payWhen: {
      type: String,
      enum: ["after_delivery"],
      default: "after_delivery"
    },
    amount: { type: Number, min: 0 },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["pending", "initiated", "paid", "failed", "refunded"],
      default: "pending"
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    initiatedAt: { type: Date },
    paidAt: { type: Date },
    failedAt: { type: Date },
    failureReason: { type: String, trim: true }
  },
  { _id: false }
);

const confirmedQuoteSchema = new mongoose.Schema(
  {
    responseId: { type: mongoose.Schema.Types.ObjectId },
    tailor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tailor"
    },
    amount: { type: Number, min: 0 },
    estimatedDays: { type: Number },
    priceSource: {
      type: String,
      enum: ["listed_service", "tailor_quote"]
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    confirmedTailor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tailor",
      default: null,
      index: true
    },

    garmentType: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    fabricType: { type: String, trim: true },
    fabricColor: { type: String, trim: true },
    fabricProvidedBy: {
      type: String,
      enum: ["customer", "tailor", "undecided"],
      default: "customer"
    },

    measurementPreference: {
      type: String,
      enum: ["manual_values", "measurement_image", "tailor_visit"],
      default: "tailor_visit"
    },
    measurements: measurementsSchema,
    measurementImage: imageSchema,

    deliveryMethod: {
      type: String,
      enum: ["self_deliver", "tailor_pickup"],
      default: "tailor_pickup"
    },
    deliveryAddress: {
      line1: { type: String, trim: true },
      line2: { type: String, trim: true },
      landmark: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true }
    },
    customerCoordinates: {
      type: {
        type: String,
        enum: ["Point"],
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },

    referenceImages: [imageSchema],
    customerNote: { type: String, trim: true, maxlength: 1000 },

    broadcastedTailors: [broadcastedTailorSchema],
    broadcastMode: {
      type: String,
      enum: ["service_match", "fallback_nearest", "none"],
      default: "none"
    },
    broadcastedAt: { type: Date },
    broadcastRadius: { type: Number, default: 15 },
    broadcastExpiresAt: { type: Date },

    tailorResponses: [tailorResponseSchema],
    confirmedQuote: confirmedQuoteSchema,

    status: {
      type: String,
      enum: [
        "pending_broadcast",
        "broadcasted",
        "no_tailors_found",
        "confirmed",
        "cloth_received",
        "in_progress",
        "ready",
        "delivered",
        "completed",
        "cancelled"
      ],
      default: "pending_broadcast",
      index: true
    },
    cancelledBy: {
      type: String,
      enum: ["customer", "tailor", "admin", null],
      default: null
    },
    cancellationReason: { type: String, trim: true },
    cancelledAt: { type: Date },

    payment: {
      type: paymentSchema,
      default: () => ({})
    },

    confirmedAt: { type: Date },
    deliveredAt: { type: Date },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

orderSchema.index({ customerCoordinates: "2dsphere" });
orderSchema.index({ "broadcastedTailors.tailor": 1, status: 1 });
orderSchema.index({ "tailorResponses.tailor": 1 });

export const Order = mongoose.model("Order", orderSchema);
