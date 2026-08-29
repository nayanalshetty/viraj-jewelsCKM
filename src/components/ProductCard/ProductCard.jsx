import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { supabase } from "../../lib/supabase.js";
import { useWishlist } from "../../context/WishlistContext.jsx";

import "./ProductCard.css";

function ProductCard({ product }) {
  const {
    toggleWishlist,
    isInWishlist,
  } = useWishlist();

  const [rates, setRates] = useState(null);
  const [ratesLoading, setRatesLoading] = useState(true);

  const wishlisted = isInWishlist(product.id);

  /* =========================================================
     NUMBER HELPER
     ========================================================= */

  function toNumber(value) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return 0;
    }

    const cleaned = String(value)
      .replace(/,/g, "")
      .replace(/[₹$]/g, "")
      .trim();

    const number = Number(cleaned);

    return Number.isFinite(number) ? number : 0;
  }

  /* =========================================================
     LOAD LATEST GOLD / SILVER RATES
     ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadRates() {
      setRatesLoading(true);

      try {
        const today = new Date()
          .toISOString()
          .slice(0, 10);

        const { data, error } = await supabase
          .from("gold_rates")
          .select(
            "rate_24k, rate_22k, rate_18k, silver_rate, effective_date, created_at"
          )
          .lte("effective_date", today)
          .order("effective_date", {
            ascending: false,
          })
          .order("created_at", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

        if (error) {
          throw error;
        }

        console.log(
          "VIRAJ PRODUCT CARD CURRENT RATE:",
          data
        );

        if (!cancelled) {
          setRates(data || null);
        }
      } catch (error) {
        console.error(
          "VIRAJ PRODUCT CARD RATE ERROR:",
          error
        );

        if (!cancelled) {
          setRates(null);
        }
      } finally {
        if (!cancelled) {
          setRatesLoading(false);
        }
      }
    }

    loadRates();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     PRODUCT IMAGE
     ========================================================= */

  const imageUrl =
    product.image ||
    (
      Array.isArray(product.images)
        ? (
            typeof product.images[0] === "string"
              ? product.images[0]
              : product.images[0]?.image_url ||
                product.images[0]?.url ||
                ""
          )
        : ""
    ) ||
    product.product_images?.[0]?.image_url ||
    "";

  /* =========================================================
     PRODUCT DATA
     ========================================================= */

  const weight = toNumber(product.weight);

  const purity =
    product.purity ||
    product.gold_purity ||
    "";

  const metal =
    product.metal_type ||
    product.metal ||
    product.material ||
    "";

  const metalText = String(metal)
    .toLowerCase()
    .trim();

  const purityText = String(purity)
    .toLowerCase()
    .replace(/\s+/g, "");

  const isSilver =
    metalText.includes("silver");

  const isGold =
    !isSilver &&
    (
      metalText.includes("gold") ||
      metalText === ""
    );

  /* =========================================================
     GET METAL RATE
     ========================================================= */

  let metalRate = 0;

  if (rates) {
    /* -------------------------------------------------------
       SILVER
       ------------------------------------------------------- */

    if (isSilver) {
      metalRate = toNumber(
        rates.silver_rate
      );
    }

    /* -------------------------------------------------------
       GOLD
       ------------------------------------------------------- */

    if (isGold) {
      if (purityText.includes("24")) {
        metalRate = toNumber(
          rates.rate_24k
        );
      } else if (
        purityText.includes("18")
      ) {
        metalRate = toNumber(
          rates.rate_18k
        );
      } else {
        // Default gold = 22K

        metalRate = toNumber(
          rates.rate_22k
        );
      }
    }
  }

  /* =========================================================
     METAL PRICE
     ========================================================= */

  const metalAmount =
    weight * metalRate;

  /* =========================================================
     MAKING CHARGE
     ========================================================= */

  const makingCharge = toNumber(
    product.making_charge
  );

  const makingAmount =
    weight * makingCharge;

  /* =========================================================
     SUBTOTAL
     ========================================================= */

  const subtotal =
    metalAmount + makingAmount;

  /* =========================================================
     GST
     ========================================================= */

  const gstPercentage =
    toNumber(product.gst);

  const gstAmount =
    subtotal *
    (gstPercentage / 100);

  /* =========================================================
     FINAL PRICE
     ========================================================= */

  const calculatedPrice =
    Math.round(
      subtotal + gstAmount
    );

  const hasPrice =
    !ratesLoading &&
    weight > 0 &&
    metalRate > 0 &&
    calculatedPrice > 0;

  /* =========================================================
     DEBUG
     ========================================================= */

  console.log(
    "VIRAJ PRODUCT CARD PRICE:",
    {
      product: product.name,
      metal,
      purity,
      weight,
      metalRate,
      makingCharge,
      gstPercentage,
      metalAmount,
      makingAmount,
      gstAmount,
      calculatedPrice,
      rates,
    }
  );

  /* =========================================================
     FORMAT PRICE
     ========================================================= */

  function formatPrice(value) {
    return `₹${Number(value).toLocaleString(
      "en-IN"
    )}`;
  }

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <article className="product-card">

      {/* =====================================================
          PRODUCT IMAGE
          ===================================================== */}

      <div className="product-card-image">

        <Link
          to={`/product/${product.id}`}
        >

          {imageUrl ? (
            <img
              src={imageUrl}
              alt={
                product.name ||
                "Viraj Jewellery"
              }
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
              onError={(event) => {
                console.error(
                  "VIRAJ IMAGE FAILED:",
                  imageUrl
                );

                event.currentTarget.style.display =
                  "none";

                const fallback =
                  event.currentTarget.parentElement.querySelector(
                    ".product-card-placeholder"
                  );

                if (fallback) {
                  fallback.style.display =
                    "flex";
                }
              }}
            />
          ) : null}

          <div
            className="product-card-placeholder"
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
          onClick={() =>
            toggleWishlist(product)
          }
          aria-label={
            wishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
        >
          {wishlisted ? "♥" : "♡"}
        </button>

      </div>

      {/* =====================================================
          PRODUCT INFORMATION
          ===================================================== */}

      <div className="product-card-content">

        {/* CATEGORY */}

        <p className="product-card-category">
          {product.category ||
            product.categories?.name ||
            "JEWELLERY"}
        </p>

        {/* NAME */}

        <Link
          to={`/product/${product.id}`}
          className="product-card-name"
        >
          {product.name}
        </Link>

        {/* META */}

        <div className="product-card-meta">

          {weight > 0 && (
            <span>
              {weight} g
            </span>
          )}

          {purity && (
            <span>
              {purity}
            </span>
          )}

          {metal && (
            <span>
              {metal}
            </span>
          )}

        </div>

        {/* ===================================================
            PRICE
            =================================================== */}

        <div className="product-card-bottom">

          <strong>

            {ratesLoading ? (
              "Calculating..."
            ) : hasPrice ? (
              formatPrice(
                calculatedPrice
              )
            ) : (
              "Price unavailable"
            )}

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