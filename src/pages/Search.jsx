import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import products from "../data/products.js";
import ProductCard from "../components/ProductCard/ProductCard.jsx";

import "./Search.css";

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQuery = searchParams.get("q") || "";

  const [searchText, setSearchText] = useState(initialQuery);

  const query = initialQuery.trim().toLowerCase();

  const filteredProducts = useMemo(() => {
    if (!query) {
      return [];
    }

    return products.filter((product) => {
      const searchableText = [
        product.name,
        product.category,
        product.metal,
        product.material,
        product.gender,
        product.occasion,
        product.collection,
        product.purity,
        product.weight,
        product.description,
        product.shortDescription,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [query]);

  const handleSearch = (event) => {
    event.preventDefault();

    const value = searchText.trim();

    if (value) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

  const clearSearch = () => {
    setSearchText("");
    setSearchParams({});
  };

  return (
    <main className="search-page">

      {/* HEADER */}

      <section className="search-header">

        <p className="search-eyebrow">
          VIRAJ JEWELLERY
        </p>

        <h1>
          Search Jewellery
        </h1>

        <p className="search-subtitle">
          Find your perfect piece from our jewellery collection.
        </p>

        {/* SEARCH FORM */}

        <form
          className="search-form"
          onSubmit={handleSearch}
        >

          <div className="search-input-wrapper">

            <svg
              className="search-input-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle
                cx="11"
                cy="11"
                r="6.5"
              />

              <path d="M16 16L21 21" />
            </svg>

            <input
              type="search"
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
              placeholder="Search rings, earrings, gold, bridal..."
              aria-label="Search jewellery"
            />

            {searchText && (
              <button
                type="button"
                className="search-clear"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                ×
              </button>
            )}

          </div>

          <button
            type="submit"
            className="search-submit"
          >
            Search
          </button>

        </form>

      </section>


      {/* SEARCH RESULTS */}

      {query ? (

        <section className="search-results">

          <div className="search-results-heading">

            <div>
              <p>
                SEARCH RESULTS
              </p>

              <h2>
                Results for "{initialQuery}"
              </h2>
            </div>

            <span>
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? "product"
                : "products"}
            </span>

          </div>


          {filteredProducts.length > 0 ? (

            <div className="search-product-grid">

              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}

            </div>

          ) : (

            <div className="search-no-results">

              <div className="search-no-results-icon">
                ⌕
              </div>

              <p className="search-no-results-label">
                NO MATCH FOUND
              </p>

              <h2>
                We couldn't find that jewellery
              </h2>

              <p>
                Try searching for a different product,
                category or collection.
              </p>

              <button
                type="button"
                onClick={clearSearch}
                className="search-browse-button"
              >
                Browse All Jewellery
              </button>

            </div>

          )}

        </section>

      ) : (

        /* DEFAULT SEARCH STATE */

        <section className="search-discovery">

          <div className="search-discovery-heading">

            <p>
              EXPLORE VIRAJ
            </p>

            <h2>
              What are you looking for?
            </h2>

          </div>


          <div className="search-category-links">

            <Link to="/category?metal=gold">
              <span>01</span>
              <strong>Gold Jewellery</strong>
              <small>
                Timeless gold creations
              </small>
            </Link>

            <Link to="/category?metal=silver">
              <span>02</span>
              <strong>Silver Jewellery</strong>
              <small>
                Elegant silver designs
              </small>
            </Link>

            <Link to="/category?collection=bridal">
              <span>03</span>
              <strong>Bridal Collection</strong>
              <small>
                Made for your special day
              </small>
            </Link>

            <Link to="/category?collection=women">
              <span>04</span>
              <strong>Women's Jewellery</strong>
              <small>
                Everyday luxury
              </small>
            </Link>

            <Link to="/category?collection=men">
              <span>05</span>
              <strong>Men's Jewellery</strong>
              <small>
                Refined masculine designs
              </small>
            </Link>

            <Link to="/category?collection=kids">
              <span>06</span>
              <strong>Kids Jewellery</strong>
              <small>
                Beautiful little treasures
              </small>
            </Link>

          </div>

        </section>

      )}

    </main>
  );
}

export default Search;