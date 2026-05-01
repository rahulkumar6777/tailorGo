import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { bookingApi } from "../lib/api";
import { useAuth } from "../context/useAuth";
import {
  formatDate,
  formatMoney,
  getId,
  getOrderPrice,
  getTailorName,
  ORDER_STATUS_ACTIONS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONES,
  PAYMENT_STATUS_LABELS,
  shortId,
  TAILOR_NEXT_STATUSES,
} from "../lib/orderUtils";
import "../styles/booking.css";

const loadRazorpayCheckout = () => new Promise((resolve, reject) => {
  if (window.Razorpay) {
    resolve(true);
    return;
  }

  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.onload = () => resolve(true);
  script.onerror = () => reject(new Error("Could not load Razorpay checkout."));
  document.body.appendChild(script);
});

const getBroadcastForTailor = (order, tailorId) => (
  (order?.broadcastedTailors || []).find((item) => getId(item.tailor) === tailorId)
);

const getConfirmedTailorId = (order) => getId(order?.confirmedTailor);

export default function OrderDetails() {
  const { orderId } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(location.state?.flash || "");
  const [acceptForm, setAcceptForm] = useState({ estimatedDays: "", estimatedPrice: "" });
  const [cancelReason, setCancelReason] = useState("");

  const isCustomer = user?.role === "customer";
  const isTailor = user?.role === "tailor";
  const tailorBroadcast = useMemo(() => (
    isTailor ? getBroadcastForTailor(order, user?.id) : null
  ), [isTailor, order, user?.id]);
  const isConfirmedTailor = isTailor && getConfirmedTailorId(order) === user?.id;
  const nextStatus = TAILOR_NEXT_STATUSES[order?.status];

  const loadOrder = useCallback(async () => {
    const response = await bookingApi.getOrder(orderId);
    setOrder(response?.data || null);
  }, [orderId]);

  const loadResponses = useCallback(async () => {
    if (!isCustomer) return;
    const response = await bookingApi.getAcceptedTailors(orderId);
    setResponses(response?.data || []);
  }, [isCustomer, orderId]);

  const refreshAll = useCallback(async () => {
    setError("");
    await loadOrder();
    await loadResponses();
  }, [loadOrder, loadResponses]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await bookingApi.getOrder(orderId);
        if (!mounted) return;
        setOrder(response?.data || null);

        if (user?.role === "customer") {
          const tailorResponse = await bookingApi.getAcceptedTailors(orderId);
          if (mounted) setResponses(tailorResponse?.data || []);
        }
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [orderId, user?.role]);

  const runAction = async (name, action, successMessage) => {
    setActionLoading(name);
    setError("");
    setNotice("");

    try {
      await action();
      await refreshAll();
      setNotice(successMessage);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading("");
    }
  };

  const handleAccept = async (event) => {
    event.preventDefault();
    const needsPrice = !tailorBroadcast?.matchedService;

    if (needsPrice && !acceptForm.estimatedPrice) {
      setError("Quote price is required for fallback requests.");
      return;
    }

    await runAction(
      "accept",
      () => bookingApi.acceptOrder(orderId, {
        estimatedDays: acceptForm.estimatedDays || undefined,
        estimatedPrice: needsPrice ? acceptForm.estimatedPrice : undefined,
      }),
      "Order accepted. The customer can now compare and confirm.",
    );
  };

  const handleConfirm = async (responseId) => {
    await runAction(
      responseId,
      () => bookingApi.confirmTailor(orderId, { responseId }),
      "Tailor confirmed for this order.",
    );
  };

  const handleStatusUpdate = async () => {
    if (!nextStatus) return;

    await runAction(
      "status",
      () => bookingApi.updateOrderStatus(orderId, nextStatus),
      "Order status updated.",
    );
  };

  const handleCancel = async (event) => {
    event.preventDefault();

    await runAction(
      "cancel",
      () => bookingApi.cancelOrder(orderId, cancelReason),
      "Order cancelled.",
    );
  };

  const handlePayment = async () => {
    await runAction("payment", async () => {
      const paymentResponse = await bookingApi.createPaymentOrder(orderId);
      const paymentOrder = paymentResponse?.data;

      await loadRazorpayCheckout();

      await new Promise((resolve, reject) => {
        const checkout = new window.Razorpay({
          key: paymentOrder.keyId,
          order_id: paymentOrder.razorpayOrderId,
          name: "TailorGo",
          description: `${order?.garmentType || "TailorGo"} order payment`,
          handler: async (razorpayResponse) => {
            try {
              await bookingApi.verifyPayment(orderId, {
                razorpayOrderId: razorpayResponse.razorpay_order_id,
                razorpayPaymentId: razorpayResponse.razorpay_payment_id,
                razorpaySignature: razorpayResponse.razorpay_signature,
              });
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          modal: {
            ondismiss: () => reject(new Error("Payment window was closed.")),
          },
          prefill: {
            name: order?.customer?.fullName || "",
            email: order?.customer?.email || "",
          },
          theme: {
            color: "#14224e",
          },
        });

        checkout.open();
      });
    }, "Payment completed.");
  };

  const canCancel = (
    (isCustomer && ["pending_broadcast", "broadcasted", "no_tailors_found"].includes(order?.status))
    || (isConfirmedTailor && order?.status === "confirmed")
  );

  if (loading) {
    return <main className="order-page"><div className="order-empty">Loading order...</div></main>;
  }

  if (error && !order) {
    return (
      <main className="order-page">
        <div className="order-message error">{error}</div>
        <Link to={isTailor ? "/tailor-requests" : "/orders"} className="order-primary-link">Back</Link>
      </main>
    );
  }

  return (
    <main className="order-page">
      <section className="order-hero compact">
        <div>
          <p className="order-kicker">Order #{shortId(order?._id)}</p>
          <h1>{order?.garmentType}</h1>
          <p>{order?.fabricType || "Fabric not set"} order created on {formatDate(order?.createdAt)}</p>
        </div>
        <span className={`order-status large ${ORDER_STATUS_TONES[order?.status] || "muted"}`}>
          {ORDER_STATUS_LABELS[order?.status] || order?.status}
        </span>
      </section>

      {notice && <div className="order-message success">{notice}</div>}
      {error && <div className="order-message error">{error}</div>}

      <div className="order-detail-layout">
        <section className="order-detail-main">
          <article className="order-panel">
            <div className="order-panel-head">
              <h2>Order details</h2>
              <p>Customer request and delivery information.</p>
            </div>

            <div className="order-info-grid">
              <div><span>Garment</span><strong>{order?.garmentType}</strong></div>
              <div><span>Fabric</span><strong>{order?.fabricType || "Not set"}</strong></div>
              <div><span>Fabric color</span><strong>{order?.fabricColor || "Not set"}</strong></div>
              <div><span>Measurement</span><strong>{order?.measurementPreference?.replace("_", " ")}</strong></div>
              <div><span>Delivery method</span><strong>{order?.deliveryMethod?.replace("_", " ")}</strong></div>
              <div><span>Payment</span><strong>{PAYMENT_STATUS_LABELS[order?.payment?.status] || "Payment pending"}</strong></div>
            </div>

            <div className="order-address-box">
              <span>Address</span>
              <strong>{order?.deliveryAddress?.line1}</strong>
              <p>{[order?.deliveryAddress?.line2, order?.deliveryAddress?.landmark, order?.deliveryAddress?.city, order?.deliveryAddress?.state, order?.deliveryAddress?.pincode].filter(Boolean).join(", ")}</p>
            </div>

            {order?.customerNote && (
              <div className="order-address-box">
                <span>Customer note</span>
                <p>{order.customerNote}</p>
              </div>
            )}
          </article>

          {isCustomer && order?.status === "broadcasted" && (
            <article className="order-panel">
              <div className="order-panel-head with-action">
                <div>
                  <h2>Accepted tailors</h2>
                  <p>Compare price, distance, rating, and experience before confirming.</p>
                </div>
                <button className="order-secondary-action" type="button" onClick={() => runAction("refresh", refreshAll, "Quotes refreshed.")} disabled={actionLoading === "refresh"}>
                  Refresh
                </button>
              </div>

              {responses.length === 0 ? (
                <div className="order-empty inline">No tailor has accepted yet.</div>
              ) : (
                <div className="tailor-response-list">
                  {responses.map((response) => (
                    <div className="tailor-response-card" key={response.responseId}>
                      <div>
                        <h3>{getTailorName(response.tailor)}</h3>
                        <p>{response.tailor?.shopAddress || "Address not listed"}</p>
                        <div className="order-card-meta">
                          <span>{formatMoney(response.estimatedPrice)}</span>
                          <span>{response.estimatedDays ? `${response.estimatedDays} day(s)` : "ETA not set"}</span>
                          <span>{response.broadcast?.distanceKm ?? "?"} km</span>
                          <span>{response.tailor?.averageRating || response.tailor?.rating || 0} rating</span>
                        </div>
                      </div>
                      <button className="order-primary-action small" type="button" onClick={() => handleConfirm(response.responseId)} disabled={Boolean(actionLoading)}>
                        {actionLoading === response.responseId ? "Confirming" : "Confirm"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </article>
          )}

          {isTailor && order?.status === "broadcasted" && tailorBroadcast && (
            <article className="order-panel">
              <div className="order-panel-head">
                <h2>Accept request</h2>
                <p>{tailorBroadcast.matchedService ? "Your listed service price will be used automatically." : "This is a fallback request, so add your quote price."}</p>
              </div>

              <form className="order-inline-form" onSubmit={handleAccept}>
                {tailorBroadcast.matchedService && (
                  <div className="order-price-banner">
                    <span>Auto price from profile</span>
                    <strong>{formatMoney(tailorBroadcast.listedServicePrice)}</strong>
                  </div>
                )}

                {!tailorBroadcast.matchedService && (
                  <div className="order-field">
                    <label htmlFor="quotePrice">Quote price</label>
                    <input
                      id="quotePrice"
                      type="number"
                      min="0"
                      value={acceptForm.estimatedPrice}
                      onChange={(event) => setAcceptForm((current) => ({ ...current, estimatedPrice: event.target.value }))}
                    />
                  </div>
                )}

                <div className="order-field">
                  <label htmlFor="estimatedDays">Estimated days</label>
                  <input
                    id="estimatedDays"
                    type="number"
                    min="1"
                    max="365"
                    value={acceptForm.estimatedDays}
                    onChange={(event) => setAcceptForm((current) => ({ ...current, estimatedDays: event.target.value }))}
                  />
                </div>

                <button className="order-primary-action" type="submit" disabled={actionLoading === "accept"}>
                  {actionLoading === "accept" ? "Accepting" : "Accept order"}
                </button>
              </form>
            </article>
          )}

          {isConfirmedTailor && nextStatus && (
            <article className="order-panel">
              <div className="order-panel-head">
                <h2>Update work status</h2>
                <p>Move the order to the next stage when ready.</p>
              </div>
              <button className="order-primary-action" type="button" onClick={handleStatusUpdate} disabled={actionLoading === "status"}>
                {actionLoading === "status" ? "Updating" : ORDER_STATUS_ACTIONS[nextStatus]}
              </button>
            </article>
          )}
        </section>

        <aside className="order-summary-panel">
          <h2>Summary</h2>
          <div className="order-summary-list">
            <div><span>Tailor</span><strong>{order?.confirmedTailor ? getTailorName(order.confirmedTailor) : "Not confirmed"}</strong></div>
            <div><span>Quote</span><strong>{formatMoney(getOrderPrice(order), order?.payment?.currency)}</strong></div>
            <div><span>Responses</span><strong>{order?.tailorResponses?.length || 0}</strong></div>
            <div><span>Broadcast</span><strong>{order?.broadcastMode?.replace("_", " ") || "None"}</strong></div>
          </div>

          {isCustomer && order?.status === "delivered" && order?.payment?.status !== "paid" && (
            <button className="order-primary-action" type="button" onClick={handlePayment} disabled={actionLoading === "payment"}>
              {actionLoading === "payment" ? "Opening payment" : "Pay now"}
            </button>
          )}

          {canCancel && (
            <form className="order-cancel-box" onSubmit={handleCancel}>
              <label htmlFor="cancelReason">Cancel reason</label>
              <textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                placeholder="Optional"
              />
              <button className="order-danger-action" type="submit" disabled={actionLoading === "cancel"}>
                {actionLoading === "cancel" ? "Cancelling" : "Cancel order"}
              </button>
            </form>
          )}

          <Link to={isTailor ? "/tailor-requests" : "/orders"} className="order-link-button full">Back to list</Link>
        </aside>
      </div>
    </main>
  );
}
