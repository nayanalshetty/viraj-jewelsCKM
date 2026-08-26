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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================================
     UUID CHECK
     ========================================================= */

  const isValidUUID = (value) => {
    if (!value) return false;

    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    );
  };

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
           FIRST TRY: PRODUCT UUID
           ===================================================== */

        if (uuid) {
          const result = await supabase
            .from("products")
            .select("*")
            .eq("id", id)
            .limit(1);

          productData = result.data?.[0] || null;
          productError = result.error;
        }

        /* =====================================================
           SECOND TRY: PRODUCT SKU
           Example:
           /product/ring-001
           ===================================================== */

        if (!productData && !productError) {
          const result = await supabase
            .from("products")
            .select("*")
            .eq("sku", id)
            .limit(1);

          productData = result.data?.[0] || null;
          productError = result.error;
        }

        /* =====================================================
           THIRD TRY: PRODUCT CODE
           Useful if your database uses product_code
           ===================================================== */

        if (
          !productData &&
          !productError &&
          !uuid
        ) {
          const result = await supabase
            .from("products")
            .select("*")
            .eq("product_code", id)
            .limit(1);

          productData = result.data?.[0] || null;
          productError = result.error;
        }

        /* =====================================================
           DATABASE ERROR
           ===================================================== */

        if (productError) {
          console.error(
            "PRODUCT DATABASE ERROR:",
            productError
          );

          if (!cancelled) {
            setError(productError.message);
            setProduct(null);
          }

          setLoading(false);
          return;
        }

        /* =====================================================
           PRODUCT NOT FOUND
           ===================================================== */

        if (!productData) {
          console.error(
            "PRODUCT NOT FOUND FOR URL:",
            id
          );

          if (!cancelled) {
            setError(
              `No product found for "${id}".`
            );
            setProduct(null);
          }

          setLoading(false);
          return;
        }

        console.log(
          "VIRAJ PRODUCT FOUND:",
          productData
        );

        /* =====================================================
           LOAD PRODUCT IMAGES SEPARATELY
           This avoids Supabase relationship errors.
           ===================================================== */

        let productImages = [];

        const imageResult = await supabase
          .from("product_images")
          .select("*")
          .eq("product_id", productData.id);

        if (imageResult.error) {
          console.warn(
            "PRODUCT IMAGES ERROR:",
            imageResult.error
          );
        } else {
          productImages =
            imageResult.data || [];
        }

        /* =====================================================
           SORT IMAGES
           ===================================================== */

        productImages = productImages
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
           FALLBACK 1:
           products.image
           ===================================================== */

        if (
          productImages.length === 0 &&
          productData.image
        ) {
          productImages.push({
            id: "main-product-image",
            image_url:
              String(
                productData.image
              ).trim(),
            order: 0,
          });
        }

        /* =====================================================
           FALLBACK 2:
           products.images
           ===================================================== */

        if (
          productImages.length === 0 &&
          Array.isArray(productData.images)
        ) {
          productData.images
            .filter(Boolean)
            .forEach(
              (image, index) => {
                const imageUrl =
                  typeof image === "string"
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

        console.log(
          "VIRAJ PRODUCT IMAGES:",
          productImages
        );

        /* =====================================================
           SET DATA
           ===================================================== */

        if (!cancelled) {
          setProduct(productData);
          setImages(productImages);
          setActiveIndex(0);
        }
      } catch (err) {
        console.error(
          "UNEXPECTED PRODUCT ERROR:",
          err
        );

        if (!cancelled) {
          setError(
            err?.message ||
              "Unable to load product."
          );

          setProduct(null);
        }
      }

      if (!cancelled) {
        setLoading(false);
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  /* =========================================================
     IMAGE SWAP
     ========================================================= */

  function previousImage() {
    if (images.length <= 1) return;

    setActiveIndex((current) => {
      if (current === 0) {
        return images.length - 1;
      }

      return current - 1;
    });
  }

  function nextImage() {
    if (images.length <= 1) return;

    setActiveIndex((current) => {
      if (current === images.length - 1) {
        return 0;
      }

      return current + 1;
    });
  }

  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <main className="product-page">
        <div className="product-loading">
          Loading product...
        </div>
      </main>
    );
  }

  /* =========================================================
     NOT FOUND
     ========================================================= */

  if (!product) {
    return (
      <main className="product-page">
        <div className="product-not-found">

          <h1>
            Product Not Found
          </h1>

          <p>
            {error ||
              "Product not found."}
          </p>

          <Link to="/">
            ← Back to Website
          </Link>

        </div>
      </main>
    );
  }

  /* =========================================================
     PRODUCT DATA
     ========================================================= */

  const categoryName =
    product.category ||
    product.categories?.name ||
    "Jewellery";

  const activeImage =
    images[activeIndex]?.image_url ||
    "";

  const weight =
    product.weight !== null &&
    product.weight !== undefined &&
    product.weight !== ""
      ? `${product.weight} g`
      : "";

  const purity =
    product.purity ||
    product.gold_purity ||
    "";

  const metal =
    product.metal_type ||
    product.metal ||
    product.material ||
    "";

  const wishlisted =
    isInWishlist(product.id);

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
          MAIN PRODUCT
          ===================================================== */}

      <div className="product-detail">

        {/* ===================================================
            LEFT — GALLERY
            =================================================== */}

        <section className="product-gallery">

          <div className="product-gallery-layout">

            {/* ===============================================
                DESKTOP THUMBNAILS
                =============================================== */}

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
                        activeIndex === index
                          ? "product-thumbnail active"
                          : "product-thumbnail"
                      }
                      onClick={() =>
                        setActiveIndex(index)
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


            {/* ===============================================
                MAIN PRODUCT IMAGE
                =============================================== */}

            <div className="product-main-image">

              {activeImage ? (

                <img
                  src={activeImage}
                  alt={
                    product.name ||
                    "Viraj Jewellery"
                  }
                  onError={(event) => {
                    console.error(
                      "IMAGE FAILED:",
                      activeImage
                    );

                    event.currentTarget.style.display =
                      "none";
                  }}
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


              {/* ===========================================
                  PREVIOUS
                  =========================================== */}

              {images.length > 1 && (
                <button
                  type="button"
                  className="gallery-arrow gallery-arrow-left"
                  onClick={
                    previousImage
                  }
                  aria-label="Previous product image"
                >
                  ←
                </button>
              )}


              {/* ===========================================
                  NEXT
                  =========================================== */}

              {images.length > 1 && (
                <button
                  type="button"
                  className="gallery-arrow gallery-arrow-right"
                  onClick={
                    nextImage
                  }
                  aria-label="Next product image"
                >
                  →
                </button>
              )}


              {/* ===========================================
                  IMAGE COUNTER
                  =========================================== */}

              {images.length > 1 && (
                <span className="gallery-count">
                  {activeIndex + 1} /{" "}
                  {images.length}
                </span>
              )}

            </div>

          </div>


          {/* =================================================
              MOBILE THUMBNAILS
              ================================================= */}

          {images.length > 1 && (
            <div className="mobile-product-thumbnails">

              {images.map(
                (image, index) => (
                  <button
                    key={
                      image.id ||
                      `mobile-${image.image_url}-${index}`
                    }
                    type="button"
                    className={
                      activeIndex === index
                        ? "product-thumbnail active"
                        : "product-thumbnail"
                    }
                    onClick={() =>
                      setActiveIndex(index)
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
            RIGHT — PRODUCT INFORMATION
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


          {/* ===============================================
              PRODUCT CODE
              =============================================== */}

          {(product.sku ||
            product.product_code) && (
            <p className="product-code">

              Product Code:{" "}

              <strong>
                {product.sku ||
                  product.product_code}
              </strong>

            </p>
          )}


          {/* ===============================================
              SPECIFICATIONS
              =============================================== */}

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


          {/* ===============================================
              PRICE
              =============================================== */}

          <div className="product-price-box">

            <span>
              Price
            </span>

            <strong>
              ₹
              {Number(
                product.price || 0
              ).toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>


          {/* ===============================================
              SHORT DESCRIPTION
              =============================================== */}

          {product.short_description && (
            <div className="product-short-description">

              <h3>
                About this jewellery
              </h3>

              <p>
                {product.short_description}
              </p>

            </div>
          )}


          {/* ===============================================
              DESCRIPTION
              =============================================== */}

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


          {/* ===============================================
              ACTIONS
              =============================================== */}

          <div className="product-actions">

            <button
              type="button"
              className={
                wishlisted
                  ? "product-wishlist-button active"
                  : "product-wishlist-button"
              }
              onClick={() =>
                toggleWishlist(
                  product
                )
              }
            >

              {wishlisted
                ? "♥"
                : "♡"}

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