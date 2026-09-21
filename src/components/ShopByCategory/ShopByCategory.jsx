
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";
import categoryCatalog from "../../data/categories.js";
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
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isVideo(url) {
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(
    String(url || "")
  );
}

export default function ShopByCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageOverrides, setImageOverrides] = useState({});

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
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);

      // LOAD DATABASE CATEGORIES
      const {
        data: categoryData,
        error: categoryError,
      } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("name", { ascending: true });

      if (categoryError) {
        throw categoryError;
      }

      // LOAD HOMEPAGE CATEGORY MEDIA
      const {
        data: categoryMediaData,
        error: mediaError,
      } = await supabase
        .from("homepage_media")
        .select("target_key, media_url, display_order")
        .eq("is_published", true)
        .eq("placement", "category")
        .order("display_order", { ascending: true });

      if (mediaError) {
        console.error("Category media error:", mediaError);
      }

      // LOAD ACTIVE PRODUCTS AND IMAGES
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
        .order("created_at", { ascending: false });

      if (productError) {
        throw productError;
      }

      // MAP DATABASE CATEGORIES
      const dbBySlug = new Map();

      (categoryData || []).forEach((category) => {
        dbBySlug.set(
          normalize(category.slug || category.name),
          category
        );
      });

      // MAP PRODUCTS BY CATEGORY ID
      const productByCategory = new Map();

      (productData || []).forEach((product) => {
        const key = String(product.category_id);
        const existing = productByCategory.get(key) || [];

        existing.push(product);
        productByCategory.set(key, existing);
      });

      // MAP ADMIN MEDIA
      const categoryMediaBySlug = new Map();

      (categoryMediaData || []).forEach((item) => {
        const key = normalize(item.target_key);

        if (
          key &&
          item.media_url &&
          !categoryMediaBySlug.has(key)
        ) {
          categoryMediaBySlug.set(key, item.media_url);
        }
      });

      // BUILD CATEGORY CARDS
      const cards = categoryCatalog.map((catalogCategory) => {
        const catalogSlug = catalogCategory.slug;

        const dbCategory =
          dbBySlug.get(normalize(catalogSlug)) ||
          dbBySlug.get(normalize(catalogCategory.name));

        const categoryProducts = dbCategory
          ? productByCategory.get(String(dbCategory.id)) || []
          : [];

        let selectedImage =
          categoryMediaBySlug.get(normalize(catalogSlug)) ||
          catalogCategory.image ||
          "";

        // USE FIRST PRODUCT IMAGE IF NO ADMIN MEDIA
        if (!categoryMediaBySlug.has(normalize(catalogSlug))) {
          for (const product of categoryProducts) {
            const images = (product.product_images || [])
              .filter(
                (image) =>
                  image?.image_url &&
                  !isVideo(image.image_url)
              )
              .sort(
                (a, b) =>
                  Number(a.order ?? 0) -
                  Number(b.order ?? 0)
              );

            if (images[0]?.image_url) {
              selectedImage = images[0].image_url;
              break;
            }
          }
        }

        return {
          id: dbCategory?.id || catalogCategory.id,
          slug: catalogSlug,
          name: formatCategoryName(catalogCategory.name),
          label:
            catalogCategory.metal === "silver"
              ? "SILVER"
              : "GOLD",
          image: selectedImage,
        };
      });

      // STORE MEDIA OVERRIDES
      const overrides = Object.fromEntries(
        (categoryMediaData || [])
          .filter(
            (item) => item.target_key && item.media_url
          )
          .map((item) => [
            normalize(item.target_key),
            item.media_url,
          ])
      );

      setImageOverrides(overrides);
      setCategories(cards);
    } catch (error) {
      console.error("Shop By Category error:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="shop-category section-shell">
        <div className="shop-category-heading">
          <span>DISCOVER YOUR JEWELLERY</span>
          <h2>Find the piece that feels like you.</h2>
        </div>

        <div className="shop-category-loading">
          Curating the collection...
        </div>
      </section>
    );
  }

  return (
    <section className="shop-category section-shell">
      <div className="shop-category-heading">
        <div>
          <span>DISCOVER YOUR JEWELLERY</span>
          <h2>Find the piece that feels like you.</h2>
        </div>

        <Link
          to="/category"
          className="shop-category-all"
        >
          View all <b>↗</b>
        </Link>
      </div>

      {categories.length > 0 ? (
        <div className="shop-category-grid">
          {categories.map((category, index) => {
            const categoryImage =
              imageOverrides[normalize(category.slug)] ||
              category.image ||
              "";

            // IMPORTANT:
            // Use query parameters expected by Category.jsx.
            const categoryLink =
              `/category?category=${encodeURIComponent(
                category.slug
              )}`;

            return (
              <Link
                key={category.id}
                to={categoryLink}
                className={`shop-category-card shop-category-card-${
                  index % 7
                }`}
              >
                <div className="shop-category-image">
                  {categoryImage ? (
                    <img
                      src={categoryImage}
                      alt={category.name}
                      loading={index > 5 ? "lazy" : "eager"}
                      onError={(event) => {
                        event.currentTarget.style.display = "none";

                        const placeholder =
                          event.currentTarget.parentElement.querySelector(
                            ".shop-category-placeholder"
                          );

                        if (placeholder) {
                          placeholder.style.display = "flex";
                        }
                      }}
                    />
                  ) : null}

                  <div
                    className="shop-category-placeholder"
                    style={{
                      display: categoryImage ? "none" : "flex",
                    }}
                  >
                    <strong>
                      {category.name
                        .slice(0, 2)
                        .toUpperCase()}
                    </strong>
                  </div>

                  <div className="shop-category-shade" />

                  <div className="shop-category-arrow">
                    ↗
                  </div>
                </div>

                <div className="shop-category-content">
                  <small>
                    {String(
                      category.label || "JEWELLERY"
                    ).toUpperCase()}
                  </small>

                  <h3>{category.name}</h3>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="shop-category-empty">
          Add published products to your categories and
          they will appear here automatically.
        </div>
      )}
    </section>
  );
}