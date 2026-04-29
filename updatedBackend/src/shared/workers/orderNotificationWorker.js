import { Worker } from "bullmq";
import { ENV } from "../../lib/env.js";
import { transporter } from "../email/transporter.js";
import { connection } from "../queue/queues.js";

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const money = (amount) => {
  if (amount === undefined || amount === null || amount === "") return null;
  return `Rs. ${Number(amount).toLocaleString("en-IN")}`;
};

const statusCopy = {
  cloth_received: "Your cloth has been received by the tailor.",
  in_progress: "Your stitching work has started.",
  ready: "Your order is ready.",
  delivered: "Your order is delivered. Payment can now be completed from the portal."
};

const buildEmailCopy = (data) => {
  switch (data.type) {
    case "new_order_for_tailor":
      return {
        subject: `New ${data.garmentType} stitching request`,
        heading: "New stitching request near you",
        lines: [
          `Garment: ${data.garmentType}`,
          data.fabricType ? `Fabric: ${data.fabricType}` : null,
          data.distanceKm ? `Distance: ${data.distanceKm} km` : null,
          data.matchedService ? "This matches one of your listed services." : "This is a nearby fallback request.",
          money(data.listedServicePrice) ? `Your listed service price: ${money(data.listedServicePrice)}` : null,
          data.customerAddress ? `Customer address: ${data.customerAddress}` : null
        ]
      };

    case "tailor_accepted_customer":
      return {
        subject: `${data.tailorShopName || data.tailorName} accepted your order`,
        heading: "A tailor accepted your order",
        lines: [
          `${data.tailorShopName || data.tailorName} sent a quote for your ${data.garmentType}.`,
          money(data.estimatedPrice) ? `Quote: ${money(data.estimatedPrice)}` : null,
          data.estimatedDays ? `Estimated time: ${data.estimatedDays} day(s)` : null,
          "Open TailorGo to compare accepted tailors and confirm one."
        ]
      };

    case "customer_confirmed_tailor":
      return {
        subject: `Customer confirmed ${data.garmentType} order`,
        heading: "Customer confirmed your quote",
        lines: [
          `${data.customerName || "A customer"} confirmed you for this order.`,
          money(data.amount) ? `Confirmed amount: ${money(data.amount)}` : null,
          data.customerAddress ? `Customer address: ${data.customerAddress}` : null
        ]
      };

    case "order_status_customer":
      return {
        subject: `Order update: ${data.status}`,
        heading: "Your order status changed",
        lines: [
          statusCopy[data.status] || `Current status: ${data.status}`,
          data.status === "delivered" && money(data.amount)
            ? `Payable amount: ${money(data.amount)}`
            : null
        ]
      };

    case "payment_completed_tailor":
      return {
        subject: "Order payment completed",
        heading: "Payment completed",
        lines: [
          `Payment for ${data.garmentType} order is completed.`,
          money(data.amount) ? `Paid amount: ${money(data.amount)}` : null
        ]
      };

    default:
      return {
        subject: "TailorGo order update",
        heading: "Order update",
        lines: ["There is a new update on your TailorGo order."]
      };
  }
};

const renderEmail = ({ heading, lines, orderId }) => {
  const appUrl = (ENV.FRONTEND_URL || "").replace(/\/$/, "");
  const orderUrl = appUrl ? `${appUrl}/orders/${orderId}` : "";
  const safeLines = lines.filter(Boolean).map((line) => `<p>${escapeHtml(line)}</p>`).join("");

  return `
<!doctype html>
<html>
<body style="margin:0;background:#f5f7fb;font-family:Arial,sans-serif;color:#111827;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:24px;">
          <tr>
            <td>
              <h1 style="margin:0 0 16px;font-size:22px;line-height:1.25;">${escapeHtml(heading)}</h1>
              ${safeLines}
              ${orderUrl ? `<p style="margin-top:24px;"><a href="${escapeHtml(orderUrl)}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:10px 14px;border-radius:6px;">View order</a></p>` : ""}
              <p style="margin-top:24px;color:#6b7280;font-size:13px;">TailorGo</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

const worker = new Worker("tailorGo-OrderNotification", async (job) => {
  const data = job.data;
  const copy = buildEmailCopy(data);

  await transporter.sendMail({
    from: `TailorGo ${ENV.EMAIL_USER}`,
    to: data.to,
    subject: copy.subject,
    html: renderEmail({
      heading: copy.heading,
      lines: copy.lines,
      orderId: data.orderId
    })
  });
}, {
  connection,
  concurrency: 5,
  limiter: {
    max: 100,
    duration: 60 * 1000
  }
});

worker.on("completed", (job) => {
  console.log("Order notification email sent", job.data.type, job.data.to);
});

worker.on("failed", (job, error) => {
  console.log("Order notification email failed", job?.data?.type, error.message);
});
