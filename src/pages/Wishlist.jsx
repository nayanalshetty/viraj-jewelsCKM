import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext.jsx";

import "./Wishlist.css";

function Wishlist() {
  const {
    wishlist,
    removeFromWishlist,
    clearWishlist,
  } = useWishlist();

  const formatPrice = (price) => {
    return `₹${Number(price || 0).toLocaleString("en-IN")}`;
  };

  if (wishlist.length === 0) {
    return (
      <main className="wishlist-page">

        <section className="wishlist-empty">

          <div className="wishlist-empty-icon">
            ♡
          </div>

          <p className="wishlist-eyebrow">
            VIRAJ JEWELLERY
          </p>

          <h1>
            Your Wishlist is Empty
          </h1>

          <p>
            Save the jewellery you love and
            come back to it anytime.
          </p>

          <Link
            to="/"
            className="wishlist-shop-button"
          >
            Discover Jewellery
          </Link>

        </section>

      </main>
    );
  }

  return (
    <main className="wishlist-page">

      {/* HEADER */}

      <section className="wishlist-header">

        <p className="wishlist-eyebrow">
          VIRAJ JEWELLERY
        </p>

        <h1>
          My Wishlist
        </h1>

        <p>
          {wishlist.length}{" "}
          {wishlist.length === 1
            ? "item"
            : "items"}{" "}
          saved
        </p>

      </section>

      {/* PRODUCTS */}

      <section className="wishlist-grid">

        {wishlist.map((product) => {

          const imageUrl =
            product.image ||
            product.mainImage ||
            product.images?.[0] ||
            product.product_images?.[0]?.image_url ||
            "";

          return (
            <article
              className="wishlist-card"
              key={product.id}
            >

              {/* IMAGE */}

              <Link
                to={`/product/${product.id}`}
                className="wishlist-image"
              >

                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={
                      product.name ||
                      "Viraj Jewellery"
                    }
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.style.display =
                        "none";
                    }}
                  />
                ) : null}

                <div
                  className="wishlist-placeholder"
                  style={{
                    display: imageUrl
                      ? "none"
                      : "flex",
                  }}
                >
                  <span>VIRAJ</span>
                  <small>Jewellery</small>
                </div>

              </Link>

              {/* CONTENT */}

              <div className="wishlist-card-content">

                <p>
                  {product.category ||
                    product.categories?.name ||
                    "JEWELLERY"}
                </p>

                <Link
                  to={`/product/${product.id}`}
                  className="wishlist-product-name"
                >
                  {product.name}
                </Link>

                <strong>
                  {formatPrice(product.price)}
                </strong>

                {/* ACTIONS */}

                <div className="wishlist-card-actions">

                  <Link
                    to={`/product/${product.id}`}
                    className="wishlist-view"
                  >
                    View Product
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      removeFromWishlist(
                        product.id
                      )
                    }
                  >
                    Remove
                  </button>

                </div>

              </div>

            </article>
          );
        })}

      </section>

      {/* CLEAR */}

      <div className="wishlist-clear-wrapper">

        <button
          type="button"
          className="wishlist-clear"
          onClick={clearWishlist}
        >
          Clear Wishlist
        </button>

      </div>

    </main>
  );
}

export default Wishlist;