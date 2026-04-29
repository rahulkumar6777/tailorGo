import { validationResult } from "express-validator";
import {
  acceptOrderByTailor,
  cancelOrder,
  cleanupOrderUploads,
  confirmTailorForOrder,
  createOrder,
  getAcceptedTailorResponses,
  getMyOrders,
  getOrderDetails,
  getTailorRequests,
  updateOrderStatusByTailor
} from "../services/order.service.js";
import {
  createPaymentOrder,
  verifyPayment
} from "../services/payment.service.js";

const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    cleanupOrderUploads(req.files);
    res.status(400).json({
      success: false,
      message: errors.array()[0].msg
    });
    return true;
  }

  return false;
};

const sendError = (res, error) => res.status(error?.status || 500).json({
  success: false,
  message: error.message || "Internal server error"
});

export const createOrderController = async (req, res) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const order = await createOrder({
      customerId: req.user._id,
      data: req.body,
      files: req.files
    });

    return res.status(201).json({
      success: true,
      message: order.status === "broadcasted"
        ? "Order created and broadcasted to tailors"
        : "Order created, but no nearby tailor was found",
      data: order
    });
  } catch (error) {
    cleanupOrderUploads(req.files);
    return sendError(res, error);
  }
};

export const getMyOrdersController = async (req, res) => {
  try {
    const orders = await getMyOrders({ user: req.user });

    return res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const getOrderDetailsController = async (req, res) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const order = await getOrderDetails({
      orderId: req.params.orderId,
      user: req.user
    });

    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const getTailorRequestsController = async (req, res) => {
  try {
    const orders = await getTailorRequests({
      tailorId: req.user._id
    });

    return res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const acceptOrderController = async (req, res) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const order = await acceptOrderByTailor({
      orderId: req.params.orderId,
      tailorId: req.user._id,
      data: req.body
    });

    return res.status(200).json({
      success: true,
      message: "Order accepted with quote",
      data: order
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const getAcceptedTailorsController = async (req, res) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const responses = await getAcceptedTailorResponses({
      orderId: req.params.orderId,
      customerId: req.user._id
    });

    return res.status(200).json({
      success: true,
      data: responses
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const confirmTailorController = async (req, res) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const order = await confirmTailorForOrder({
      orderId: req.params.orderId,
      customerId: req.user._id,
      responseId: req.body.responseId,
      tailorId: req.body.tailorId
    });

    return res.status(200).json({
      success: true,
      message: "Tailor confirmed for this order",
      data: order
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const updateOrderStatusController = async (req, res) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const order = await updateOrderStatusByTailor({
      orderId: req.params.orderId,
      tailorId: req.user._id,
      status: req.body.status
    });

    return res.status(200).json({
      success: true,
      message: "Order status updated",
      data: order
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const cancelOrderController = async (req, res) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const order = await cancelOrder({
      orderId: req.params.orderId,
      user: req.user,
      reason: req.body.reason
    });

    return res.status(200).json({
      success: true,
      message: "Order cancelled",
      data: order
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const createPaymentOrderController = async (req, res) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const paymentOrder = await createPaymentOrder({
      orderId: req.params.orderId,
      customerId: req.user._id
    });

    return res.status(200).json({
      success: true,
      data: paymentOrder
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const verifyPaymentController = async (req, res) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const order = await verifyPayment({
      orderId: req.params.orderId,
      customerId: req.user._id,
      razorpayOrderId: req.body.razorpayOrderId,
      razorpayPaymentId: req.body.razorpayPaymentId,
      razorpaySignature: req.body.razorpaySignature
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified and order completed",
      data: order
    });
  } catch (error) {
    return sendError(res, error);
  }
};
