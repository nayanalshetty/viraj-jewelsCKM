import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useOrders } from "../context/OrderContext.jsx";

import "./TrackOrder.css";

const STATUS_STEPS = [
  {
    key: "new",
    title: "Order Placed",
    description: "Your order has been received successfully.",
  },
  {
    key: "confirmed",
    title: "Order Confirmed",
    description: "Your order has been confirmed by Viraj Jewellery.",
  },
  {
    key: "processing",
    title: "Processing",
    description: "Your jewellery is being prepared for dispatch.",
  },
  {
    key: "shipped",
    title: "Shipped",
    description: "Your order has been handed over for delivery.",
  },
  {
    key: "out_for_delivery",
    title: "Out for Delivery",
    description: "Your order is on the way to your address.",
  },
  {
    key: "delivered",
    title: "Delivered",
    description: "Your order has been delivered successfully.",
  },
];

export default function TrackOrder() {
  const { orderId } = useParams();
  const { getOrderById } = useOrders();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadOrder = async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      const result = await getOrderById(orderId);

      if (!result) {
        setOrder(null);
        setError("We couldn't find this order.");
        return;
      }

      setOrder(result);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Track order error:", err);

      setError(
        err?.message ||
          "Unable to load your order right now."
      );
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadOrder(true);
  }, [orderId]);

  /*
   * Automatically check for status changes.
   *
   * When admin changes:
   * new → confirmed → processing → shipped...
   *
   * the customer page will update automatically.
   */
  useEffect(() => {
    if (!orderId) return;

    const interval = setInterval(() => {
      loadOrder(false);
    }, 15000);

    return () => clearInterval(interval);
  }, [orderId]);

  const getOrderStatus = () => {
    return (
      order?.orderStatus ||
      order?.order_status ||
      "new"
    ).toLowerCase();
  };

  const getOrderNumber = () => {
    return (
      order?.orderNumber ||
      order?.order_number ||
      order?.id ||
      orderId
    );
  };

  const getCustomerName = () => {
    return (
      order?.customer?.name ||
      order?.shipping_name ||
      order?.name ||
      "Customer"
    );
  };

  const getPaymentMethod = () => {
    const method =
      order?.paymentMethod ||
      order?.payment_method ||
      "cod";

    if (method === "cod") {
      return "Cash on Delivery";
    }

    return "Online Payment";
  };

  const getPaymentStatus = () => {
    return (
      order?.paymentStatus ||
      order?.payment_status ||
      "pending"
    );
  };

  const getTotal = () => {
    return Number(
      order?.total ??
        order?.total_amount ??
        0
    );
  };

  const getCreatedDate = () => {
    const value =
      order?.createdAt ||
      order?.created_at;

    if (!value) return "N/A";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (value) => {
    return Number(value || 0).toLocaleString("en-IN");
  };

  const getAddress = () => {
    const address = order?.address || {};

    return [
      address.house || order?.house,
      address.street || order?.street,
      address.city || order?.city,
      address.state || order?.state,
      address.pincode || order?.pincode,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const getStatusIndex = () => {
    const status = getOrderStatus();

    return STATUS_STEPS.findIndex(
      (step) => step.key === status
    );
  };

  const currentStatusIndex = getStatusIndex();

  const isCancelled =
    getOrderStatus() === "cancelled";

  if (loading) {
    return (
      <main className="track-order-page">
        <div className="track-order-loading">
          <div className="track-loader" />

          <p className="track-eyebrow">
            VIRAJ JEWELLERY
          </p>

          <h1>
            Loading your order
          </h1>

          <p>
            Please wait while we retrieve
            your order details.
          </p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="track-order-page">

        <div className="track-order-error">

          <div className="track-error-icon">
            !
          </div>

          <p className="track-eyebrow">
            VIRAJ JEWELLERY
          </p>

          <h1>
            Order not found
          </h1>

          <p>
            {error ||
              "We couldn't find this order."}
          </p>

          <div className="track-error-actions">

            <button
              type="button"
              className="track-primary-button"
              onClick={() =>
                loadOrder(true)
              }
            >
              Try Again
            </button>

            <Link
              to="/"
              className="track-secondary-button"
            >
              Continue Shopping
            </Link>

          </div>

        </div>

      </main>
    );
  }

  return (
    <main className="track-order-page">

      {/* =====================================================
          TOP HEADER
      ===================================================== */}

      <section className="track-order-container">

        <div className="track-order-heading">

          <div>
            <p className="track-eyebrow">
              VIRAJ JEWELLERY
            </p>

            <h1>
              Track Your Order
            </h1>

            <p className="track-heading-text">
              Follow your jewellery order from
              confirmation to delivery.
            </p>
          </div>

          <button
            type="button"
            className="track-refresh-button"
            onClick={() => loadOrder(true)}
          >
            ↻ Refresh
          </button>

        </div>


        {/* =================================================
            ORDER SUMMARY
        ================================================= */}

        <section className="track-summary-card">

          <div className="track-summary-top">

            <div>

              <span className="track-label">
                ORDER NUMBER
              </span>

              <strong className="track-order-number">
                {getOrderNumber()}
              </strong>

            </div>

            <div className="track-current-status">

              <span className="track-label">
                CURRENT STATUS
              </span>

              <strong
                className={`track-status-badge ${
                  isCancelled
                    ? "cancelled"
                    : ""
                }`}
              >
                {isCancelled
                  ? "Cancelled"
                  : STATUS_STEPS[
                      currentStatusIndex
                    ]?.title ||
                    "Order Placed"}
              </strong>

            </div>

          </div>


          <div className="track-summary-divider" />


          <div className="track-summary-grid">

            <div>
              <span className="track-label">
                ORDER DATE
              </span>

              <strong>
                {getCreatedDate()}
              </strong>
            </div>

            <div>
              <span className="track-label">
                PAYMENT
              </span>

              <strong>
                {getPaymentMethod()}
              </strong>
            </div>

            <div>
              <span className="track-label">
                PAYMENT STATUS
              </span>

              <strong className="track-payment-status">
                {getPaymentStatus()}
              </strong>
            </div>

            <div>
              <span className="track-label">
                TOTAL
              </span>

              <strong className="track-total">
                ₹{formatPrice(getTotal())}
              </strong>
            </div>

          </div>

        </section>


        {/* =================================================
            CANCELLED
        ================================================= */}

        {isCancelled ? (

          <section className="track-cancelled-card">

            <div className="track-cancelled-icon">
              ×
            </div>

            <div>
              <h2>
                Order Cancelled
              </h2>

              <p>
                This order has been cancelled.
                Please contact Viraj Jewellery
                if you need assistance.
              </p>
            </div>

          </section>

        ) : (

          /* =================================================
             TRACKING TIMELINE
          ================================================= */

          <section className="track-timeline-card">

            <div className="track-section-heading">

              <div>
                <p className="track-eyebrow">
                  DELIVERY JOURNEY
                </p>

                <h2>
                  Order Status
                </h2>
              </div>

              <span className="track-live">
                ● LIVE
              </span>

            </div>


            <div className="track-timeline">

              {STATUS_STEPS.map(
                (step, index) => {

                  const completed =
                    index <
                    currentStatusIndex;

                  const active =
                    index ===
                    currentStatusIndex;

                  const upcoming =
                    index >
                    currentStatusIndex;

                  return (
                    <div
                      key={step.key}
                      className={`track-step ${
                        completed
                          ? "completed"
                          : ""
                      } ${
                        active
                          ? "active"
                          : ""
                      } ${
                        upcoming
                          ? "upcoming"
                          : ""
                      }`}
                    >

                      <div className="track-step-line-wrap">

                        <div className="track-step-dot">

                          {completed
                            ? "✓"
                            : active
                            ? "•"
                            : ""}

                        </div>

                        {index <
                          STATUS_STEPS.length -
                            1 && (
                          <div className="track-step-line" />
                        )}

                      </div>


                      <div className="track-step-content">

                        <div className="track-step-title-row">

                          <h3>
                            {step.title}
                          </h3>

                          {active && (
                            <span className="track-active-pill">
                              CURRENT
                            </span>
                          )}

                        </div>

                        <p>
                          {step.description}
                        </p>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </section>
        )}


        {/* =================================================
            ORDER ITEMS
        ================================================= */}

        {order.items &&
          order.items.length > 0 && (

            <section className="track-items-card">

              <div className="track-section-heading">

                <div>
                  <p className="track-eyebrow">
                    YOUR PURCHASE
                  </p>

                  <h2>
                    Jewellery Items
                  </h2>
                </div>

              </div>


              <div className="track-items">

                {order.items.map(
                  (item, index) => (

                    <div
                      className="track-item"
                      key={
                        item.id ||
                        item.productId ||
                        index
                      }
                    >

                      <div className="track-item-image">

                        {item.image ? (
                          <img
                            src={item.image}
                            alt={
                              item.name ||
                              "Jewellery"
                            }
                          />
                        ) : (
                          <span>
                            V
                          </span>
                        )}

                      </div>


                      <div className="track-item-details">

                        <h3>
                          {item.name ||
                            "Jewellery"}
                        </h3>

                        <p>
                          Quantity:{" "}
                          {Number(
                            item.quantity ||
                              1
                          )}
                        </p>

                      </div>


                      <strong className="track-item-price">
                        ₹
                        {formatPrice(
                          Number(
                            item.price || 0
                          ) *
                            Number(
                              item.quantity ||
                                1
                            )
                        )}
                      </strong>

                    </div>

                  )
                )}

              </div>

            </section>
          )}


        {/* =================================================
            DELIVERY ADDRESS
        ================================================= */}

        <section className="track-details-grid">

          <div className="track-detail-card">

            <p className="track-eyebrow">
              DELIVERING TO
            </p>

            <h2>
              {getCustomerName()}
            </h2>

            <p>
              {getAddress() ||
                "Delivery address not available"}
            </p>

          </div>


          <div className="track-detail-card">

            <p className="track-eyebrow">
              NEED HELP?
            </p>

            <h2>
              We're here to help
            </h2>

            <p>
              If you have questions about your
              order, please contact Viraj
              Jewellery.
            </p>

          </div>

        </section>


        {/* =================================================
            FOOTER ACTIONS
        ================================================= */}

        <section className="track-actions">

          <Link
            to="/"
            className="track-primary-button"
          >
            Continue Shopping
          </Link>

          <button
            type="button"
            className="track-secondary-button"
            onClick={() => loadOrder(true)}
          >
            Check Latest Status
          </button>

        </section>


        {lastUpdated && (
          <p className="track-last-updated">
            Last checked{" "}
            {lastUpdated.toLocaleTimeString(
              "en-IN",
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            )}
            {" "}· Status updates automatically
          </p>
        )}

      </section>

    </main>
  );
}