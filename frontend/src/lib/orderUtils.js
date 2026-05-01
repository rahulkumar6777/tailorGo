export const ORDER_STATUS_LABELS = {
  pending_broadcast: "Preparing broadcast",
  broadcasted: "Waiting for tailor quotes",
  no_tailors_found: "No nearby tailor found",
  confirmed: "Tailor confirmed",
  cloth_received: "Cloth received",
  in_progress: "Stitching in progress",
  ready: "Ready",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_TONES = {
  pending_broadcast: "muted",
  broadcasted: "info",
  no_tailors_found: "danger",
  confirmed: "warning",
  cloth_received: "info",
  in_progress: "info",
  ready: "success",
  delivered: "success",
  completed: "success",
  cancelled: "danger",
};

export const TAILOR_NEXT_STATUSES = {
  confirmed: "cloth_received",
  cloth_received: "in_progress",
  in_progress: "ready",
  ready: "delivered",
};

export const ORDER_STATUS_ACTIONS = {
  cloth_received: "Mark cloth received",
  in_progress: "Start stitching",
  ready: "Mark ready",
  delivered: "Mark delivered",
};

export const PAYMENT_STATUS_LABELS = {
  pending: "Payment pending",
  initiated: "Payment started",
  paid: "Paid",
  failed: "Payment failed",
  refunded: "Refunded",
};

export const formatMoney = (amount, currency = "INR") => {
  if (amount === undefined || amount === null || amount === "") return "Price pending";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

export const formatDate = (value) => {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

export const shortId = (id = "") => {
  const value = String(id);
  return value ? value.slice(-6).toUpperCase() : "NEW";
};

export const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
};

export const getTailorName = (tailor) => (
  tailor?.shopName || tailor?.fullName || tailor?.username || "Tailor"
);

export const getOrderPrice = (order) => (
  order?.confirmedQuote?.amount || order?.payment?.amount
);
