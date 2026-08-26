import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";

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

  /*
   * =========================================================
   * LOAD PRODUCTS FROM SUPABASE
   * =========================================================
   */

  const loadProducts = useCallback(async () => {
    try {
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
        setLoading(false);

        return;
      }

      /*
       * =====================================================
       * LOAD PRODUCT IMAGES SEPARATELY
       *
       * This is intentional.
       *
       * It avoids depending on Supabase's nested
       * product_images relationship.
       * =====================================================
       */

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
          .in(
            "product_id",
            productIds
          )
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

      /*
       * =====================================================
       * CREATE IMAGE MAP
       * =====================================================
       */

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

      /*
       * =====================================================
       * FORMAT PRODUCTS
       * =====================================================
       */

      const formattedProducts = (
        data || []
      )
        .map((product) => {
          /*
           * First priority:
           * product_images table
           */

          let mainImage =
            imageMap[product.id] || "";

          /*
           * Second priority:
           * old products.image column
           */

          if (
            !mainImage &&
            product.image
          ) {
            mainImage =
              product.image;
          }

          return {
            ...product,

            mainImage,

            product_images:
              imageData.filter(
                (image) =>
                  String(
                    image.product_id
                  ) ===
                  String(
                    product.id
                  )
              ),
          };
        })
        .filter(Boolean);

      /*
       * =====================================================
       * SORT
       * =====================================================
       */

      let finalProducts = [
        ...formattedProducts,
      ];

      /*
       * NEW ARRIVALS
       *
       * Newest products first.
       */

      if (type === "new") {
        finalProducts =
          finalProducts
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

      /*
       * BESTSELLERS
       *
       * Until a bestseller field is being
       * maintained in the database, use the
       * newest active products.
       */

      else if (
        type === "bestseller"
      ) {
        finalProducts =
          finalProducts
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

      /*
       * FEATURED
       *
       * Actually use the is_featured
       * checkbox from AdminProducts.
       */

      else if (
        type === "featured"
      ) {
        finalProducts =
          finalProducts
            .filter(
              (product) =>
                product.is_featured ===
                true
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
      }

      /*
       * ALL PRODUCTS
       */

      else {
        finalProducts =
          finalProducts
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

      console.log(
        `HOME ${type.toUpperCase()} PRODUCTS:`,
        finalProducts
      );

      setProducts(
        finalProducts
      );
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

  /*
   * =========================================================
   * INITIAL LOAD
   * =========================================================
   */

  useEffect(() => {
    let mounted = true;

    async function initialLoad() {
      if (!mounted) {
        return;
      }

      setLoading(true);

      await loadProducts();
    }

    initialLoad();

    return () => {
      mounted = false;
    };
  }, [loadProducts]);

  /*
   * =========================================================
   * REFRESH WHEN USER RETURNS TO WEBSITE
   * =========================================================
   *
   * This solves:
   *
   * Admin → publish product → return to homepage
   *
   * The homepage will fetch the latest products again.
   * =========================================================
   */

  useEffect(() => {
    function handleFocus() {
      console.log(
        "Homepage focused — refreshing products..."
      );

      loadProducts();
    }

    function handleVisibilityChange() {
      if (
        document.visibilityState ===
        "visible"
      ) {
        console.log(
          "Homepage visible — refreshing products..."
        );

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

  /*
   * =========================================================
   * SUPABASE REALTIME
   * =========================================================
   *
   * This is the important part.
   *
   * If admin creates/updates/deletes a product,
   * homepage automatically reloads.
   *
   * If admin uploads product images,
   * homepage automatically reloads.
   * =========================================================
   */

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
          (payload) => {
            console.log(
              "PRODUCT DATABASE CHANGE:",
              payload
            );

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
          (payload) => {
            console.log(
              "PRODUCT IMAGE DATABASE CHANGE:",
              payload
            );

            loadProducts();
          }
        )
        .subscribe((status) => {
          console.log(
            "Homepage realtime:",
            status
          );
        });

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, [loadProducts, type]);

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

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

  /*
   * =========================================================
   * PAGE
   * =========================================================
   */

  return (
    <section className="product-section">

      {/* HEADER */}

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
          <span>→</span>
        </Link>

      </div>

      {/* PRODUCTS */}

      {products.length > 0 ? (

        <div className="product-section-grid">

          {products.map(
            (product) => (

              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="homepage-product-card"
              >

                {/* IMAGE */}

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
                        console.error(
                          "Product image failed:",
                          product.mainImage
                        );

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

                </div>

                {/* DETAILS */}

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

            )
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