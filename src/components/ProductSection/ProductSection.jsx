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
  const [loading, setLoading] = useState(true);

  const {
    toggleWishlist,
    isInWishlist,
  } = useWishlist();

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
      } else if (type === "bestseller") {
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
      } else if (type === "featured") {
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

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    function handleFocus() {
      loadProducts();
    }

    function handleVisibilityChange() {
      if (
        document.visibilityState ===
        "visible"
      ) {
        loadProducts();
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
  }, [loadProducts]);

  useEffect(() => {
    const channel =
      supabase
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
        .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadProducts, type]);

  if (loading) {
    return (
      <section className="product-section">
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

  return (
    <section className="product-section">

      {/* HEADER */}

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
          View All
          <span>→</span>
        </Link>

      </div>

      {/* PRODUCTS */}

      {products.length > 0 ? (

        <div className="product-section-grid">

          {products.map((product) => {

            const wishlistActive =
              isInWishlist(product.id);

            return (
              <div
                key={product.id}
                className="homepage-product-card"
              >

                {/* IMAGE */}

                <div className="homepage-product-image">

                  {product.mainImage ? (

                    <img
                      src={product.mainImage}
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
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();

                      toggleWishlist(product);
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

                {/* PRODUCT DETAILS */}

                <Link
                  to={`/product/${product.id}`}
                  className="homepage-product-link"
                >

                  <div className="homepage-product-info">

                    <p className="homepage-product-category">
                      {product.categories
                        ?.name ||
                        product.category ||
                        "JEWELLERY"}
                    </p>

                    <h3>
                      {product.name}
                    </h3>

                    <div className="homepage-product-meta">

                      {product.weight !==
                        null &&
                        product.weight !==
                          undefined &&
                        product.weight !==
                          "" && (
                          <span>
                            {
                              product.weight
                            }{" "}
                            g
                          </span>
                        )}

                      {product.purity && (
                        <>
                          {product.weight !==
                            null &&
                            product.weight !==
                              undefined &&
                            product.weight !==
                              "" && (
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
                        ₹
                        {Number(
                          product.price ||
                            0
                        ).toLocaleString(
                          "en-IN"
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
          })}

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