import { Link } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext.jsx";
import "./ProductCard.css";

function ProductCard({ product }) {
  const {
    toggleWishlist,
    isInWishlist,
  } = useWishlist();

  const wishlisted = isInWishlist(product.id);

  // Get image from Supabase product_images
  const imageUrl =
    product.image ||
    product.images?.[0] ||
    product.product_images?.[0]?.image_url ||
    "";

  return (
    <article className="product-card">

      {/* PRODUCT IMAGE */}

      <div className="product-card-image">

        <Link to={`/product/${product.id}`}>

          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name || "Viraj Jewellery"}
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
              onError={(event) => {
                console.error(
                  "Viraj image failed:",
                  imageUrl
                );

                event.currentTarget.style.display = "none";

                const fallback =
                  event.currentTarget.parentElement.querySelector(
                    ".product-card-placeholder"
                  );

                if (fallback) {
                  fallback.style.display = "flex";
                }
              }}
            />
          ) : null}

          {/* FALLBACK ONLY WHEN NO IMAGE EXISTS */}

          <div
            className="product-card-placeholder"
            style={{
              display: imageUrl ? "none" : "flex",
            }}
          >
            <span>VIRAJ</span>
            <small>Jewellery</small>
          </div>

        </Link>

        {/* BADGE */}

        {product.badge && (
          <span className="product-card-badge">
            {product.badge}
          </span>
        )}

        {/* WISHLIST */}

        <button
          type="button"
          className={`product-card-wishlist ${
            wishlisted ? "active" : ""
          }`}
          onClick={() => toggleWishlist(product)}
          aria-label={
            wishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
        >
          {wishlisted ? "♥" : "♡"}
        </button>

      </div>

      {/* PRODUCT INFORMATION */}

      <div className="product-card-content">

        <p className="product-card-category">
          {product.category || "JEWELLERY"}
        </p>

        <Link
          to={`/product/${product.id}`}
          className="product-card-name"
        >
          {product.name}
        </Link>

        <div className="product-card-meta">

          {product.weight && (
            <span>{product.weight}</span>
          )}

          {product.purity && (
            <span>{product.purity}</span>
          )}

        </div>

        <div className="product-card-bottom">

          <strong>
            ₹{Number(product.price || 0).toLocaleString("en-IN")}
          </strong>

          <Link
            to={`/product/${product.id}`}
            className="product-card-view"
          >
            View Product
          </Link>

        </div>

      </div>

    </article>
  );
}

export default ProductCard;