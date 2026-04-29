import crypto from "crypto";
import Razorpay from "razorpay";
import { ENV } from "../../../lib/env.js";
import { model } from "../../../models/index.js";
import { orderNotificationQueue } from "../../../shared/queue/queues.js";
import { getOrderDetails } from "./order.service.js";

const createHttpError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const getRazorpayClient = () => {
  if (!ENV.RAZORPAY_KEY_ID || !ENV.RAZORPAY_KEY_SECRET) {
    throw createHttpError("Razorpay keys are not configured", 500);
  }

  return new Razorpay({
    key_id: ENV.RAZORPAY_KEY_ID,
    key_secret: ENV.RAZORPAY_KEY_SECRET
  });
};

const enqueuePaymentCompletedEmail = (order) => {
  if (!order.confirmedTailor?.email) return;

  orderNotificationQueue.add("order-notification", {
    type: "payment_completed_tailor",
    to: order.confirmedTailor.email,
    tailorName: order.confirmedTailor.fullName,
    orderId: order._id.toString(),
    garmentType: order.garmentType,
    amount: order.payment?.amount
  }).catch((error) => {
    console.log("Payment notification queue error", error.message);
  });
};

export const createPaymentOrder = async ({ orderId, customerId }) => {
  const order = await model.Order.findOne({
    _id: orderId,
    customer: customerId
  });

  if (!order) {
    throw createHttpError("Order not found", 404);
  }

  if (order.status !== "delivered") {
    throw createHttpError("Payment can be initiated only after delivery");
  }

  if (order.payment?.status === "paid") {
    throw createHttpError("Payment is already completed");
  }

  const amount = Number(order.payment?.amount || order.confirmedQuote?.amount);
  if (!amount || amount <= 0) {
    throw createHttpError("Order payment amount is missing");
  }

  const razorpay = getRazorpayClient();
  const currency = order.payment?.currency || "INR";
  const receipt = `tg_${order._id.toString().slice(-30)}`;

  const paymentOrder = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency,
    receipt,
    notes: {
      orderId: order._id.toString(),
      garmentType: order.garmentType
    }
  });

  order.payment = {
    ...order.payment?.toObject?.(),
    amount,
    currency,
    status: "initiated",
    razorpayOrderId: paymentOrder.id,
    initiatedAt: new Date(),
    payWhen: "after_delivery",
    gateway: "razorpay"
  };

  await order.save();

  return {
    keyId: ENV.RAZORPAY_KEY_ID,
    razorpayOrderId: paymentOrder.id,
    amount,
    currency
  };
};

export const verifyPayment = async ({
  orderId,
  customerId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature
}) => {
  const order = await model.Order.findOne({
    _id: orderId,
    customer: customerId
  });

  if (!order) {
    throw createHttpError("Order not found", 404);
  }

  if (order.payment?.razorpayOrderId !== razorpayOrderId) {
    throw createHttpError("Razorpay order id does not match this order");
  }

  if (!ENV.RAZORPAY_KEY_SECRET) {
    throw createHttpError("Razorpay keys are not configured", 500);
  }

  const expectedSignature = crypto
    .createHmac("sha256", ENV.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    order.payment = {
      ...order.payment?.toObject?.(),
      status: "failed",
      failedAt: new Date(),
      failureReason: "Invalid Razorpay signature"
    };
    await order.save();

    throw createHttpError("Invalid payment signature", 400);
  }

  order.payment = {
    ...order.payment?.toObject?.(),
    status: "paid",
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    paidAt: new Date()
  };
  order.status = "completed";
  order.completedAt = new Date();

  await order.save();
  await order.populate({ path: "confirmedTailor", select: "fullName email" });
  enqueuePaymentCompletedEmail(order);

  return getOrderDetails({
    orderId,
    user: {
      _id: customerId,
      role: "customer"
    }
  });
};
