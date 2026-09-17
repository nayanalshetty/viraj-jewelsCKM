import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { supabase } from "../lib/supabase.js";

import "./MyOrders.css";

const STATUS_LABELS = {
  new: "Order Placed",
  confirmed: "Order Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_STEPS = [
  {
    key: "new",
    label: "Order Placed",
  },
  {
    key: "confirmed",
    label: "Confirmed",
  },
  {
    key: "processing",
    label: "Processing",
  },
  {
    key: "shipped",
    label: "Shipped",
  },
  {
    key: "out_for_delivery",
    label: "Out for Delivery",
  },
  {
    key: "delivered",
    label: "Delivered",
  },
];

function formatPrice(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatDate(value) {
  if (!value) return "";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusIndex(status) {
  const index = STATUS_STEPS.findIndex(
    (step) => step.key === status
  );

  return index < 0 ? 0 : index;
}

function getOrderNumber(order) {
  return (
    order.order_number ||
    order.orderNumber ||
    `#${String(order.id || "").slice(0, 8)}`
  );
}

function getCustomerId(order) {
  return (
    order.customer_id ||
    order.customerId ||
    ""
  );
}

function getImage(item) {
  return (
    item?.image ||
    item?.image_url ||
    item?.product_image ||
    ""
  );
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOrders() {
    try {
      setError("");

      const {
        data: {
          user,
        },
      } = await supabase.auth.getUser();

      if (!user) {
        setOrders([]);
        return;
      }

      /*
       * Customer orders only.
       */
      const { data, error: ordersError } =
        await supabase
          .from("orders")
          .select("*")
          .eq("customer_id", user.id)
          .order("created_at", {
            ascending: false,
          });

      if (ordersError) {
        throw ordersError;
      }

      setOrders(data || []);
    } catch (err) {
      console.error(
        "MY ORDERS ERROR:",
        err
      );

      setError(
        err?.message ||
          "Unable to load your orders."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();

    /*
     * Check for admin status changes
     * every 10 seconds.
     */
    const interval = setInterval(
      loadOrders,
      10000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  const visibleOrders = useMemo(() => {
    return [...orders].sort(
      (a, b) =>
        new Date(
          b.created_at || 0
        ) -
        new Date(
          a.created_at || 0
        )
    );
  }, [orders]);

  if (loading) {
    return (
      <main className="my-orders-page">
        <div className="my-orders-loading">
          <span>VIRAJ JEWELLERY</span>
          <h1>Loading your orders...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="my-orders-page">
      <section className="my-orders-shell">

        {/* HEADER */}

        <div className="my-orders-heading">
          <div>
            <p className="my-orders-eyebrow">
              VIRAJ JEWELLERY
            </p>

            <h1>My Orders</h1>

            <p>
              View your orders and check the
              latest order status.
            </p>
          </div>

          <Link
            to="/"
            className="my-orders-shopping"
          >
            Continue Shopping
          </Link>
        </div>

        {/* ERROR */}

        {error && (
          <div className="my-orders-error">
            <strong>
              Unable to load orders
            </strong>

            <span>{error}</span>

            <button
              type="button"
              onClick={() => {
                setLoading(true);
                loadOrders();
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* NOT LOGGED IN */}

        {!error &&
          !loading &&
          orders.length === 0 && (
            <div className="my-orders-empty">
              <div className="my-orders-empty-icon">
                ♡
              </div>

              <h2>No orders yet</h2>

              <p>
                Your placed orders will appear
                here.
              </p>

              <Link to="/">
                Explore Jewellery
              </Link>
            </div>
          )}

        {/* ORDERS */}

        <div className="my-orders-list">
          {visibleOrders.map((order) => {
            const status =
              order.order_status || "new";

            const statusIndex =
              getStatusIndex(status);

            const isCancelled =
              status === "cancelled";

            return (
              <article
                className={`my-order-card ${
                  isCancelled
                    ? "cancelled"
                    : ""
                }`}
                key={order.id}
              >
                {/* TOP */}

                <div className="my-order-top">
                  <div>
                    <span className="my-order-label">
                      ORDER
                    </span>

                    <strong>
                      {getOrderNumber(order)}
                    </strong>
                  </div>

                  <div className="my-order-date">
                    {formatDate(
                      order.created_at
                    )}
                  </div>
                </div>

                {/* STATUS */}

                <div className="my-order-status-row">
                  <div>
                    <span className="my-order-label">
                      CURRENT STATUS
                    </span>

                    <strong
                      className={`status-text status-${status}`}
                    >
                      {STATUS_LABELS[status] ||
                        status}
                    </strong>
                  </div>

                  <div className="my-order-total">
                    <span className="my-order-label">
                      TOTAL
                    </span>

                    <strong>
                      {formatPrice(
                        order.total_amount
                      )}
                    </strong>
                  </div>
                </div>

                {/* TRACKING */}

                {!isCancelled && (
                  <div className="my-order-progress">
                    {STATUS_STEPS.map(
                      (step, index) => {
                        const completed =
                          index <=
                          statusIndex;

                        const active =
                          step.key ===
                          status;

                        return (
                          <div
                            className={`order-progress-step ${
                              completed
                                ? "completed"
                                : ""
                            } ${
                              active
                                ? "active"
                                : ""
                            }`}
                            key={
                              step.key
                            }
                          >
                            <span className="order-progress-dot">
                              {completed
                                ? "✓"
                                : ""}
                            </span>

                            <small>
                              {step.label}
                            </small>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}

                {/* CANCELLED */}

                {isCancelled && (
                  <div className="my-order-cancelled">
                    This order has been cancelled.
                  </div>
                )}

                {/* ORDER INFO */}

                <div className="my-order-info">
                  <div>
                    <span>Payment</span>
                    <strong>
                      {String(
                        order.payment_method ||
                          "COD"
                      ).toUpperCase()}
                    </strong>
                  </div>

                  <div>
                    <span>Payment Status</span>
                    <strong>
                      {String(
                        order.payment_status ||
                          "pending"
                      )
                        .replace(
                          /_/g,
                          " "
                        )
                        .replace(
                          /^./,
                          (char) =>
                            char.toUpperCase()
                        )}
                    </strong>
                  </div>

                  <div>
                    <span>Delivery</span>
                    <strong>
                      {order.city ||
                        "India"}
                    </strong>
                  </div>
                </div>

                {/* ACTIONS */}

                <div className="my-order-actions">
                  <Link
                    to={`/track-order/${order.id}`}
                    className="my-order-track"
                  >
                    Track Order
                  </Link>

                  <Link
                    to={`/order-success/${order.id}`}
                    className="my-order-view"
                  >
                    View Order
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}