import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { bookingApi } from "../lib/api";
import { useAuth } from "../context/useAuth";
import {
  formatDate,
  formatMoney,
  getId,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONES,
  shortId,
} from "../lib/orderUtils";
import "../styles/booking.css";

export default function TailorRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [orders, setOrders] = useState([]);
  const [quoteForms, setQuoteForms] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = async () => {
    const [requestResponse, orderResponse] = await Promise.all([
      bookingApi.getTailorRequests(),
      bookingApi.getMyOrders(),
    ]);

    setRequests(requestResponse?.data || []);
    setOrders(orderResponse?.data || []);
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [requestResponse, orderResponse] = await Promise.all([
          bookingApi.getTailorRequests(),
          bookingApi.getMyOrders(),
        ]);

        if (!mounted) return;
        setRequests(requestResponse?.data || []);
        setOrders(orderResponse?.data || []);
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
  }, []);

  const updateQuoteForm = (orderId, field, value) => {
    setQuoteForms((current) => ({
      ...current,
      [orderId]: {
        ...(current[orderId] || {}),
        [field]: value,
      },
    }));
  };

  const handleAccept = async (order) => {
    const form = quoteForms[order._id] || {};
    const needsPrice = !order.broadcast?.matchedService;

    if (needsPrice && !form.estimatedPrice) {
      setError("Quote price is required for fallback requests.");
      return;
    }

    setActionLoading(order._id);
    setError("");
    setNotice("");

    try {
      await bookingApi.acceptOrder(order._id, {
        estimatedDays: form.estimatedDays || undefined,
        estimatedPrice: needsPrice ? form.estimatedPrice : undefined,
      });
      await loadData();
      setNotice("Request accepted. Customer can now confirm you.");
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading("");
    }
  };

  const activeOrders = orders.filter((order) => (
    getId(order.confirmedTailor) === user?.id && order.status !== "completed" && order.status !== "cancelled"
  ));

  return (
    <main className="order-page">
      <section className="order-hero compact">
        <div>
          <p className="order-kicker">Tailor workspace</p>
          <h1>Requests and orders</h1>
          <p>Accept nearby customer requests and update confirmed order progress.</p>
        </div>
        <button className="order-link-button" type="button" onClick={() => loadData()}>
          Refresh
        </button>
      </section>

      {notice && <div className="order-message success">{notice}</div>}
      {error && <div className="order-message error">{error}</div>}
      {loading && <div className="order-empty">Loading tailor requests...</div>}

      {!loading && (
        <div className="order-detail-layout">
          <section className="order-detail-main">
            <article className="order-panel">
              <div className="order-panel-head">
                <h2>Open requests</h2>
                <p>Requests shown here were broadcasted to your tailor account.</p>
              </div>

              {requests.length === 0 ? (
                <div className="order-empty inline">No open requests right now.</div>
              ) : (
                <div className="tailor-request-list">
                  {requests.map((order) => {
                    const form = quoteForms[order._id] || {};
                    const needsPrice = !order.broadcast?.matchedService;

                    return (
                      <article className="tailor-request-card" key={order._id}>
                        <div className="tailor-request-head">
                          <div>
                            <p className="order-kicker">Order #{shortId(order._id)}</p>
                            <h3>{order.garmentType}</h3>
                            <p>{order.fabricType || "Fabric not set"} - {formatDate(order.createdAt)}</p>
                          </div>
                          <Link to={`/orders/${order._id}`} className="order-card-action">Open</Link>
                        </div>

                        <div className="order-card-meta">
                          <span>{order.broadcast?.distanceKm ?? "?"} km away</span>
                          <span>{order.broadcast?.matchedService ? "Service match" : "Fallback request"}</span>
                          <span>{order.broadcast?.listedServicePrice !== undefined ? formatMoney(order.broadcast.listedServicePrice) : "Quote needed"}</span>
                        </div>

                        {order.customerNote && <p className="tailor-note-line">{order.customerNote}</p>}

                        {order.hasAccepted ? (
                          <div className="order-price-banner">
                            <span>You accepted this request</span>
                            <strong>{formatMoney(order.quote?.estimatedPrice)}</strong>
                          </div>
                        ) : (
                          <div className="tailor-accept-grid">
                            {needsPrice && (
                              <div className="order-field">
                                <label htmlFor={`price-${order._id}`}>Quote price</label>
                                <input
                                  id={`price-${order._id}`}
                                  type="number"
                                  min="0"
                                  value={form.estimatedPrice || ""}
                                  onChange={(event) => updateQuoteForm(order._id, "estimatedPrice", event.target.value)}
                                />
                              </div>
                            )}
                            <div className="order-field">
                              <label htmlFor={`days-${order._id}`}>Estimated days</label>
                              <input
                                id={`days-${order._id}`}
                                type="number"
                                min="1"
                                max="365"
                                value={form.estimatedDays || ""}
                                onChange={(event) => updateQuoteForm(order._id, "estimatedDays", event.target.value)}
                              />
                            </div>
                            <button className="order-primary-action small" type="button" onClick={() => handleAccept(order)} disabled={actionLoading === order._id}>
                              {actionLoading === order._id ? "Accepting" : "Accept"}
                            </button>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </article>
          </section>

          <aside className="order-summary-panel">
            <h2>Active orders</h2>
            {activeOrders.length === 0 ? (
              <p className="order-muted">Confirmed orders will appear here.</p>
            ) : (
              <div className="tailor-active-list">
                {activeOrders.map((order) => (
                  <Link to={`/orders/${order._id}`} className="tailor-active-card" key={order._id}>
                    <strong>{order.garmentType}</strong>
                    <span className={`order-status ${ORDER_STATUS_TONES[order.status] || "muted"}`}>
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </span>
                    <small>#{shortId(order._id)}</small>
                  </Link>
                ))}
              </div>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
