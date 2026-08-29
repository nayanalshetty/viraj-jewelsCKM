import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";
import { useWishlist } from "../../context/WishlistContext.jsx";

import "./ProductSection.css";

export default function ProductSection({
  title = "New Arrivals",
  description = "",
  subtitle = "",
  limit = 4,
  type = "new",
}) {
  const [products, setProducts] = useState([]);
  const [rates, setRates] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [ratesLoading, setRatesLoading] = useState(true);

  const {
    toggleWishlist,
    isInWishlist,
  } = useWishlist();

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

    return Number.isFinite(number)
      ? number
      : 0;
  }

  /* =========================================================
     LOAD LATEST GOLD + SILVER RATE
     ========================================================= */

  const loadRates = useCallback(async () => {
    try {
      setRatesLoading(true);

      const today = new Date()
        .toISOString()
        .slice(0, 10);

      const { data, error } = await supabase
        .from("gold_rates")
        .select(`
          rate_24k,
          rate_22k,
          rate_18k,
          silver_rate,
          effective_date,
          created_at
        `)
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
        console.error(
          "VIRAJ HOMEPAGE RATE ERROR:",
          error
        );

        setRates(null);
        return;
      }

      console.log(
        "VIRAJ HOMEPAGE CURRENT RATES:",
        data
      );

      setRates(data || null);
    } catch (error) {
      console.error(
        "VIRAJ RATE LOAD ERROR:",
        error
      );

      setRates(null);
    } finally {
      setRatesLoading(false);
    }
  }, []);

  /* =========================================================
     LOAD PRODUCTS
     ========================================================= */

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .eq("is_active", true)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Homepage products error:",
          error
        );

        setProducts([]);
        return;
      }

      const productIds = (data || []).map(
        (product) => product.id
      );

      let imageData = [];

      if (productIds.length > 0) {
        const {
          data: images,
          error: imageError,
        } = await supabase
          .from("product_images")
          .select(`
            id,
            product_id,
            image_url,
            "order"
          `)
          .in("product_id", productIds)
          .order("order", {
            ascending: true,
          });

        if (imageError) {
          console.error(
            "Homepage product images error:",
            imageError
          );
        } else {
          imageData = images || [];
        }
      }

      /* =====================================================
         IMAGE MAP
         ===================================================== */

      const imageMap = {};

      imageData.forEach((image) => {
        if (
          !image?.product_id ||
          !image?.image_url
        ) {
          return;
        }

        if (!imageMap[image.product_id]) {
          imageMap[image.product_id] =
            image.image_url;
        }
      });

      /* =====================================================
         FORMAT PRODUCTS
         ===================================================== */

      const formattedProducts = (data || [])
        .map((product) => {
          let mainImage =
            imageMap[product.id] || "";

          if (
            !mainImage &&
            product.image
          ) {
            mainImage = product.image;
          }

          return {
            ...product,
            mainImage,

            product_images:
              imageData.filter(
                (image) =>
                  String(image.product_id) ===
                  String(product.id)
              ),
          };
        })
        .filter(Boolean);

      /* =====================================================
         PRODUCT TYPE
         ===================================================== */

      let finalProducts = [
        ...formattedProducts,
      ];

      if (type === "new") {
        finalProducts = finalProducts
          .sort(
            (a, b) =>
              new Date(
                b.created_at || 0
              ).getTime() -
              new Date(
                a.created_at || 0
              ).getTime()
          )
          .slice(0, limit);
      } else if (
        type === "bestseller"
      ) {
        finalProducts = finalProducts
          .sort(
            (a, b) =>
              new Date(
                b.created_at || 0
              ).getTime() -
              new Date(
                a.created_at || 0
              ).getTime()
          )
          .slice(0, limit);
      } else if (
        type === "featured"
      ) {
        finalProducts = finalProducts
          .filter(
            (product) =>
              product.is_featured === true
          )
          .sort(
            (a, b) =>
              new Date(
                b.created_at || 0
              ).getTime() -
              new Date(
                a.created_at || 0
              ).getTime()
          )
          .slice(0, limit);
      } else {
        finalProducts = finalProducts
          .sort(
            (a, b) =>
              new Date(
                b.created_at || 0
              ).getTime() -
              new Date(
                a.created_at || 0
              ).getTime()
          )
          .slice(0, limit);
      }

      setProducts(finalProducts);
    } catch (error) {
      console.error(
        "Unexpected homepage product error:",
        error
      );

      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [limit, type]);

  /* =========================================================
     INITIAL LOAD
     ========================================================= */

  useEffect(() => {
    loadProducts();
    loadRates();
  }, [loadProducts, loadRates]);

  /* =========================================================
     REFRESH WHEN USER RETURNS TO WEBSITE
     ========================================================= */

  useEffect(() => {
    function handleFocus() {
      loadProducts();
      loadRates();
    }

    function handleVisibilityChange() {
      if (
        document.visibilityState ===
        "visible"
      ) {
        loadProducts();
        loadRates();
      }
    }

    window.addEventListener(
      "focus",
      handleFocus
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [loadProducts, loadRates]);

  /* =========================================================
     REALTIME PRODUCT + RATE UPDATE
     ========================================================= */

  useEffect(() => {
    const channel =
      supabase
        .channel(
          `homepage-products-${type}`
        )

        /* PRODUCTS */

        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "products",
          },
          () => {
            loadProducts();
          }
        )

        /* PRODUCT IMAGES */

        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "product_images",
          },
          () => {
            loadProducts();
          }
        )

        /* GOLD + SILVER RATES */

        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "gold_rates",
          },
          () => {
            console.log(
              "VIRAJ RATE UPDATED — REFRESHING PRICES"
            );

            loadRates();
          }
        )

        .subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, [
    loadProducts,
    loadRates,
    type,
  ]);

  /* =========================================================
     CALCULATE PRODUCT PRICE
     ========================================================= */

  function calculatePrice(product) {
    if (!rates) {
      return 0;
    }

    /* -------------------------------------------------------
       WEIGHT
       ------------------------------------------------------- */

    const weight =
      toNumber(product.weight);

    if (weight <= 0) {
      return 0;
    }

    /* -------------------------------------------------------
       METAL
       ------------------------------------------------------- */

    const metal = String(
      product.metal_type ||
      product.metal ||
      product.material ||
      ""
    )
      .toLowerCase()
      .trim();

    /* -------------------------------------------------------
       PURITY
       ------------------------------------------------------- */

    const purity = String(
      product.purity ||
      product.gold_purity ||
      ""
    )
      .toLowerCase()
      .replace(/\s+/g, "");

    /* -------------------------------------------------------
       CURRENT METAL RATE
       ------------------------------------------------------- */

    let metalRate = 0;

    /* =====================================================
       SILVER
       ===================================================== */

    if (
      metal.includes("silver")
    ) {
      metalRate =
        toNumber(
          rates.silver_rate
        );
    }

    /* =====================================================
       GOLD
       ===================================================== */

    else {
      if (
        purity.includes("24")
      ) {
        metalRate =
          toNumber(
            rates.rate_24k
          );
      } else if (
        purity.includes("18")
      ) {
        metalRate =
          toNumber(
            rates.rate_18k
          );
      } else {
        /*
         * Default Gold = 22K
         */

        metalRate =
          toNumber(
            rates.rate_22k
          );
      }
    }

    if (metalRate <= 0) {
      return 0;
    }

    /* =====================================================
       METAL VALUE
       ===================================================== */

    const metalValue =
      weight * metalRate;

    /* =====================================================
       MAKING CHARGE
       ===================================================== */

    const makingCharge =
      toNumber(
        product.making_charge
      );

    const makingTotal =
      weight * makingCharge;

    /* =====================================================
       SUBTOTAL
       ===================================================== */

    const subtotal =
      metalValue +
      makingTotal;

    /* =====================================================
       GST
       ===================================================== */

    const gst =
      toNumber(product.gst);

    const gstAmount =
      subtotal *
      (gst / 100);

    /* =====================================================
       FINAL PRICE
       ===================================================== */

    return Math.round(
      subtotal + gstAmount
    );
  }

  /* =========================================================
     BEST SELLER FILTERS
     ========================================================= */

  const filterOptions = [
    { key: "all", label: "All" },
    { key: "newest", label: "Newest" },
    { key: "popular", label: "Popular" },
    { key: "trendy", label: "Trendy" },
    { key: "best", label: "Best" },
  ];

  function productDate(product) {
    return new Date(
      product?.created_at || 0
    ).getTime();
  }

  function productPopularity(product) {
    const values = [
      product?.sales_count,
      product?.sold_count,
      product?.orders_count,
      product?.views,
      product?.view_count,
      product?.popularity,
      product?.rating,
    ];

    for (const value of values) {
      const number = toNumber(value);
      if (number > 0) return number;
    }

    return 0;
  }

  function hasKeyword(product, words) {
    const text = [
      product?.name,
      product?.badge,
      product?.collection,
      product?.occasion,
      product?.gender,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return words.some((word) =>
      text.includes(word)
    );
  }

  function getFilteredProducts() {
    const list = [...products];

    if (activeFilter === "newest") {
      return list.sort(
        (a, b) =>
          productDate(b) - productDate(a)
      );
    }

    if (activeFilter === "popular") {
      return list.sort((a, b) => {
        const popularityDifference =
          productPopularity(b) -
          productPopularity(a);

        return popularityDifference !== 0
          ? popularityDifference
          : productDate(b) - productDate(a);
      });
    }

    if (activeFilter === "trendy") {
      return list.sort((a, b) => {
        const aTrend =
          (a?.is_featured ? 2 : 0) +
          (hasKeyword(a, ["trendy", "trend", "new"]) ? 1 : 0);
        const bTrend =
          (b?.is_featured ? 2 : 0) +
          (hasKeyword(b, ["trendy", "trend", "new"]) ? 1 : 0);

        return (
          bTrend - aTrend ||
          productDate(b) - productDate(a)
        );
      });
    }

    if (activeFilter === "best") {
      return list.sort((a, b) => {
        const aBest =
          (a?.is_featured ? 2 : 0) +
          (hasKeyword(a, ["bestseller", "best seller", "best"]) ? 2 : 0) +
          (productPopularity(a) > 0 ? 1 : 0);
        const bBest =
          (b?.is_featured ? 2 : 0) +
          (hasKeyword(b, ["bestseller", "best seller", "best"]) ? 2 : 0) +
          (productPopularity(b) > 0 ? 1 : 0);

        return (
          bBest - aBest ||
          productPopularity(b) - productPopularity(a) ||
          productDate(b) - productDate(a)
        );
      });
    }

    return list;
  }

  const visibleProducts = getFilteredProducts();

  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <section className="product-section">

        <div className="product-section-header">

          <div className="product-section-heading">

            <p className="product-section-eyebrow">
              VIRAJ JEWELLERY
            </p>

            <h2>
              {title}
            </h2>

            {(description ||
              subtitle) && (
              <p className="product-section-description">
                {description ||
                  subtitle}
              </p>
            )}

          </div>

        </div>

        <div className="product-section-loading">
          Loading jewellery...
        </div>

      </section>
    );
  }

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <section className="product-section">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="product-section-header">

        <div className="product-section-heading">

          <p className="product-section-eyebrow">
            VIRAJ JEWELLERY
          </p>

          <h2>
            {title}
          </h2>

          {(description ||
            subtitle) && (
            <p className="product-section-description">
              {description ||
                subtitle}
            </p>
          )}

        </div>

        <Link
          to="/category"
          className="product-section-view-all"
        >
          View All
          <span>
            →
          </span>
        </Link>

      </div>

      {type === "bestseller" && (
        <div
          className="product-section-filters"
          aria-label="Best seller filters"
        >
          {filterOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              className={`product-filter-pill ${
                activeFilter === option.key
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveFilter(option.key)
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {/* =====================================================
          PRODUCTS
          ===================================================== */}

      {visibleProducts.length > 0 ? (

        <div className="product-section-grid">

          {visibleProducts.map(
            (product) => {

              const wishlistActive =
                isInWishlist(
                  product.id
                );

              const calculatedPrice =
                calculatePrice(
                  product
                );

              const weight =
                toNumber(
                  product.weight
                );

              const metal =
                String(
                  product.metal_type ||
                  product.metal ||
                  product.material ||
                  ""
                )
                  .toLowerCase()
                  .trim();

              const isSilver =
                metal.includes(
                  "silver"
                );

              return (
                <div
                  key={
                    product.id
                  }
                  className="homepage-product-card"
                >

                  {/* =================================================
                      IMAGE
                      ================================================= */}

                  <div className="homepage-product-image">

                    {product.mainImage ? (

                      <img
                        src={
                          product.mainImage
                        }
                        alt={
                          product.name ||
                          "Viraj Jewellery"
                        }
                        loading="lazy"
                        onError={(
                          event
                        ) => {
                          event.currentTarget.style.display =
                            "none";
                        }}
                      />

                    ) : (

                      <div className="homepage-product-placeholder">

                        <strong>
                          VIRAJ
                        </strong>

                        <span>
                          JEWELLERY
                        </span>

                      </div>

                    )}

                    {/* WISHLIST */}

                    <button
                      type="button"
                      className={`homepage-wishlist ${
                        wishlistActive
                          ? "active"
                          : ""
                      }`}
                      onClick={(
                        event
                      ) => {
                        event.preventDefault();
                        event.stopPropagation();

                        toggleWishlist(
                          product
                        );
                      }}
                      aria-label={
                        wishlistActive
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                      title={
                        wishlistActive
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                    >
                      {wishlistActive
                        ? "♥"
                        : "♡"}
                    </button>

                  </div>

                  {/* =================================================
                      PRODUCT DETAILS
                      ================================================= */}

                  <Link
                    to={`/product/${product.id}`}
                    className="homepage-product-link"
                  >

                    <div className="homepage-product-info">

                      {/* CATEGORY */}

                      <p className="homepage-product-category">
                        {product.categories
                          ?.name ||
                          product.category ||
                          "JEWELLERY"}
                      </p>

                      {/* NAME */}

                      <h3>
                        {product.name}
                      </h3>

                      {/* META */}

                      <div className="homepage-product-meta">

                        {weight > 0 && (
                          <span>
                            {weight} g
                          </span>
                        )}

                        {product.purity && (
                          <>
                            {weight > 0 && (
                              <span className="meta-dot">
                                •
                              </span>
                            )}

                            <span>
                              {
                                product.purity
                              }
                            </span>
                          </>
                        )}

                      </div>

                      {/* =================================================
                          PRICE
                          ================================================= */}

                      <div className="homepage-product-bottom">

                        <strong>

                          {ratesLoading && !product.price ? (
                            "Calculating..."
                          ) : calculatedPrice > 0 ? (
                            `₹${calculatedPrice.toLocaleString(
                              "en-IN"
                            )}`
                          ) : toNumber(product.price) > 0 ? (
                            `₹${toNumber(product.price).toLocaleString(
                              "en-IN"
                            )}`
                          ) : (
                            "₹ —"
                          )}

                        </strong>

                        <span className="homepage-product-button">
                          View Product
                        </span>

                      </div>

                    </div>

                  </Link>

                </div>
              );
            }
          )}

        </div>

      ) : (

        <div className="product-section-empty">

          <p>
            No jewellery available.
          </p>

          <small>
            Publish an active product
            from the Admin panel.
          </small>

        </div>

      )}

    </section>
  );
}