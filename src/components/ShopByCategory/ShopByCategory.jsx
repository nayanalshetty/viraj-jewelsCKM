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
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
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

      const { data: categoryMediaData } = await supabase
        .from("homepage_media")
        .select("target_key, media_url, display_order")
        .eq("is_published", true)
        .eq("placement", "category")
        .order("display_order", { ascending: true });

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

      /*
       * Keep the homepage category strip stable even when the admin
       * database currently has only a few categories with products.
       * Database data supplies real images when available; the catalog
       * supplies the complete one-row discovery list.
       */
      const dbBySlug = new Map();
      (categoryData || []).forEach((category) => {
        dbBySlug.set(normalize(category.slug || category.name), category);
      });

      const productByCategory = new Map();
      (productData || []).forEach((product) => {
        const key = String(product.category_id);
        const existing = productByCategory.get(key) || [];
        existing.push(product);
        productByCategory.set(key, existing);
      });

      const categoryMediaBySlug = new Map();
      (categoryMediaData || []).forEach((item) => {
        if (item.target_key && item.media_url && !categoryMediaBySlug.has(normalize(item.target_key))) categoryMediaBySlug.set(normalize(item.target_key), item.media_url);
      });

      const cards = categoryCatalog.map((catalogCategory) => {
        const dbCategory =
          dbBySlug.get(normalize(catalogCategory.slug)) ||
          dbBySlug.get(normalize(catalogCategory.name));

        const categoryProducts = dbCategory
          ? (productByCategory.get(String(dbCategory.id)) || [])
          : [];

        let selectedImage = categoryMediaBySlug.get(normalize(catalogCategory.slug)) || catalogCategory.image || "";

        for (const product of (categoryMediaBySlug.get(normalize(catalogCategory.slug)) ? [] : categoryProducts)) {
          const images = (product.product_images || [])
            .filter((image) =>
              image?.image_url &&
              !/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(String(image.image_url))
            )
            .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0));

          if (images[0]?.image_url) {
            selectedImage = images[0].image_url;
            break;
          }
        }

        return {
          id: dbCategory?.id || catalogCategory.id,
          slug: catalogCategory.slug,
          name: formatCategoryName(catalogCategory.name),
          label: catalogCategory.metal === "silver" ? "SILVER" : "GOLD",
          image: selectedImage,
        };
      });

      const { data: overrideData } = await supabase
        .from("homepage_media")
        .select("media_key, media_url")
        .eq("content_area", "category")
        .eq("is_published", true);

      const overrides = Object.fromEntries((overrideData || []).filter((item) => item.media_key && item.media_url).map((item) => [item.media_key, item.media_url]));
      setImageOverrides(overrides);
      setCategories(cards);

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

  if (loading) {
    return (
      <section className="shop-category section-shell">
        <div className="shop-category-heading">
          <span>DISCOVER YOUR JEWELLERY</span>
          <h2>Find the piece that feels like you.</h2>
        </div>
        <div className="shop-category-loading">Curating the collection...</div>
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
        <Link to="/category" className="shop-category-all">View all <b>↗</b></Link>
      </div>

      {categories.length > 0 ? (
        <div className="shop-category-grid">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className={`shop-category-card shop-category-card-${index % 7}`}
            >
              <div className="shop-category-image">
                {category.image ? (
                  <img
                    src={imageOverrides[category.slug] || category.image}
                    alt={category.name}
                    loading={index > 5 ? "lazy" : "eager"}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                      const placeholder = event.currentTarget.parentElement.querySelector(".shop-category-placeholder");
                      if (placeholder) placeholder.style.display = "flex";
                    }}
                  />
                ) : null}
                <div className="shop-category-placeholder" style={{ display: (imageOverrides[category.slug] || category.image) ? "none" : "flex" }}>
                  <strong>{category.name.slice(0, 2).toUpperCase()}</strong>
                </div>
                <div className="shop-category-shade" />
                <div className="shop-category-arrow">↗</div>
              </div>
              <div className="shop-category-content">
                <small>{String(category.label || "JEWELLERY").toUpperCase()}</small>
                <h3>{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="shop-category-empty">
          Add published products to your categories and they will appear here automatically.
        </div>
      )}
    </section>
  );
}
