import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import { useCart } from "../context/CartContext.jsx";
import { useOrders } from "../context/OrderContext.jsx";

import "./Checkout.css";

export default function Checkout() {
  const navigate = useNavigate();

  const {
    cart,
    cartSubtotal,
    clearCart,
  } = useCart();

  const { createOrder } = useOrders();

  const [paymentMethod, setPaymentMethod] =
    useState("cod");

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    house: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  /*
   * PRICE FORMATTER
   */
  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString(
      "en-IN"
    );
  };

  /*
   * FORM CHANGE
   */
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    /*
     * Clear previous error while typing.
     */
    if (error) {
      setError("");
    }
  };

  /*
   * VALIDATE FORM
   */
  const validateForm = () => {
    const name =
      form.name.trim();

    const mobile =
      form.mobile.trim();

    const email =
      form.email.trim();

    const house =
      form.house.trim();

    const street =
      form.street.trim();

    const city =
      form.city.trim();

    const state =
      form.state.trim();

    const pincode =
      form.pincode.trim();

    if (!name) {
      return "Please enter your full name.";
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return "Please enter a valid 10-digit mobile number.";
    }

    if (
      email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      return "Please enter a valid email address.";
    }

    if (!house) {
      return "Please enter your house / flat number.";
    }

    if (!street) {
      return "Please enter your street / area.";
    }

    if (!city) {
      return "Please enter your city.";
    }

    if (!state) {
      return "Please enter your state.";
    }

    if (!/^\d{6}$/.test(pincode)) {
      return "Please enter a valid 6-digit pincode.";
    }

    return "";
  };

  /*
   * PLACE ORDER
   */
  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    /*
     * Prevent double-clicking.
     */
    if (placingOrder) {
      return;
    }

    setError("");

    /*
     * Check cart.
     */
    if (!cart || cart.length === 0) {
      setError(
        "Your cart is empty."
      );

      return;
    }

    /*
     * Validate customer details.
     */
    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    /*
     * Only COD is currently connected.
     */
    if (paymentMethod !== "cod") {
      setError(
        "Online payment is not connected yet. Please select Cash on Delivery for testing."
      );

      return;
    }

    setPlacingOrder(true);

    try {
      /*
       * Prepare clean cart items.
       *
       * These are sent to OrderContext,
       * which inserts the order into Supabase.
       */
      const orderItems = cart.map(
        (item) => ({
          id: item.id,

          productId:
            item.productId ||
            item.product_id ||
            item.id ||
            null,

          name:
            item.name ||
            item.product_name ||
            "Jewellery",

          image:
            item.image ||
            item.image_url ||
            "",

          quantity:
            Number(
              item.quantity || 1
            ),

          price:
            Number(
              item.price || 0
            ),
        })
      );

      /*
       * Calculate subtotal safely.
       */
      const subtotal =
        orderItems.reduce(
          (sum, item) =>
            sum +
            Number(item.price || 0) *
              Number(item.quantity || 1),
          0
        );

      /*
       * Create order in Supabase.
       */
      const order =
        await createOrder({
          /*
           * Customer
           */
          name:
            form.name.trim(),

          mobile:
            form.mobile.trim(),

          email:
            form.email.trim(),

          /*
           * Address
           */
          house:
            form.house.trim(),

          street:
            form.street.trim(),

          city:
            form.city.trim(),

          state:
            form.state.trim(),

          pincode:
            form.pincode.trim(),

          /*
           * Payment
           */
          paymentMethod:
            "cod",

          /*
           * Products
           */
          items:
            orderItems,

          /*
           * Amounts
           */
          subtotal:
            subtotal,

          shipping:
            0,

          discount:
            0,

          tax:
            0,

          total:
            subtotal,

          /*
           * Razorpay fields.
           * These remain empty for COD.
           */
          paymentId:
            null,

          razorpayOrderId:
            null,

          razorpaySignature:
            null,
        });

      /*
       * Make sure Supabase returned an order.
       */
      if (!order || !order.id) {
        throw new Error(
          "Order was not created. Please try again."
        );
      }

      /*
       * Clear shopping cart
       * only AFTER successful order creation.
       */
      clearCart();

      /*
       * Go to order success page.
       */
      navigate(
        `/order-success/${order.id}`
      );
    } catch (orderError) {
      console.error(
        "ORDER ERROR:",
        orderError
      );

      /*
       * Display the actual Supabase error
       * when available.
       */
      const message =
        orderError?.message ||
        orderError?.error_description ||
        "Something went wrong while placing your order. Please try again.";

      setError(message);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  /*
   * EMPTY CART
   */
  if (!cart || cart.length === 0) {
    return (
      <main className="checkout-page">

        <section className="checkout-empty">

          <p className="checkout-eyebrow">
            VIRAJ JEWELLERY
          </p>

          <h1>
            Your Cart Is Empty
          </h1>

          <p>
            Please add jewellery to your
            shopping bag before proceeding
            to checkout.
          </p>

          <Link
            to="/category"
            className="checkout-continue-button"
          >
            Continue Shopping
          </Link>

        </section>

      </main>
    );
  }

  return (
    <main className="checkout-page">

      {/* =====================================
          HEADER
      ====================================== */}

      <section className="checkout-header">

        <p>
          VIRAJ JEWELLERY
        </p>

        <h1>
          Secure Checkout
        </h1>

        <span>
          Complete your details to place
          your order.
        </span>

      </section>


      {/* =====================================
          CHECKOUT FORM
      ====================================== */}

      <form
        className="checkout-layout"
        onSubmit={handlePlaceOrder}
      >

        {/* ===================================
            DELIVERY DETAILS
        ==================================== */}

        <section className="checkout-form-card">

          <div className="checkout-section-heading">

            <span>
              01
            </span>

            <div>

              <p>
                DELIVERY DETAILS
              </p>

              <h2>
                Where should we deliver?
              </h2>

            </div>

          </div>


          <div className="checkout-fields">

            {/* NAME */}

            <div className="checkout-field full">

              <label htmlFor="name">
                Full Name *
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
              />

            </div>


            {/* MOBILE */}

            <div className="checkout-field">

              <label htmlFor="mobile">
                Mobile Number *
              </label>

              <input
                id="mobile"
                name="mobile"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={form.mobile}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                autoComplete="tel"
              />

            </div>


            {/* EMAIL */}

            <div className="checkout-field">

              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                autoComplete="email"
              />

            </div>


            {/* HOUSE */}

            <div className="checkout-field full">

              <label htmlFor="house">
                House / Flat / Building *
              </label>

              <input
                id="house"
                name="house"
                type="text"
                value={form.house}
                onChange={handleChange}
                placeholder="House / Flat / Building"
                autoComplete="street-address"
              />

            </div>


            {/* STREET */}

            <div className="checkout-field full">

              <label htmlFor="street">
                Street / Area *
              </label>

              <input
                id="street"
                name="street"
                type="text"
                value={form.street}
                onChange={handleChange}
                placeholder="Street / Area / Landmark"
              />

            </div>


            {/* CITY */}

            <div className="checkout-field">

              <label htmlFor="city">
                City *
              </label>

              <input
                id="city"
                name="city"
                type="text"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
                autoComplete="address-level2"
              />

            </div>


            {/* STATE */}

            <div className="checkout-field">

              <label htmlFor="state">
                State *
              </label>

              <input
                id="state"
                name="state"
                type="text"
                value={form.state}
                onChange={handleChange}
                placeholder="State"
                autoComplete="address-level1"
              />

            </div>


            {/* PINCODE */}

            <div className="checkout-field">

              <label htmlFor="pincode">
                Pincode *
              </label>

              <input
                id="pincode"
                name="pincode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={form.pincode}
                onChange={handleChange}
                placeholder="6-digit pincode"
                autoComplete="postal-code"
              />

            </div>

          </div>

        </section>


        {/* =====================================
            PAYMENT
        ====================================== */}

        <section className="checkout-form-card">

          <div className="checkout-section-heading">

            <span>
              02
            </span>

            <div>

              <p>
                PAYMENT METHOD
              </p>

              <h2>
                Choose how to pay
              </h2>

            </div>

          </div>


          <div className="payment-options">

            {/* COD */}

            <label
              className={`payment-option ${
                paymentMethod === "cod"
                  ? "selected"
                  : ""
              }`}
            >

              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={
                  paymentMethod === "cod"
                }
                onChange={(event) => {
                  setPaymentMethod(
                    event.target.value
                  );

                  setError("");
                }}
              />

              <div>

                <strong>
                  Cash on Delivery
                </strong>

                <small>
                  Pay when your jewellery
                  is delivered.
                </small>

              </div>

            </label>


            {/* ONLINE */}

            <label
              className={`payment-option ${
                paymentMethod === "online"
                  ? "selected"
                  : ""
              }`}
            >

              <input
                type="radio"
                name="paymentMethod"
                value="online"
                checked={
                  paymentMethod === "online"
                }
                onChange={(event) => {
                  setPaymentMethod(
                    event.target.value
                  );

                  setError("");
                }}
              />

              <div>

                <strong>
                  Online Payment
                </strong>

                <small>
                  Secure payment through
                  Razorpay.
                </small>

              </div>

            </label>

          </div>

        </section>


        {/* =====================================
            ERROR
        ====================================== */}

        {error && (
          <div
            className="checkout-error"
            role="alert"
          >
            {error}
          </div>
        )}


        {/* =====================================
            ORDER SUMMARY
        ====================================== */}

        <aside className="checkout-summary">

          <p className="checkout-summary-label">
            YOUR ORDER
          </p>

          <h2>
            Order Summary
          </h2>


          {/* PRODUCTS */}

          <div className="checkout-products">

            {cart.map((item) => {

              const quantity =
                Number(
                  item.quantity || 1
                );

              const price =
                Number(
                  item.price || 0
                );

              const itemTotal =
                price * quantity;

              return (
                <div
                  className="checkout-product"
                  key={
                    item.id ||
                    item.productId
                  }
                >

                  {/* IMAGE */}

                  <div className="checkout-product-image">

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


                  {/* PRODUCT INFO */}

                  <div className="checkout-product-info">

                    <strong>
                      {item.name ||
                        "Jewellery"}
                    </strong>

                    <small>
                      Qty: {quantity}
                    </small>

                  </div>


                  {/* ITEM PRICE */}

                  <strong>
                    ₹
                    {formatPrice(
                      itemTotal
                    )}
                  </strong>

                </div>
              );
            })}

          </div>


          {/* SUBTOTAL */}

          <div className="checkout-summary-row">

            <span>
              Subtotal
            </span>

            <strong>
              ₹
              {formatPrice(
                cartSubtotal
              )}
            </strong>

          </div>


          {/* SHIPPING */}

          <div className="checkout-summary-row">

            <span>
              Shipping
            </span>

            <strong>
              FREE
            </strong>

          </div>


          {/* DIVIDER */}

          <div className="checkout-summary-divider" />


          {/* TOTAL */}

          <div className="checkout-total">

            <span>
              Total
            </span>

            <strong>
              ₹
              {formatPrice(
                cartSubtotal
              )}
            </strong>

          </div>


          {/* PLACE ORDER */}

          <button
            type="submit"
            className="place-order-button"
            disabled={
              placingOrder
            }
          >

            {placingOrder
              ? "PLACING ORDER..."
              : paymentMethod === "cod"
                ? "PLACE COD ORDER"
                : "CONTINUE TO PAYMENT"}

          </button>


          {/* BACK TO CART */}

          <Link
            to="/cart"
            className="back-to-cart"
          >
            ← Back to Shopping Bag
          </Link>


          {/* TRUST */}

          <div className="checkout-trust">

            <div>

              <span>
                ✓
              </span>

              <p>
                BIS Hallmarked

                <small>
                  Certified jewellery
                </small>
              </p>

            </div>


            <div>

              <span>
                ✓
              </span>

              <p>
                Secure Checkout

                <small>
                  Safe & trusted purchase
                </small>
              </p>

            </div>


            <div>

              <span>
                ✓
              </span>

              <p>
                Viraj Quality

                <small>
                  Authentic jewellery
                </small>
              </p>

            </div>

          </div>

        </aside>

      </form>

    </main>
  );
}