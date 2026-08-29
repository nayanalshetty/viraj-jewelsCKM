import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { supabase } from "../lib/supabase.js";
import { useWishlist } from "../context/WishlistContext.jsx";

import "./Product.css";

export default function Product() {
  const { id } = useParams();

  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const [rates, setRates] = useState(null);

  const [loading, setLoading] = useState(true);
  const [ratesLoading, setRatesLoading] = useState(true);

  const [error, setError] = useState("");
  const [ratesError, setRatesError] = useState("");

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

    const number = Number(
      String(value)
        .replace(/,/g, "")
        .replace(/[₹$]/g, "")
        .trim()
    );

    return Number.isFinite(number) ? number : 0;
  }

  /* =========================================================
     UUID CHECK
     ========================================================= */

  function isValidUUID(value) {
    if (!value) return false;

    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    );
  }

  /* =========================================================
     LOAD LATEST GOLD & SILVER RATE
     ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadRates() {
      setRatesLoading(true);
      setRatesError("");

      try {
        const { data, error } = await supabase
          .from("gold_rates")
          .select(
            "rate_24k, rate_22k, rate_18k, silver_rate, effective_date, created_at"
          )
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

        if (!data) {
          throw new Error(
            "No Gold & Silver rates found."
          );
        }

        console.log(
          "================================="
        );

        console.log(
          "VIRAJ LATEST RATE:"
        );

        console.log(data);

        console.log(
          "24K:",
          data.rate_24k
        );

        console.log(
          "22K:",
          data.rate_22k
        );

        console.log(
          "18K:",
          data.rate_18k
        );

        console.log(
          "SILVER:",
          data.silver_rate
        );

        console.log(
          "================================="
        );

        if (!cancelled) {
          setRates(data);
        }
      } catch (err) {
        console.error(
          "VIRAJ RATE ERROR:",
          err
        );

        if (!cancelled) {
          setRates(null);

          setRatesError(
            err?.message ||
              "Unable to load Gold & Silver rates."
          );
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
     LOAD PRODUCT
     ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      if (!id) {
        setError("Product ID is missing.");
        setProduct(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setProduct(null);
      setImages([]);
      setActiveIndex(0);

      try {
        let productData = null;
        let productError = null;

        const uuid = isValidUUID(id);

        /* =====================================================
           SEARCH BY UUID
           ===================================================== */

        if (uuid) {
          const result = await supabase
            .from("products")
            .select(`
              *,
              categories (
                id,
                name,
                slug
              )
            `)
            .eq("id", id)
            .limit(1);

          productData =
            result.data?.[0] || null;

          productError =
            result.error;
        }

        /* =====================================================
           SEARCH BY SKU
           ===================================================== */

        if (
          !productData &&
          !productError
        ) {
          const result = await supabase
            .from("products")
            .select(`
              *,
              categories (
                id,
                name,
                slug
              )
            `)
            .eq("sku", id)
            .limit(1);

          productData =
            result.data?.[0] || null;

          productError =
            result.error;
        }

        /* =====================================================
           SEARCH BY PRODUCT CODE
           ===================================================== */

        if (
          !productData &&
          !productError &&
          !uuid
        ) {
          const result = await supabase
            .from("products")
            .select(`
              *,
              categories (
                id,
                name,
                slug
              )
            `)
            .eq("product_code", id)
            .limit(1);

          productData =
            result.data?.[0] || null;

          productError =
            result.error;
        }

        /* =====================================================
           DATABASE ERROR
           ===================================================== */

        if (productError) {
          console.error(
            "VIRAJ PRODUCT ERROR:",
            productError
          );

          if (!cancelled) {
            setError(
              productError.message
            );

            setProduct(null);
            setLoading(false);
          }

          return;
        }

        /* =====================================================
           PRODUCT NOT FOUND
           ===================================================== */

        if (!productData) {
          if (!cancelled) {
            setError(
              `No product found for "${id}".`
            );

            setProduct(null);
            setLoading(false);
          }

          return;
        }

        console.log(
          "VIRAJ PRODUCT:",
          productData
        );

        /* =====================================================
           LOAD IMAGES
           ===================================================== */

        let productImages = [];

        const imageResult =
          await supabase
            .from("product_images")
            .select("*")
            .eq(
              "product_id",
              productData.id
            );

        if (!imageResult.error) {
          productImages =
            imageResult.data || [];
        }

        /* =====================================================
           SORT IMAGES
           ===================================================== */

        productImages =
          productImages
            .filter(
              (image) =>
                image &&
                image.image_url
            )
            .sort((a, b) => {
              const orderA =
                Number(
                  a.order ??
                    a.sort_order ??
                    a.position ??
                    0
                );

              const orderB =
                Number(
                  b.order ??
                    b.sort_order ??
                    b.position ??
                    0
                );

              return orderA - orderB;
            })
            .map((image) => ({
              ...image,
              image_url:
                String(
                  image.image_url
                ).trim(),
            }));

        /* =====================================================
           FALLBACK IMAGE
           ===================================================== */

        if (
          productImages.length === 0 &&
          productData.image
        ) {
          productImages.push({
            id: "main-image",
            image_url:
              String(
                productData.image
              ).trim(),
            order: 0,
          });
        }

        /* =====================================================
           FALLBACK IMAGES ARRAY
           ===================================================== */

        if (
          productImages.length === 0 &&
          Array.isArray(
            productData.images
          )
        ) {
          productData.images
            .filter(Boolean)
            .forEach(
              (image, index) => {
                const imageUrl =
                  typeof image ===
                  "string"
                    ? image
                    : image?.image_url ||
                      image?.url ||
                      "";

                if (imageUrl) {
                  productImages.push({
                    id: `fallback-${index}`,
                    image_url:
                      String(
                        imageUrl
                      ).trim(),
                    order: index,
                  });
                }
              }
            );
        }

        if (!cancelled) {
          setProduct(productData);
          setImages(productImages);
          setActiveIndex(0);
          setLoading(false);
        }
      } catch (err) {
        console.error(
          "VIRAJ PRODUCT LOAD ERROR:",
          err
        );

        if (!cancelled) {
          setError(
            err?.message ||
              "Unable to load product."
          );

          setProduct(null);
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  /* =========================================================
     IMAGE NAVIGATION
     ========================================================= */

  function previousImage() {
    if (images.length <= 1) return;

    setActiveIndex((current) =>
      current === 0
        ? images.length - 1
        : current - 1
    );
  }

  function nextImage() {
    if (images.length <= 1) return;

    setActiveIndex((current) =>
      current === images.length - 1
        ? 0
        : current + 1
    );
  }

  /* =========================================================
     KEYBOARD NAVIGATION
     ========================================================= */

  useEffect(() => {
    function handleKeyDown(event) {
      if (images.length <= 1) return;

      if (event.key === "ArrowLeft") {
        previousImage();
      }

      if (event.key === "ArrowRight") {
        nextImage();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [images.length]);

  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <main className="product-page">
        <div className="product-loading">
          <p>Loading product...</p>
        </div>
      </main>
    );
  }

  /* =========================================================
     PRODUCT NOT FOUND
     ========================================================= */

  if (!product) {
    return (
      <main className="product-page">
        <div className="product-not-found">

          <p className="product-eyebrow">
            VIRAJ JEWELLERY
          </p>

          <h1>
            Product Not Found
          </h1>

          <p>
            {error ||
              "The requested product could not be found."}
          </p>

          <Link to="/">
            ← Back to Website
          </Link>

        </div>
      </main>
    );
  }

  /* =========================================================
     PRODUCT INFORMATION
     ========================================================= */

  const categoryName =
    product.category ||
    product.categories?.name ||
    "Jewellery";

  const activeImage =
    images[activeIndex]
      ?.image_url || "";

  const weightNumber =
    toNumber(product.weight);

  const weight =
    weightNumber > 0
      ? `${weightNumber} g`
      : "";

  const metal =
    product.metal_type ||
    product.metal ||
    product.material ||
    "";

  const sku =
    product.sku ||
    product.product_code ||
    "";

  const wishlisted =
    isInWishlist(product.id);

  /* =========================================================
     NORMALIZE METAL
     ========================================================= */

  const metalText =
    String(metal)
      .toLowerCase()
      .trim();

  const isSilver =
    metalText.includes("silver");

  const isGold =
    !isSilver;

  /* =========================================================
     PURITY
     ========================================================= */

  /*
   * SILVER IS ALWAYS 92.5
   *
   * This intentionally ignores any incorrect
   * purity value stored in the product database.
   */

  const purity =
    isSilver
      ? "925"
      : (
          product.purity ||
          product.gold_purity ||
          ""
        );

  /* =========================================================
     PURITY TEXT
     ========================================================= */

  const purityText =
    String(purity)
      .toLowerCase()
      .replace(/\s+/g, "");

  /* =========================================================
     CURRENT RATE
     ========================================================= */

  let metalRate = 0;

  if (rates) {

    /* =======================================================
       SILVER
       ======================================================= */

    if (isSilver) {

      metalRate =
        toNumber(
          rates.silver_rate
        );

    }

    /* =======================================================
       GOLD
       ======================================================= */

    if (isGold) {

      if (
        purityText.includes("24")
      ) {

        metalRate =
          toNumber(
            rates.rate_24k
          );

      } else if (
        purityText.includes("18")
      ) {

        metalRate =
          toNumber(
            rates.rate_18k
          );

      } else {

        /*
         * 22K is the default.
         */

        metalRate =
          toNumber(
            rates.rate_22k
          );
      }
    }
  }

  /* =========================================================
     PRICE CALCULATION
     ========================================================= */

  const metalValue =
    weightNumber * metalRate;

  const makingCharge =
    toNumber(
      product.making_charge
    );

  const makingTotal =
    weightNumber *
    makingCharge;

  const subtotal =
    metalValue +
    makingTotal;

  const gstPercentage =
    toNumber(product.gst);

  const gstAmount =
    subtotal *
    (gstPercentage / 100);

  const calculatedPrice =
    Math.round(
      subtotal + gstAmount
    );

  /* =========================================================
     VALIDATION
     ========================================================= */

  const hasRate =
    metalRate > 0;

  const hasWeight =
    weightNumber > 0;

  const hasPrice =
    hasRate &&
    hasWeight &&
    calculatedPrice > 0;

  /* =========================================================
     PRICE MESSAGE
     ========================================================= */

  let priceMessage = "";

  if (ratesLoading) {

    priceMessage =
      "Loading current metal rate...";

  } else if (ratesError) {

    priceMessage =
      ratesError;

  } else if (!hasRate) {

    priceMessage =
      isSilver
        ? "Silver rate is not available."
        : `Gold ${
            purity || "22K"
          } rate is not available.`;

  } else if (!hasWeight) {

    priceMessage =
      "Product weight is required for automatic pricing.";

  }

  /* =========================================================
     DEBUG
     ========================================================= */

  console.log(
    "VIRAJ FINAL PRICE:",
    {
      product: product.name,
      metal,
      purity,
      weight: weightNumber,
      rate: metalRate,
      makingCharge,
      gst: gstPercentage,
      metalValue,
      makingTotal,
      gstAmount,
      finalPrice:
        calculatedPrice,
    }
  );

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <main className="product-page">

      {/* =====================================================
          BREADCRUMB
          ===================================================== */}

      <div className="product-breadcrumb">

        <Link to="/">
          Home
        </Link>

        <span>/</span>

        <Link to="/category">
          Jewellery
        </Link>

        <span>/</span>

        <span>
          {product.name}
        </span>

      </div>


      {/* =====================================================
          PRODUCT DETAIL
          ===================================================== */}

      <div className="product-detail">

        {/* ===================================================
            GALLERY
            =================================================== */}

        <section className="product-gallery">

          <div className="product-gallery-layout">

            {images.length > 1 && (
              <div className="product-thumbnails">

                {images.map(
                  (image, index) => (
                    <button
                      key={
                        image.id ||
                        `${image.image_url}-${index}`
                      }
                      type="button"
                      className={
                        activeIndex ===
                        index
                          ? "product-thumbnail active"
                          : "product-thumbnail"
                      }
                      onClick={() =>
                        setActiveIndex(
                          index
                        )
                      }
                    >

                      <img
                        src={
                          image.image_url
                        }
                        alt={`${product.name} ${
                          index + 1
                        }`}
                      />

                    </button>
                  )
                )}

              </div>
            )}

            {/* MAIN IMAGE */}

            <div className="product-main-image">

              {activeImage ? (

                <img
                  src={activeImage}
                  alt={
                    product.name ||
                    "Viraj Jewellery"
                  }
                />

              ) : (

                <div className="product-image-placeholder">

                  <strong>
                    VIRAJ
                  </strong>

                  <span>
                    JEWELLERY
                  </span>

                </div>

              )}

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="gallery-arrow gallery-arrow-left"
                    onClick={
                      previousImage
                    }
                  >
                    ←
                  </button>

                  <button
                    type="button"
                    className="gallery-arrow gallery-arrow-right"
                    onClick={
                      nextImage
                    }
                  >
                    →
                  </button>

                  <span className="gallery-count">
                    {activeIndex + 1} /{" "}
                    {images.length}
                  </span>
                </>
              )}

            </div>

          </div>

          {/* MOBILE THUMBNAILS */}

          {images.length > 1 && (
            <div className="mobile-product-thumbnails">

              {images.map(
                (image, index) => (
                  <button
                    key={
                      image.id ||
                      `mobile-${index}`
                    }
                    type="button"
                    className={
                      activeIndex ===
                      index
                        ? "product-thumbnail active"
                        : "product-thumbnail"
                    }
                    onClick={() =>
                      setActiveIndex(
                        index
                      )
                    }
                  >

                    <img
                      src={
                        image.image_url
                      }
                      alt={`${product.name} ${
                        index + 1
                      }`}
                    />

                  </button>
                )
              )}

            </div>
          )}

        </section>


        {/* ===================================================
            PRODUCT INFORMATION
            =================================================== */}

        <section className="product-information">

          <p className="product-eyebrow">
            VIRAJ JEWELLERY
          </p>

          <p className="product-category">
            {categoryName}
          </p>

          <h1>
            {product.name}
          </h1>

          {sku && (
            <p className="product-code">
              Product Code:{" "}
              <strong>
                {sku}
              </strong>
            </p>
          )}

          {/* SPECIFICATIONS */}

          {(weight ||
            purity ||
            metal) && (

            <div className="product-specifications">

              {weight && (
                <div className="product-spec">

                  <span>
                    Weight
                  </span>

                  <strong>
                    {weight}
                  </strong>

                </div>
              )}

              {purity && (
                <div className="product-spec">

                  <span>
                    Purity
                  </span>

                  <strong>
                    {purity}
                  </strong>

                </div>
              )}

              {metal && (
                <div className="product-spec">

                  <span>
                    Metal
                  </span>

                  <strong>
                    {metal}
                  </strong>

                </div>
              )}

            </div>
          )}


          {/* =================================================
              PRICE
              ================================================= */}

          <div className="product-price-box">

            <span>
              Price
            </span>

            {ratesLoading ? (

              <strong>
                Calculating...
              </strong>

            ) : hasPrice ? (

              <strong>
                ₹
                {calculatedPrice.toLocaleString(
                  "en-IN"
                )}
              </strong>

            ) : (

              <strong>
                Price unavailable
              </strong>

            )}

          </div>


          {/* =================================================
              PRICE DETAILS
              ================================================= */}

          {hasPrice && (
            <div
              className="product-price-note"
              style={{
                marginTop: "8px",
                fontSize: "12px",
                lineHeight: "1.5",
                opacity: 0.7,
              }}
            >

              Current{" "}
              {isSilver
                ? "Silver"
                : `Gold ${
                    purity || "22K"
                  }`}{" "}
              rate: ₹
              {metalRate.toLocaleString(
                "en-IN"
              )}
              /g

              {makingCharge > 0 &&
                ` · Making ₹${makingCharge.toLocaleString(
                  "en-IN"
                )}/g`}

              {gstPercentage > 0 &&
                ` · GST ${gstPercentage}%`}

            </div>
          )}


          {!ratesLoading &&
            !hasPrice &&
            priceMessage && (

              <div
                className="product-price-note"
                style={{
                  marginTop: "8px",
                  fontSize: "12px",
                  lineHeight: "1.5",
                  opacity: 0.75,
                }}
              >
                {priceMessage}
              </div>

            )}


          {/* DESCRIPTION */}

          {product.short_description && (
            <div className="product-short-description">

              <h3>
                About this jewellery
              </h3>

              <p>
                {
                  product.short_description
                }
              </p>

            </div>
          )}

          {product.description && (
            <div className="product-description">

              <h3>
                Product Details
              </h3>

              <p>
                {product.description}
              </p>

            </div>
          )}


          {/* ACTIONS */}

          <div className="product-actions">

            <button
              type="button"
              className={
                wishlisted
                  ? "product-wishlist-button active"
                  : "product-wishlist-button"
              }
              onClick={() =>
                toggleWishlist(product)
              }
            >

              <span className="wishlist-symbol">
                {wishlisted
                  ? "♥"
                  : "♡"}
              </span>

              <span>
                {wishlisted
                  ? "Saved to Wishlist"
                  : "Add to Wishlist"}
              </span>

            </button>

            <Link
              to="/category"
              className="product-continue"
            >
              Continue Shopping
              <span>→</span>
            </Link>

          </div>

        </section>

      </div>

    </main>
  );
}