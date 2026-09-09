import React from "react";
import { Link, useNavigate } from "react-router-dom";

const ProductCard = ({
  product,
  onAddToCart,
  onToggleWishlist,
  quantity,
  onIncreaseQuantity,
  onDecreaseQuantity,
}) => {
  const navigate = useNavigate();
  const productUrl = `/product/${product.id}`;

  const openProduct = () => navigate(productUrl);

  const stopCardNavigation = (event) => {
    event.stopPropagation();
  };

  return (
    <article
      className="product-card"
      onClick={openProduct}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openProduct();
        }
      }}
      role="link"
      tabIndex={0}
      aria-label={`View ${product.name}`}
    >
      <div className="product-image-wrapper">
        <Link
          to={productUrl}
          className="product-card-image-link"
          onClick={stopCardNavigation}
          aria-label={`View ${product.name}`}
        >
          <img
            src={product.mainImage || product.image || ""}
            alt={product.name}
            className="product-image"
            loading="lazy"
          />
        </Link>

        {onToggleWishlist && (
          <button
            type="button"
            className="wishlist-button"
            onClick={(event) => {
              stopCardNavigation(event);
              onToggleWishlist(product);
            }}
            aria-label="Add to wishlist"
          >
            ♡
          </button>
        )}
      </div>

      <div className="product-info">
        <Link
          to={productUrl}
          className="product-name-link"
          onClick={stopCardNavigation}
        >
          <h3 className="product-name">{product.name}</h3>
        </Link>

        <Link
          to={productUrl}
          className="product-price-link"
          onClick={stopCardNavigation}
        >
          <p className="product-price">₹{product.price}</p>
        </Link>

        {product.description && (
          <Link
            to={productUrl}
            className="product-description-link"
            onClick={stopCardNavigation}
          >
            <p className="product-description">{product.description}</p>
          </Link>
        )}

        {(onIncreaseQuantity || onDecreaseQuantity) && (
          <div className="quantity-controls" onClick={stopCardNavigation}>
            <button
              type="button"
              onClick={(event) => {
                stopCardNavigation(event);
                onDecreaseQuantity?.();
              }}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span>{quantity || 1}</span>
            <button
              type="button"
              onClick={(event) => {
                stopCardNavigation(event);
                onIncreaseQuantity?.();
              }}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        )}

        {onAddToCart && (
          <button
            type="button"
            className="add-to-cart-button"
            onClick={(event) => {
              stopCardNavigation(event);
              onAddToCart(product);
            }}
          >
            Add to Cart
          </button>
        )}

        <button
          type="button"
          className="view-product-button"
          onClick={(event) => {
            stopCardNavigation(event);
            openProduct();
          }}
        >
          View Product
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
