import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";
import "./ShopByCategory.css";

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function formatCategoryName(name) {
  return String(name || "Jewellery")
    .trim()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

export default function ShopByCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();

    const handleFocus = () => {
      loadCategories();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadCategories();
      }
    };

    window.addEventListener("focus", handleFocus);

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);

      /*
       * ==========================================
       * LOAD ALL CATEGORIES
       * ==========================================
       */

      const {
        data: categoryData,
        error: categoryError,
      } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("name", {
          ascending: true,
        });

      if (categoryError) {
        throw categoryError;
      }

      /*
       * ==========================================
       * LOAD ACTIVE PRODUCTS
       * ==========================================
       *
       * IMPORTANT:
       * Do NOT request products.image.
       *
       * Your images are stored in:
       *
       * product_images.image_url
       */

      const {
        data: productData,
        error: productError,
      } = await supabase
        .from("products")
        .select(`
          id,
          name,
          slug,
          category_id,
          created_at,
          is_active,
          short_description,
          purity,
          product_images (
            id,
            image_url,
            "order"
          )
        `)
        .eq("is_active", true)
        .order("created_at", {
          ascending: false,
        });

      if (productError) {
        throw productError;
      }

      console.log(
        "SHOP CATEGORY DATABASE:",
        categoryData
      );

      console.log(
        "SHOP CATEGORY PRODUCTS:",
        productData
      );

      /*
       * ==========================================
       * BUILD CATEGORY CARDS
       * ==========================================
       */

      const cards = (categoryData || []).map(
        (category) => {
          /*
           * Find products belonging to
           * this category.
           */

          const categoryProducts = (
            productData || []
          )
            .filter(
              (product) =>
                String(product.category_id) ===
                String(category.id)
            )
            .sort(
              (a, b) =>
                new Date(
                  b.created_at
                ).getTime() -
                new Date(
                  a.created_at
                ).getTime()
            );

          /*
           * ========================================
           * FIND LATEST PRODUCT WITH IMAGE
           * ========================================
           */

          let selectedProduct = null;
          let selectedImage = "";

          for (
            const product of categoryProducts
          ) {
            const images = (
              product.product_images || []
            )
              .filter(
                (image) =>
                  image &&
                  image.image_url
              )
              .sort(
                (a, b) =>
                  Number(a.order ?? 0) -
                  Number(b.order ?? 0)
              );

            if (images.length > 0) {
              selectedProduct = product;
              selectedImage =
                images[0].image_url;

              break;
            }
          }

          /*
           * ========================================
           * RETURN CATEGORY
           * ========================================
           */

          return {
            id: category.id,

            slug:
              category.slug ||
              normalize(category.name),

            name:
              formatCategoryName(
                category.name
              ),

            description:
              selectedProduct?.short_description ||
              `Explore our ${String(
                category.name || "jewellery"
              ).toLowerCase()} collection.`,

            label:
              selectedProduct?.purity ||
              "22K GOLD",

            image:
              selectedImage,

            productName:
              selectedProduct?.name ||
              "",

            productId:
              selectedProduct?.id ||
              null,
          };
        }
      );

      /*
       * ==========================================
       * SHOW CATEGORIES THAT HAVE PRODUCTS
       * ==========================================
       *
       * A category becomes visible on Home Page
       * once at least one product is published
       * inside that category.
       */

      const visibleCards = cards.filter(
        (category) =>
          category.productId !== null
      );

      console.log(
        "FINAL HOME CATEGORY CARDS:",
        visibleCards
      );

      setCategories(visibleCards);

    } catch (error) {
      console.error(
        "Shop By Category error:",
        error
      );

      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  /*
   * ==========================================
   * LOADING
   * ==========================================
   */

  if (loading) {
    return (
      <section className="shop-category">
        <div className="shop-category-heading">
          <h2>Category</h2>
        </div>

        <div className="shop-category-loading">
          Loading collections...
        </div>

      </section>
    );
  }

  /*
   * ==========================================
   * PAGE
   * ==========================================
   */

  return (
    <section className="shop-category">
        <div className="shop-category-heading">
          <h2>Category</h2>
        </div>

      {categories.length > 0 ? (

        <div className="shop-category-grid">

          {categories.map(
            (category) => (

              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="shop-category-card"
              >

                <div className="shop-category-image">

                  {category.image ? (

                    <img
                      src={`${category.image}${
                        category.image.includes("?")
                          ? "&"
                          : "?"
                      }v=${Date.now()}`}
                      alt={
                        category.productName ||
                        category.name
                      }
                      loading="lazy"
                      onError={(event) => {

                        event.currentTarget.style.display =
                          "none";

                        const placeholder =
                          event.currentTarget
                            .parentElement
                            .querySelector(
                              ".shop-category-placeholder"
                            );

                        if (placeholder) {
                          placeholder.style.display =
                            "flex";
                        }

                      }}
                    />

                  ) : null}

                  <div
                    className="shop-category-placeholder"
                    style={{
                      display:
                        category.image
                          ? "none"
                          : "flex",
                    }}
                  >

                    <strong>
                      VIRAJ
                    </strong>

                    <span>
                      JEWELLERY
                    </span>

                  </div>

                </div>

                <div className="shop-category-content">
                  <div>
                    <h3>{category.name}</h3>
                  </div>

                </div>

              </Link>

            )
          )}

        </div>

      ) : (

        <div className="shop-category-loading">
          No jewellery categories available yet.
        </div>

      )}

    </section>
  );
}