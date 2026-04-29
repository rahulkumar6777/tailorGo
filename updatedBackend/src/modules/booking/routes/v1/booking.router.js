import express from "express";
import upload from "../../../../middlewares/multer.middleware.js";
import { verifyJWT } from "../../../../middlewares/auth.middleware.js";
import {
  acceptOrderController,
  cancelOrderController,
  confirmTailorController,
  createOrderController,
  createPaymentOrderController,
  getAcceptedTailorsController,
  getMyOrdersController,
  getOrderDetailsController,
  getTailorRequestsController,
  updateOrderStatusController,
  verifyPaymentController
} from "../../controllers/order.js";
import {
  validateAcceptOrder,
  validateCancelOrder,
  validateConfirmTailor,
  validateCreateOrder,
  validateOrderId,
  validatePaymentVerify,
  validateStatusUpdate
} from "../../validators/order.js";

const bookingRouter = express.Router();

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden"
    });
  }

  return next();
};

bookingRouter.use(verifyJWT);

bookingRouter.post(
  "/orders",
  requireRole("customer"),
  upload.fields([
    { name: "referenceImages", maxCount: 5 },
    { name: "measurementImage", maxCount: 1 }
  ]),
  validateCreateOrder,
  createOrderController
);

bookingRouter.get("/orders/my", getMyOrdersController);
bookingRouter.get("/tailor/requests", requireRole("tailor"), getTailorRequestsController);

bookingRouter.get("/orders/:orderId", validateOrderId, getOrderDetailsController);

bookingRouter.post(
  "/orders/:orderId/accept",
  requireRole("tailor"),
  validateAcceptOrder,
  acceptOrderController
);

bookingRouter.get(
  "/orders/:orderId/responses",
  requireRole("customer"),
  validateOrderId,
  getAcceptedTailorsController
);

bookingRouter.post(
  "/orders/:orderId/confirm",
  requireRole("customer"),
  validateConfirmTailor,
  confirmTailorController
);

bookingRouter.patch(
  "/orders/:orderId/status",
  requireRole("tailor"),
  validateStatusUpdate,
  updateOrderStatusController
);

bookingRouter.patch(
  "/orders/:orderId/cancel",
  validateCancelOrder,
  cancelOrderController
);

bookingRouter.post(
  "/orders/:orderId/payment/create",
  requireRole("customer"),
  validateOrderId,
  createPaymentOrderController
);

bookingRouter.post(
  "/orders/:orderId/payment/verify",
  requireRole("customer"),
  validatePaymentVerify,
  verifyPaymentController
);

export default bookingRouter;
