import { Link } from "react-router-dom";
import { useState } from "react";

import { useWishlist } from "../../context/WishlistContext.jsx";
import { useCart } from "../../context/CartContext.jsx";

import "./Header.css";

function Header() {
  const { wishlistCount } = useWishlist();
  const { cartCount } = useCart();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="site-header">

      {/* TOP BAR */}
      <div className="announcement-bar">
        <span>FREE SHIPPING ON ORDERS ABOVE ₹10,000</span>
        <span className="announcement-divider">•</span>
        <span>100% BIS HALLMARKED JEWELLERY</span>
      </div>

      {/* MAIN HEADER */}
      <div className="header-main">

        {/* MOBILE MENU */}
        <button
          type="button"
          className={`mobile-menu-button ${
            mobileMenuOpen ? "active" : ""
          }`}
          aria-label={
            mobileMenuOpen
              ? "Close menu"
              : "Open menu"
          }
          aria-expanded={mobileMenuOpen}
          onClick={() =>
            setMobileMenuOpen(
              !mobileMenuOpen
            )
          }
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* LOGO */}
        <Link
          to="/"
          className="header-logo"
          onClick={closeMobileMenu}
        >
          <img
            src="/images/logo/viraj-logo-fixed.png"
            alt="Viraj Jewellers"
            className="viraj-logo"
          />
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="main-navigation">

          <Link to="/" className="nav-link">
            Home
          </Link>

          {/* GOLD */}
          <div className="nav-dropdown">
            <button
              type="button"
              className="nav-dropdown-button"
            >
              Gold
              <span>⌄</span>
            </button>

            <div className="dropdown-menu">
              <Link to="/category?metal=gold&category=Rings">
                Rings
              </Link>
              <Link to="/category?metal=gold&category=Earrings">
                Earrings
              </Link>
              <Link to="/category?metal=gold&category=Necklaces">
                Necklaces
              </Link>
              <Link to="/category?metal=gold&category=Bangles">
                Bangles
              </Link>
              <Link to="/category?metal=gold&category=Chains">
                Chains
              </Link>
              <Link to="/category?metal=gold&category=Pendants">
                Pendants
              </Link>
            </div>
          </div>

          {/* SILVER */}
          <div className="nav-dropdown">
            <button
              type="button"
              className="nav-dropdown-button"
            >
              Silver
              <span>⌄</span>
            </button>

            <div className="dropdown-menu">
              <Link to="/category?metal=silver&category=Rings">
                Rings
              </Link>
              <Link to="/category?metal=silver&category=Earrings">
                Earrings
              </Link>
              <Link to="/category?metal=silver&category=Necklaces">
                Necklaces
              </Link>
              <Link to="/category?metal=silver&category=Bangles">
                Bangles
              </Link>
              <Link to="/category?metal=silver&category=Chains">
                Chains
              </Link>
              <Link to="/category?metal=silver&category=Pendants">
                Pendants
              </Link>
            </div>
          </div>

          {/* COLLECTIONS */}
          <div className="nav-dropdown">
            <button
              type="button"
              className="nav-dropdown-button"
            >
              Collections
              <span>⌄</span>
            </button>

            <div className="dropdown-menu">
              <Link to="/category?collection=women">
                Women's Jewellery
              </Link>

              <Link to="/category?collection=men">
                Men's Jewellery
              </Link>

              <Link to="/category?collection=kids">
                Kids Jewellery
              </Link>

              <Link to="/category?collection=wedding">
                Wedding Collection
              </Link>

              <Link to="/category?collection=daily-wear">
                Daily Wear
              </Link>

              <Link to="/category?collection=bridal">
                Bridal Collection
              </Link>
            </div>
          </div>

          <Link to="/about" className="nav-link">
            About
          </Link>

          <Link to="/contact" className="nav-link">
            Contact
          </Link>

        </nav>

        {/* ACTIONS */}
        <div className="header-actions">

          {/* SEARCH */}
          <Link
            to="/search"
            className="header-icon"
            aria-label="Search"
          >
            <svg viewBox="0 0 24 24">
              <circle
                cx="11"
                cy="11"
                r="6.5"
              />
              <path d="M16 16L21 21" />
            </svg>
          </Link>

          {/* WISHLIST */}
          <Link
            to="/wishlist"
            className="header-icon wishlist-icon"
            aria-label="Wishlist"
          >
            <svg viewBox="0 0 24 24">
              <path d="M20.8 8.8c0 5.5-8.8 10.5-8.8 10.5S3.2 14.3 3.2 8.8A4.6 4.6 0 0 1 12 6.5a4.6 4.6 0 0 1 8.8 2.3Z" />
            </svg>

            {wishlistCount > 0 && (
              <span className="wishlist-count">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* CART */}
          <Link
            to="/cart"
            className="header-icon cart-icon"
            aria-label="Shopping Cart"
          >
            <svg viewBox="0 0 24 24">
              <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6" />

              <circle
                cx="10"
                cy="20"
                r="1.2"
              />

              <circle
                cx="18"
                cy="20"
                r="1.2"
              />
            </svg>

            {cartCount > 0 && (
              <span className="cart-count">
                {cartCount}
              </span>
            )}
          </Link>

        </div>

      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="mobile-menu">

          <Link
            to="/"
            onClick={closeMobileMenu}
          >
            Home
          </Link>

          <div className="mobile-menu-title">
            GOLD
          </div>

          <Link
            to="/category?metal=gold&category=Rings"
            onClick={closeMobileMenu}
          >
            Rings
          </Link>

          <Link
            to="/category?metal=gold&category=Earrings"
            onClick={closeMobileMenu}
          >
            Earrings
          </Link>

          <Link
            to="/category?metal=gold&category=Necklaces"
            onClick={closeMobileMenu}
          >
            Necklaces
          </Link>

          <Link
            to="/category?metal=gold&category=Bangles"
            onClick={closeMobileMenu}
          >
            Bangles
          </Link>

          <Link
            to="/category?metal=gold&category=Chains"
            onClick={closeMobileMenu}
          >
            Chains
          </Link>

          <Link
            to="/category?metal=gold&category=Pendants"
            onClick={closeMobileMenu}
          >
            Pendants
          </Link>

          <div className="mobile-menu-title">
            SILVER
          </div>

          <Link
            to="/category?metal=silver&category=Rings"
            onClick={closeMobileMenu}
          >
            Rings
          </Link>

          <Link
            to="/category?metal=silver&category=Earrings"
            onClick={closeMobileMenu}
          >
            Earrings
          </Link>

          <Link
            to="/category?metal=silver&category=Necklaces"
            onClick={closeMobileMenu}
          >
            Necklaces
          </Link>

          <Link
            to="/category?metal=silver&category=Bangles"
            onClick={closeMobileMenu}
          >
            Bangles
          </Link>

          <Link
            to="/category?metal=silver&category=Chains"
            onClick={closeMobileMenu}
          >
            Chains
          </Link>

          <Link
            to="/category?metal=silver&category=Pendants"
            onClick={closeMobileMenu}
          >
            Pendants
          </Link>

          <div className="mobile-menu-title">
            COLLECTIONS
          </div>

          <Link
            to="/category?collection=women"
            onClick={closeMobileMenu}
          >
            Women's Jewellery
          </Link>

          <Link
            to="/category?collection=men"
            onClick={closeMobileMenu}
          >
            Men's Jewellery
          </Link>

          <Link
            to="/category?collection=kids"
            onClick={closeMobileMenu}
          >
            Kids Jewellery
          </Link>

          <Link
            to="/category?collection=wedding"
            onClick={closeMobileMenu}
          >
            Wedding Collection
          </Link>

          <Link
            to="/category?collection=daily-wear"
            onClick={closeMobileMenu}
          >
            Daily Wear
          </Link>

          <Link
            to="/category?collection=bridal"
            onClick={closeMobileMenu}
          >
            Bridal Collection
          </Link>

          <div className="mobile-menu-divider" />

          <Link
            to="/about"
            onClick={closeMobileMenu}
          >
            About
          </Link>

          <Link
            to="/contact"
            onClick={closeMobileMenu}
          >
            Contact
          </Link>

          <Link
            to="/wishlist"
            onClick={closeMobileMenu}
          >
            Wishlist
            {wishlistCount > 0 &&
              ` (${wishlistCount})`}
          </Link>

          <Link
            to="/cart"
            onClick={closeMobileMenu}
          >
            Shopping Bag
            {cartCount > 0 &&
              ` (${cartCount})`}
          </Link>

        </div>
      )}

      {/* MOBILE SEARCH */}
      <div className="mobile-search-wrapper">
        <Link
          to="/search"
          className="mobile-search"
        >
          <svg viewBox="0 0 24 24">
            <circle
              cx="11"
              cy="11"
              r="6.5"
            />
            <path d="M16 16L21 21" />
          </svg>

          <span>
            Search jewellery, collections...
          </span>
        </Link>
      </div>

    </header>
  );
}

export default Header;