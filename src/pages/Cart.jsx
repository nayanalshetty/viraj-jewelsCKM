import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import "./Cart.css";

function Cart() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartSubtotal,
  } = useCart();

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-IN");

  if (cart.length === 0) {
    return (
      <main className="cart-page">
        <section className="cart-empty">
          <div className="cart-empty-icon">♡</div>

          <p className="cart-eyebrow">
            YOUR SHOPPING BAG
          </p>

          <h1>Your Cart Is Empty</h1>

          <p>
            Discover beautiful jewellery from Viraj Jewellery
            and add your favourites to your shopping bag.
          </p>

          <Link
            to="/category"
            className="cart-continue-button"
          >
            Continue Shopping
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="cart-page">

      {/* HEADER */}

      <section className="cart-heading">
        <p>VIRAJ JEWELLERY</p>
        <h1>Your Shopping Bag</h1>
        <span>
          {cart.length} {cart.length === 1 ? "item" : "items"}
        </span>
      </section>


      {/* CART */}

      <section className="cart-layout">

        {/* ITEMS */}

        <div className="cart-items">

          {cart.map((item) => (

            <article
              className="cart-item"
              key={item.id}
            >

              {/* IMAGE */}

              <Link
                to={`/product/${item.id}`}
                className="cart-item-image"
              >

                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : null}

                <div className="cart-image-placeholder">
                  <span>VIRAJ</span>
                  <small>Jewellery</small>
                </div>

              </Link>


              {/* DETAILS */}

              <div className="cart-item-details">

                <p className="cart-item-category">
                  {item.category || "Jewellery"}
                </p>

                <Link
                  to={`/product/${item.id}`}
                  className="cart-item-name"
                >
                  {item.name}
                </Link>

                <div className="cart-item-meta">
                  {item.weight && (
                    <span>
                      Weight: {item.weight}
                    </span>
                  )}

                  {item.purity && (
                    <span>
                      Purity: {item.purity}
                    </span>
                  )}
                </div>

                <strong className="cart-item-price">
                  ₹{formatPrice(item.price)}
                </strong>


                {/* QUANTITY */}

                <div className="cart-item-controls">

                  <div className="cart-quantity">

                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.quantity - 1
                        )
                      }
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>

                    <span>
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.quantity + 1
                        )
                      }
                    >
                      +
                    </button>

                  </div>

                  <button
                    type="button"
                    className="cart-remove"
                    onClick={() =>
                      removeFromCart(item.id)
                    }
                  >
                    Remove
                  </button>

                </div>

              </div>


              {/* TOTAL */}

              <div className="cart-item-total">

                <span>
                  Item Total
                </span>

                <strong>
                  ₹
                  {formatPrice(
                    Number(item.price || 0) *
                    Number(item.quantity || 1)
                  )}
                </strong>

              </div>

            </article>

          ))}


          {/* CLEAR CART */}

          <button
            type="button"
            className="cart-clear-button"
            onClick={clearCart}
          >
            Clear Shopping Bag
          </button>

        </div>


        {/* SUMMARY */}

        <aside className="cart-summary">

          <p className="cart-summary-label">
            ORDER SUMMARY
          </p>

          <h2>
            Your Order
          </h2>

          <div className="cart-summary-row">
            <span>
              Subtotal
            </span>

            <strong>
              ₹{formatPrice(cartSubtotal)}
            </strong>
          </div>

          <div className="cart-summary-row">
            <span>
              Shipping
            </span>

            <strong>
              FREE
            </strong>
          </div>

          <div className="cart-summary-divider" />

          <div className="cart-summary-total">
            <span>
              Total
            </span>

            <strong>
              ₹{formatPrice(cartSubtotal)}
            </strong>
          </div>


          {/* CHECKOUT */}

          <Link
            to="/checkout"
            className="cart-checkout-button"
          >
          Proceed to Checkout
          </Link>

          {/* WHATSAPP */}

          <button
            type="button"
            className="cart-whatsapp-button"
            onClick={() => {
              const productNames = cart
                .map(
                  (item) =>
                    `${item.name} × ${item.quantity}`
                )
                .join("\n");

              const message =
                `Hello Viraj Jewellery,\n\n` +
                `I would like to enquire about these products:\n\n` +
                `${productNames}\n\n` +
                `Total: ₹${formatPrice(cartSubtotal)}`;

              const whatsappUrl =
                `https://wa.me/?text=${encodeURIComponent(
                  message
                )}`;

              window.open(
                whatsappUrl,
                "_blank"
              );
            }}
          >
            Enquire on WhatsApp
          </button>


          {/* TRUST */}

          <div className="cart-trust">

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
                Secure Shopping
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

        </aside>

      </section>

    </main>
  );
}

export default Cart;