
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useSearchParams } from "react-router-dom";

import { supabase } from "../lib/supabase.js";

import ProductCard from "../components/ProductCard/ProductCard.jsx";

import "./Category.css";

function Category() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  // URL FILTERS
  const metalFilter =
    searchParams.get("metal") || "all";

  const categoryFilter =
    searchParams.get("category") || "all";

  const collectionFilter =
    searchParams.get("collection") || "all";

  const typeFilter =
    searchParams.get("type") || "all";

  // STATE
  const [sortBy, setSortBy] =
    useState("featured");

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  /*
   * =====================================================
   * LOAD PRODUCTS FROM SUPABASE
   * =====================================================
   */

  const loadProducts = useCallback(
    async () => {
      try {
        setLoading(true);

        const {
          data,
          error,
        } = await supabase
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
          throw error;
        }

        /*
         * LOAD PRODUCT IMAGES
         */

        const productIds =
          (data || []).map(
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
              "Category images error:",
              imageError
            );
          } else {
            imageData = images || [];
          }
        }

        /*
         * FORMAT PRODUCTS
         */

        const formatted =
          (data || []).map(
            (product) => {
              const images =
                imageData
                  .filter(
                    (image) =>
                      String(
                        image.product_id
                      ) ===
                      String(product.id) &&
                      !/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(
                        String(
                          image.image_url || ""
                        )
                      )
                  )
                  .sort(
                    (a, b) =>
                      Number(a.order ?? 0) -
                      Number(b.order ?? 0)
                  );

              return {
                ...product,

                product_images: images,

                mainImage:
                  images[0]?.image_url ||
                  product.image ||
                  "",
              };
            }
          );

        setProducts(formatted);
      } catch (error) {
        console.error(
          "Category products error:",
          error
        );

        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /*
   * =====================================================
   * INITIAL LOAD
   * =====================================================
   */

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  /*
   * =====================================================
   * REFRESH WHEN RETURNING TO PAGE
   * =====================================================
   */

  useEffect(() => {
    const handleFocus = () => {
      loadProducts();
    };

    const handleVisibility = () => {
      if (
        document.visibilityState ===
        "visible"
      ) {
        loadProducts();
      }
    };

    window.addEventListener(
      "focus",
      handleFocus
    );

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
  }, [loadProducts]);

  /*
   * =====================================================
   * SUPABASE REALTIME
   * =====================================================
   */

  useEffect(() => {
    const channel =
      supabase
        .channel(
          "category-products-live"
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
  }, [loadProducts]);

  /*
   * =====================================================
   * UPDATE FILTERS
   * =====================================================
   */

  const updateFilters = (
    changes = {}
  ) => {
    const nextParams =
      new URLSearchParams();

    const nextMetal =
      changes.metal !== undefined
        ? changes.metal
        : metalFilter;

    const nextCategory =
      changes.category !== undefined
        ? changes.category
        : categoryFilter;

    const nextCollection =
      changes.collection !== undefined
        ? changes.collection
        : collectionFilter;

    const nextType =
      changes.type !== undefined
        ? changes.type
        : typeFilter;

    if (
      nextMetal &&
      nextMetal !== "all"
    ) {
      nextParams.set(
        "metal",
        nextMetal
      );
    }

    if (
      nextCategory &&
      nextCategory !== "all"
    ) {
      nextParams.set(
        "category",
        nextCategory
      );
    }

    if (
      nextCollection &&
      nextCollection !== "all"
    ) {
      nextParams.set(
        "collection",
        nextCollection
      );
    }

    if (
      nextType &&
      nextType !== "all"
    ) {
      nextParams.set(
        "type",
        nextType
      );
    }

    setSearchParams(nextParams);
  };

  /*
   * =====================================================
   * CLEAR FILTERS
   * =====================================================
   */

  const clearFilters = () => {
    setSearchParams({});
    setSortBy("featured");
  };

  /*
   * =====================================================
   * FILTER PRODUCTS
   * =====================================================
   */

  const filteredProducts = useMemo(() => {
    let result = [...products];

    /*
     * FIND NEWEST PRODUCTS
     *
     * The latest 8 products are treated as
     * New Arrivals when no is_new field exists.
     */

    const newestProductIds = new Set(
      [...products]
        .sort(
          (a, b) =>
            new Date(
              b.created_at || 0
            ) -
            new Date(
              a.created_at || 0
            )
        )
        .slice(0, 8)
        .map((product) => product.id)
    );

    /*
     * TYPE FILTER
     */

    if (typeFilter !== "all") {
      const selectedType =
        typeFilter
          .trim()
          .toLowerCase();

      result = result.filter(
        (product) => {
          const collectionValues = [
            product.collection,
            product.collections,
            product.product_type,
            product.tags,
            product.occasion,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          /*
           * NEW ARRIVALS
           */

          if (selectedType === "new") {
            return (
              product.is_new === true ||
              collectionValues.includes(
                "new"
              ) ||
              newestProductIds.has(
                product.id
              )
            );
          }

          /*
           * BEST SELLERS
           */

          if (
            selectedType ===
              "bestseller" ||
            selectedType ===
              "best-seller"
          ) {
            return (
              product.is_bestseller === true ||
              product.is_featured === true ||
              collectionValues.includes(
                "bestseller"
              ) ||
              collectionValues.includes(
                "best seller"
              )
            );
          }

          /*
           * SILVER JEWELLERY
           */

          if (selectedType === "silver") {
            const metal = String(
              product.metal_type ||
                product.metal ||
                product.material ||
                ""
            ).toLowerCase();

            return metal.includes("silver");
          }

          return true;
        }
      );
    }

    /*
     * METAL FILTER
     */

    if (metalFilter !== "all") {
      result = result.filter(
        (product) => {
          const metal = String(
            product.metal_type ||
              product.metal ||
              product.material ||
              ""
          )
            .trim()
            .toLowerCase();

          return (
            metal ===
            metalFilter.toLowerCase()
          );
        }
      );
    }

    /*
     * CATEGORY FILTER
     */

    if (categoryFilter !== "all") {
      const selectedCategory =
        categoryFilter
          .trim()
          .toLowerCase();

      result = result.filter(
        (product) => {
          const categoryName =
            String(
              product.categories?.name ||
                product.category ||
                ""
            )
              .trim()
              .toLowerCase();

          const categorySlug =
            String(
              product.categories?.slug ||
                ""
            )
              .trim()
              .toLowerCase();

          return (
            categoryName ===
              selectedCategory ||
            categorySlug ===
              selectedCategory
          );
        }
      );
    }

    /*
     * COLLECTION FILTER
     */

    if (collectionFilter !== "all") {
      const filter =
        collectionFilter
          .replace(/-/g, " ")
          .toLowerCase();

      result = result.filter(
        (product) => {
          const values = [
            product.collection,
            product.collections,
            product.gender,
            product.occasion,
            product.product_type,
            product.tags,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return values.includes(filter);
        }
      );
    }

    /*
     * SORT PRODUCTS
     */

    if (sortBy === "price-low") {
      result.sort(
        (a, b) =>
          Number(a.price || 0) -
          Number(b.price || 0)
      );
    }

    if (sortBy === "price-high") {
      result.sort(
        (a, b) =>
          Number(b.price || 0) -
          Number(a.price || 0)
      );
    }

    if (sortBy === "name") {
      result.sort(
        (a, b) =>
          String(a.name || "").localeCompare(
            String(b.name || "")
          )
      );
    }

    return result;
  }, [
    products,
    metalFilter,
    categoryFilter,
    collectionFilter,
    typeFilter,
    sortBy,
  ]);

  /*
   * =====================================================
   * FILTER STATUS
   * =====================================================
   */

  const hasFilters =
    metalFilter !== "all" ||
    categoryFilter !== "all" ||
    collectionFilter !== "all" ||
    typeFilter !== "all";

  /*
   * =====================================================
   * PAGE TITLE
   * =====================================================
   */

  const getPageTitle = () => {
    if (typeFilter !== "all") {
      if (typeFilter === "new") {
        return "New Arrivals";
      }

      if (
        typeFilter === "bestseller" ||
        typeFilter === "best-seller"
      ) {
        return "Best Sellers";
      }

      if (typeFilter === "silver") {
        return "Silver Jewellery";
      }

      return typeFilter
        .replace(/-/g, " ")
        .replace(
          /\b\w/g,
          (letter) =>
            letter.toUpperCase()
        );
    }

    if (categoryFilter !== "all") {
      return categoryFilter
        .replace(/-/g, " ")
        .replace(
          /\b\w/g,
          (letter) =>
            letter.toUpperCase()
        );
    }

    if (collectionFilter !== "all") {
      return collectionFilter
        .replace(/-/g, " ")
        .replace(
          /\b\w/g,
          (letter) =>
            letter.toUpperCase()
        );
    }

    if (metalFilter !== "all") {
      return (
        metalFilter
          .charAt(0)
          .toUpperCase() +
        metalFilter.slice(1) +
        " Jewellery"
      );
    }

    return "Jewellery Collections";
  };

  /*
   * =====================================================
   * PAGE
   * =====================================================
   */

  return (
    <main className="category-page">

      {/* HERO */}

      <section className="category-hero">
        <p className="category-eyebrow">
          VIRAJ JEWELLERY
        </p>

        <h1>
          {getPageTitle()}
        </h1>

        <p className="category-description">
          Discover timeless gold
          and silver jewellery,
          thoughtfully crafted
          for every occasion.
        </p>
      </section>

      {/* CONTENT */}

      <section className="category-content">

        {/* TOOLBAR */}

        <div className="category-toolbar">

          <div className="category-result-info">
            <span className="category-result-label">
              COLLECTION
            </span>

            <strong>
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? "Product"
                : "Products"}
            </strong>
          </div>

          <div className="category-toolbar-right">

            {hasFilters && (
              <button
                type="button"
                className="clear-filters"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}

            <div className="category-sort">
              <span>Sort By</span>

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target.value
                  )
                }
              >
                <option value="featured">
                  Featured
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>

                <option value="name">
                  Name: A to Z
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* ACTIVE FILTERS */}

        {hasFilters && (
          <div className="active-filters">

            <span>Active Filters:</span>

            {typeFilter !== "all" && (
              <button
                type="button"
                onClick={() =>
                  updateFilters({
                    type: "all",
                  })
                }
              >
                {typeFilter} ×
              </button>
            )}

            {metalFilter !== "all" && (
              <button
                type="button"
                onClick={() =>
                  updateFilters({
                    metal: "all",
                  })
                }
              >
                {metalFilter} ×
              </button>
            )}

            {categoryFilter !== "all" && (
              <button
                type="button"
                onClick={() =>
                  updateFilters({
                    category: "all",
                  })
                }
              >
                {categoryFilter} ×
              </button>
            )}

            {collectionFilter !== "all" && (
              <button
                type="button"
                onClick={() =>
                  updateFilters({
                    collection: "all",
                  })
                }
              >
                {collectionFilter} ×
              </button>
            )}
          </div>
        )}

        {/* QUICK FILTERS */}

        <div className="category-quick-filters">

          <button
            type="button"
            className={
              !hasFilters ? "active" : ""
            }
            onClick={clearFilters}
          >
            All Jewellery
          </button>

          <button
            type="button"
            className={
              metalFilter === "gold"
                ? "active"
                : ""
            }
            onClick={() =>
              updateFilters({
                metal: "gold",
                category: "all",
                collection: "all",
                type: "all",
              })
            }
          >
            Gold
          </button>

          <button
            type="button"
            className={
              metalFilter === "silver"
                ? "active"
                : ""
            }
            onClick={() =>
              updateFilters({
                metal: "silver",
                category: "all",
                collection: "all",
                type: "all",
              })
            }
          >
            Silver
          </button>

          {[
            "Rings",
            "Earrings",
            "Necklaces",
            "Bangles",
            "Chains",
            "Pendants",
          ].map((category) => (
            <button
              key={category}
              type="button"
              className={
                categoryFilter.toLowerCase() ===
                category.toLowerCase()
                  ? "active"
                  : ""
              }
              onClick={() =>
                updateFilters({
                  category,
                  collection: "all",
                  type: "all",
                })
              }
            >
              {category}
            </button>
          ))}
        </div>

        {/* PRODUCTS */}

        {loading ? (
          <div className="category-empty">
            <p>VIRAJ JEWELLERY</p>

            <h2>
              Loading Jewellery...
            </h2>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="category-product-grid">
            {filteredProducts.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              )
            )}
          </div>
        ) : (
          <div className="category-empty">

            <div className="category-empty-mark">
              ♡
            </div>

            <p>VIRAJ JEWELLERY</p>

            <h2>
              No Jewellery Found
            </h2>

            <span>
              We couldn't find products
              matching your selected
              filters.
            </span>

            <button
              type="button"
              onClick={clearFilters}
            >
              View All Jewellery
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default Category;