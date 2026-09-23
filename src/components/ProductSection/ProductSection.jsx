import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { Link, useNavigate } from "react-router-dom";
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
  const [loading, setLoading] = useState(true);
  const [ratesLoading, setRatesLoading] = useState(true);

  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  /*
   * NUMBER HELPER
   */
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

  /*
   * PRODUCT DATE
   */
  function productDate(product) {
    return new Date(
      product?.created_at || 0
    ).getTime();
  }

  /*
   * PRODUCT POPULARITY
   */
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

      if (number > 0) {
        return number;
      }
    }

    return 0;
  }

  /*
   * LOAD GOLD AND SILVER RATES
   */
  const loadRates = useCallback(async () => {
    try {
      setRatesLoading(true);

      const today = new Date()
        .toISOString()
        .slice(0, 10);

      const {
        data,
        error,
      } = await supabase
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
          "Homepage rate error:",
          error
        );

        setRates(null);
        return;
      }

      setRates(data || null);
    } catch (error) {
      console.error(
        "Rate loading error:",
        error
      );

      setRates(null);
    } finally {
      setRatesLoading(false);
    }
  }, []);

  /*
   * LOAD PRODUCTS
   */
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);

      const {
        data,
        error,
      } = await supabase
        .from("products")
        .select("*")
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

      console.log(
        "VIRAJ HOMEPAGE PRODUCTS:",
        data
      );

      const productIds = (data || []).map(
        (product) => product.id
      );

      let imageData = [];

      /*
       * LOAD PRODUCT IMAGES
       */
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
          .in(
            "product_id",
            productIds
          )
          .order("order", {
            ascending: true,
          });

        if (imageError) {
          console.error(
            "Homepage image error:",
            imageError
          );
        } else {
          imageData = images || [];
        }
      }

      /*
       * FORMAT PRODUCTS
       */
      const formattedProducts = (
        data || []
      ).map((product) => {
        const productImages =
          imageData
            .filter(
              (image) =>
                String(
                  image.product_id
                ) === String(product.id) &&
                image.image_url &&
                !/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(
                  String(image.image_url)
                )
            )
            .sort(
              (a, b) =>
                Number(a.order ?? 0) -
                Number(b.order ?? 0)
            );

        const mainImage =
          productImages[0]?.image_url ||
          product.image ||
          "";

        return {
          ...product,
          mainImage,
          product_images:
            productImages,
        };
      });

      /*
       * SORT PRODUCTS
       *
       * NEW COLLECTION
       */
      let finalProducts = [
        ...formattedProducts,
      ];

      if (type === "new") {
        finalProducts = finalProducts
          .sort(
            (a, b) =>
              productDate(b) -
              productDate(a)
          )
          .slice(0, limit);
      }

      /*
       * TRENDING JEWELS
       */
      else if (type === "bestseller") {
        finalProducts = finalProducts
          .sort((a, b) => {
            const scoreA =
              productPopularity(a) +
              (a.is_featured ? 5 : 0);

            const scoreB =
              productPopularity(b) +
              (b.is_featured ? 5 : 0);

            return (
              scoreB - scoreA ||
              productDate(b) -
                productDate(a)
            );
          })
          .slice(0, limit);
      }

      /*
       * FEATURED
       */
      else if (type === "featured") {
        finalProducts = finalProducts
          .filter(
            (product) =>
              product.is_featured === true
          )
          .sort(
            (a, b) =>
              productDate(b) -
              productDate(a)
          )
          .slice(0, limit);
      }

      /*
       * DEFAULT
       */
      else {
        finalProducts = finalProducts
          .sort(
            (a, b) =>
              productDate(b) -
              productDate(a)
          )
          .slice(0, limit);
      }

      setProducts(finalProducts);
    } catch (error) {
      console.error(
        "Unexpected homepage error:",
        error
      );

      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [limit, type]);

  /*
   * PRICE CALCULATION
   */
  function calculatePrice(product) {
    if (!rates) {
      return 0;
    }

    const weight = toNumber(
      product.weight
    );

    if (weight <= 0) {
      return 0;
    }

    const metal = String(
      product.metal_type ||
        product.metal ||
        product.material ||
        ""
    )
      .toLowerCase()
      .trim();

    const purity = String(
      product.purity ||
        product.gold_purity ||
        ""
    )
      .toLowerCase()
      .replace(/\s+/g, "");

    let metalRate = 0;

    if (metal.includes("silver")) {
      metalRate = toNumber(
        rates.silver_rate
      );
    } else if (purity.includes("24")) {
      metalRate = toNumber(
        rates.rate_24k
      );
    } else if (purity.includes("18")) {
      metalRate = toNumber(
        rates.rate_18k
      );
    } else {
      metalRate = toNumber(
        rates.rate_22k
      );
    }

    if (metalRate <= 0) {
      return 0;
    }

    const metalValue =
      weight * metalRate;

    const makingCharge = toNumber(
      product.making_charge
    );

    const makingTotal =
      weight * makingCharge;

    const subtotal =
      metalValue + makingTotal;

    const gst = toNumber(
      product.gst
    );

    const gstAmount =
      subtotal * (gst / 100);

    return Math.round(
      subtotal + gstAmount
    );
  }

  /*
   * INITIAL LOAD
   */
  useEffect(() => {
    loadProducts();
    loadRates();
  }, [
    loadProducts,
    loadRates,
  ]);

  /*
   * REFRESH WHEN RETURNING TO WEBSITE
   */
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
  }, [
    loadProducts,
    loadRates,
  ]);

  /*
   * REALTIME UPDATES
   */
  useEffect(() => {
    const channel = supabase
      .channel(
        `homepage-products-${type}`
      )
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
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "gold_rates",
        },
        () => {
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

  /*
   * VISIBLE PRODUCTS
   *
   * Filters were intentionally removed
   * from the homepage UI.
   */
  const visibleProducts = products;

  /*
   * LOADING
   */
  if (loading) {
    return (
      <section
        className={`product-section product-section-${type}`}
      >
        <div className="product-section-header">
          <div className="product-section-heading">
            <p className="product-section-eyebrow">
              VIRAJ JEWELLERY
            </p>

            <h2>{title}</h2>

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

  /*
   * RENDER
   */
  return (
    <section
      className={`product-section product-section-${type}`}
    >
      <div className="product-section-header">
        <div className="product-section-heading">
          <p className="product-section-eyebrow">
            VIRAJ JEWELLERY
          </p>

          <h2>{title}</h2>

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
          View All <span>→</span>
        </Link>
      </div>

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

              return (
                <div
                  key={product.id}
                  className="homepage-product-card"
                  onClick={() =>
                    navigate(
                      `/product/${product.id}`
                    )
                  }
                  onKeyDown={(
                    event
                  ) => {
                    if (
                      event.key ===
                        "Enter" ||
                      event.key === " "
                    ) {
                      event.preventDefault();

                      navigate(
                        `/product/${product.id}`
                      );
                    }
                  }}
                  role="link"
                  tabIndex={0}
                  aria-label={`View ${product.name}`}
                >
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
                    >
                      {wishlistActive
                        ? "♥"
                        : "♡"}
                    </button>
                  </div>

                  <Link
                    to={`/product/${product.id}`}
                    className="homepage-product-link"
                    onClick={(
                      event
                    ) =>
                      event.stopPropagation()
                    }
                  >
                    <div className="homepage-product-info">
                      <p className="homepage-product-category">
                        {product.category ||
                          "JEWELLERY"}
                      </p>

                      <h3>
                        {product.name}
                      </h3>

                      <div className="homepage-product-meta">
                        {weight > 0 && (
                          <span>
                            {weight} g
                          </span>
                        )}

                        {product.purity && (
                          <>
                            {weight >
                              0 && (
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

                      <div className="homepage-product-bottom">
                        <strong>
                          {ratesLoading &&
                          !product.price
                            ? "Calculating..."
                            : calculatedPrice >
                              0
                            ? `₹${calculatedPrice.toLocaleString(
                                "en-IN"
                              )}`
                            : toNumber(
                                product.price
                              ) > 0
                            ? `₹${toNumber(
                                product.price
                              ).toLocaleString(
                                "en-IN"
                              )}`
                            : "₹ —"}
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
            Please check your active
            products in the Admin panel.
          </small>
        </div>
      )}
    </section>
  );
}