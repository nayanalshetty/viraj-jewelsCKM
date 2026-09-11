import { Link, useParams } from "react-router-dom";
import { useOrders } from "../context/OrderContext.jsx";
import "./OrderSuccess.css";

export default function OrderSuccess() {
  const { orderId } = useParams();
  const { orders } = useOrders();

  const order = orders?.find(
    (item) => String(item.id) === String(orderId)
  );

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-IN");

  return (
    <main className="order-success-page">

      <section className="order-success-card">

        {/* SUCCESS ICON */}

        <div className="order-success-icon">
          ✓
        </div>

        <p className="order-success-eyebrow">
          VIRAJ JEWELLERY
        </p>

        <h1>
          Order Placed Successfully
        </h1>

        <p className="order-success-message">
          Thank you for choosing Viraj Jewellery.
          Your order has been received successfully.
        </p>

        {/* ORDER ID */}

        {orderId && (
          <div className="order-success-id">
            <span>ORDER ID</span>
            <strong>#{orderId}</strong>
          </div>
        )}

        {/* ORDER DETAILS */}

        {order && (
          <div className="order-success-details">

            <div>
              <span>Customer</span>
              <strong>{order.name}</strong>
            </div>

            <div>
              <span>Payment</span>
              <strong>
                {order.payment_method === "cod"
                  ? "Cash on Delivery"
                  : "Online Payment"}
              </strong>
            </div>

            <div>
              <span>Total</span>
              <strong>
                ₹{formatPrice(order.total)}
              </strong>
            </div>

          </div>
        )}

        {/* COD MESSAGE */}

        <div className="order-success-note">
          <strong>Cash on Delivery</strong>
          <span>
            Please keep the required amount ready
            when your jewellery is delivered.
          </span>
        </div>

        {/* ACTIONS */}

        <div className="order-success-actions">

          <Link
            to="/"
            className="order-success-primary"
          >
            Continue Shopping
          </Link>

          <Link
            to="/category"
            className="order-success-secondary"
          >
            Explore Jewellery
          </Link>

        </div>

      </section>

    </main>
  );
}