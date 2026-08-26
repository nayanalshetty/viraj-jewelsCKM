import {
  Link,
  useParams,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import {
  useOrders,
} from "../context/OrderContext.jsx";

import "./OrderSuccess.css";

export default function OrderSuccess() {
  /* --------------------------------------------------
     GET URL PARAMETER
  -------------------------------------------------- */

  const params = useParams();

  const orderId =
    params.orderId ||
    params.id ||
    null;

  const {
    getOrderById,
  } = useOrders();

  /* --------------------------------------------------
     STATE
  -------------------------------------------------- */

  const [order, setOrder] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  /* --------------------------------------------------
     LOAD ORDER
  -------------------------------------------------- */

  useEffect(() => {
    let active = true;

    const loadOrder = async () => {
      console.log(
        "ORDER SUCCESS URL PARAM:",
        orderId
      );

      if (!orderId) {
        if (active) {
          setLoading(false);
          setOrder(null);
        }

        return;
      }

      try {
        const result =
          await getOrderById(orderId);

        console.log(
          "ORDER SUCCESS RESULT:",
          result
        );

        if (active) {
          setOrder(result);
        }
      } catch (error) {
        console.error(
          "ORDER SUCCESS ERROR:",
          error
        );

        if (active) {
          setOrder(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadOrder();

    return () => {
      active = false;
    };
  }, [
    orderId,
    getOrderById,
  ]);

  /* --------------------------------------------------
     PRICE FORMAT
  -------------------------------------------------- */

  const formatPrice = (price) =>
    Number(
      price || 0
    ).toLocaleString("en-IN");

  /* --------------------------------------------------
     LOADING
  -------------------------------------------------- */

  if (loading) {
    return (
      <main className="order-success-page">

        <section className="order-success-wrapper">

          <div className="success-icon">
            ✓
          </div>

          <p className="success-eyebrow">
            VIRAJ JEWELLERY
          </p>

          <h1>
            Loading Your Order
          </h1>

          <p className="success-message">
            Please wait while we retrieve
            your order details.
          </p>

        </section>

      </main>
    );
  }

  /* --------------------------------------------------
     ORDER NOT FOUND
  -------------------------------------------------- */

  if (!order) {
    return (
      <main className="order-success-page">

        <section className="order-success-wrapper">

          <div className="success-icon">
            !
          </div>

          <p className="success-eyebrow">
            VIRAJ JEWELLERY
          </p>

          <h1>
            Order Not Found
          </h1>

          <p className="success-message">
            We could not find this order.
            Please check your order link
            or return to the home page.
          </p>

          <p
            style={{
              marginTop: "20px",
              color: "#b78335",
              fontWeight: "600",
            }}
          >
            Order ID:{" "}
            {orderId || "N/A"}
          </p>

          <div className="success-actions">

            <Link
              to="/category"
              className="success-primary-button"
            >
              Continue Shopping
            </Link>

            <Link
              to="/"
              className="success-secondary-button"
            >
              Back to Home
            </Link>

          </div>

        </section>

      </main>
    );
  }

  /* --------------------------------------------------
     ORDER DATE
  -------------------------------------------------- */

  const orderDate =
    order.createdAt
      ? new Date(
          order.createdAt
        ).toLocaleString(
          "en-IN",
          {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        )
      : "N/A";

  /* --------------------------------------------------
     ITEMS
  -------------------------------------------------- */

  const items =
    Array.isArray(order.items)
      ? order.items
      : [];

  /* --------------------------------------------------
     PAYMENT
  -------------------------------------------------- */

  const paymentMethod =
    order.paymentMethod === "cod"
      ? "Cash on Delivery"
      : "Online Payment";

  /* --------------------------------------------------
     RENDER
  -------------------------------------------------- */

  return (
    <main className="order-success-page">

      <section className="order-success-wrapper">

        {/* SUCCESS ICON */}

        <div className="success-icon">
          ✓
        </div>

        {/* BRAND */}

        <p className="success-eyebrow">
          VIRAJ JEWELLERY
        </p>

        {/* TITLE */}

        <h1>
          Order Placed Successfully
        </h1>

        <p className="success-message">
          Thank you for shopping with Viraj
          Jewellery. Your order has been
          received successfully.
        </p>

        {/* ORDER CARD */}

        <section className="order-success-card">

          {/* ORDER NUMBER */}

          <div className="order-number-box">

            <span>
              ORDER NUMBER
            </span>

            <strong>
              {order.orderNumber ||
                order.id ||
                "N/A"}
            </strong>

          </div>

          {/* DETAILS */}

          <div className="success-details">

            <div className="success-detail">

              <span>
                Payment
              </span>

              <strong>
                {paymentMethod}
              </strong>

            </div>

            <div className="success-detail">

              <span>
                Payment Status
              </span>

              <strong className="status-pending">
                {order.paymentStatus ||
                  "pending"}
              </strong>

            </div>

            <div className="success-detail">

              <span>
                Order Status
              </span>

              <strong className="status-new">
                {order.orderStatus ||
                  "new"}
              </strong>

            </div>

            <div className="success-detail">

              <span>
                Order Date
              </span>

              <strong>
                {orderDate}
              </strong>

            </div>

          </div>

          {/* ITEMS */}

          <div className="success-items">

            <h2>
              Your Jewellery
            </h2>

            {items.length === 0 ? (
              <p>
                Your jewellery items are
                being processed.
              </p>
            ) : (
              items.map(
                (item, index) => {

                  const quantity =
                    Number(
                      item.quantity || 1
                    );

                  const price =
                    Number(
                      item.price || 0
                    );

                  return (
                    <div
                      className="success-item"
                      key={
                        item.id ||
                        item.productId ||
                        index
                      }
                    >

                      {/* IMAGE */}

                      <div className="success-item-image">

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

                      {/* INFO */}

                      <div className="success-item-info">

                        <strong>
                          {item.name ||
                            "Jewellery"}
                        </strong>

                        <span>
                          Quantity:{" "}
                          {quantity}
                        </span>

                      </div>

                      {/* PRICE */}

                      <strong className="success-item-price">
                        ₹
                        {formatPrice(
                          price *
                            quantity
                        )}
                      </strong>

                    </div>
                  );
                }
              )
            )}

          </div>

          {/* TOTAL */}

          <div className="success-total">

            <span>
              Total Amount
            </span>

            <strong>
              ₹
              {formatPrice(
                order.total
              )}
            </strong>

          </div>

        </section>

        {/* ACTIONS */}

        <div className="success-actions">

          <Link
            to="/category"
            className="success-primary-button"
          >
            Continue Shopping
          </Link>

          <Link
            to="/"
            className="success-secondary-button"
          >
            Back to Home
          </Link>

        </div>

        {/* TRUST */}

        <div className="success-trust">

          <div>
            <span>✓</span>

            <p>
              BIS Hallmarked

              <small>
                Certified jewellery
              </small>
            </p>
          </div>

          <div>
            <span>✓</span>

            <p>
              Secure Order

              <small>
                Safe & trusted purchase
              </small>
            </p>
          </div>

          <div>
            <span>✓</span>

            <p>
              Viraj Quality

              <small>
                Authentic jewellery
              </small>
            </p>
          </div>

        </div>

      </section>

    </main>
  );
}