import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { bookingApi } from "../lib/api";
import {
  formatDate,
  formatMoney,
  getOrderPrice,
  getTailorName,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONES,
  shortId,
} from "../lib/orderUtils";
import "../styles/booking.css";

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadOrders = async () => {
      try {
        const response = await bookingApi.getMyOrders();
        if (mounted) setOrders(response?.data || []);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadOrders();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="order-page">
      <section className="order-hero compact">
        <div>
          <p className="order-kicker">Customer orders</p>
          <h1>My orders</h1>
          <p>Track tailor quotes, confirmations, stitching progress, delivery, and payment.</p>
        </div>
        <Link to="/booking" className="order-link-button">Create order</Link>
      </section>

      {loading && <div className="order-empty">Loading your orders...</div>}
      {error && <div className="order-message error">{error}</div>}

      {!loading && !error && orders.length === 0 && (
        <section className="order-empty">
          <h2>No orders yet</h2>
          <p>Create your first stitching order and nearby tailors will get notified.</p>
          <Link to="/booking" className="order-primary-link">Create order</Link>
        </section>
      )}

      <section className="order-list">
        {orders.map((order) => (
          <article className="order-list-card" key={order._id}>
            <div className="order-list-main">
              <div className="order-list-title">
                <h2>{order.garmentType}</h2>
                <span className={`order-status ${ORDER_STATUS_TONES[order.status] || "muted"}`}>
                  {ORDER_STATUS_LABELS[order.status] || order.status}
                </span>
              </div>
              <p>Order #{shortId(order._id)} created on {formatDate(order.createdAt)}</p>
              <div className="order-card-meta">
                <span>{order.fabricType || "Fabric not set"}</span>
                <span>{order.confirmedTailor ? getTailorName(order.confirmedTailor) : "Tailor pending"}</span>
                <span>{formatMoney(getOrderPrice(order), order.payment?.currency)}</span>
              </div>
            </div>
            <Link to={`/orders/${order._id}`} className="order-card-action">Open</Link>
          </article>
        ))}
      </section>
    </main>
  );
}
