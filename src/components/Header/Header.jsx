import { Link } from "react-router-dom";
import { useState } from "react";

import { useWishlist } from "../../context/WishlistContext.jsx";
import { useCart } from "../../context/CartContext.jsx";

import "./Header.css";

export default function Header() {
  const { wishlistCount } = useWishlist();
  const { cartCount } = useCart();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openSection, setOpenSection] = useState(null);

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setOpenSection(null);
  };

  const toggleSection = (section) => {
    setOpenSection((current) =>
      current === section ? null : section
    );
  };

  return (
    <header className="site-header">

      {/* ANNOUNCEMENT */}

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
          onClick={() =>
            setMobileMenuOpen((value) => !value)
          }
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>


        {/* LOGO */}

        <Link
          to="/"
          className="header-logo"
          onClick={closeMenu}
        >
          <img
            src="/images/logo/viraj-logo-fixed.png"
            alt="Viraj Jewellers"
            className="viraj-logo"
          />
        </Link>


        {/* DESKTOP NAVIGATION */}

        <nav className="main-navigation">

          <Link
            to="/"
            className="nav-link"
          >
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


          {/* ABOUT */}

          <Link
            to="/about"
            className="nav-link"
          >
            About
          </Link>


          {/* CONTACT */}

          <Link
            to="/contact"
            className="nav-link"
          >
            Contact
          </Link>

        </nav>


        {/* HEADER ACTIONS */}

        <div className="header-actions">

          {/* SEARCH */}

          <Link
            to="/search"
            className="header-icon"
            aria-label="Search"
            title="Search"
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


          {/* MY ORDERS */}

          <Link
            to="/my-orders"
            className="header-icon my-orders-icon"
            aria-label="My Orders"
            title="My Orders"
          >
            <svg viewBox="0 0 24 24">
              <path d="M6 3h12v18H6z" />
              <path d="M9 7h6" />
              <path d="M9 11h6" />
              <path d="M9 15h4" />
            </svg>
          </Link>


          {/* WISHLIST */}

          <Link
            to="/wishlist"
            className="header-icon wishlist-icon"
            aria-label="Wishlist"
            title="Wishlist"
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
            aria-label="Shopping Bag"
            title="Shopping Bag"
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
            onClick={closeMenu}
          >
            Home
          </Link>


          {/* GOLD */}

          <button
            type="button"
            className={`mobile-menu-section-button ${
              openSection === "gold"
                ? "open"
                : ""
            }`}
            onClick={() =>
              toggleSection("gold")
            }
          >
            <span>Gold Jewellery</span>
            <span>⌄</span>
          </button>

          {openSection === "gold" && (
            <div className="mobile-menu-submenu">

              <Link
                to="/category?metal=gold&category=Rings"
                onClick={closeMenu}
              >
                Rings
              </Link>

              <Link
                to="/category?metal=gold&category=Earrings"
                onClick={closeMenu}
              >
                Earrings
              </Link>

              <Link
                to="/category?metal=gold&category=Necklaces"
                onClick={closeMenu}
              >
                Necklaces
              </Link>

              <Link
                to="/category?metal=gold&category=Bangles"
                onClick={closeMenu}
              >
                Bangles
              </Link>

              <Link
                to="/category?metal=gold&category=Chains"
                onClick={closeMenu}
              >
                Chains
              </Link>

              <Link
                to="/category?metal=gold&category=Pendants"
                onClick={closeMenu}
              >
                Pendants
              </Link>

            </div>
          )}


          {/* SILVER */}

          <button
            type="button"
            className={`mobile-menu-section-button ${
              openSection === "silver"
                ? "open"
                : ""
            }`}
            onClick={() =>
              toggleSection("silver")
            }
          >
            <span>Silver Jewellery</span>
            <span>⌄</span>
          </button>

          {openSection === "silver" && (
            <div className="mobile-menu-submenu">

              <Link
                to="/category?metal=silver&category=Rings"
                onClick={closeMenu}
              >
                Rings
              </Link>

              <Link
                to="/category?metal=silver&category=Earrings"
                onClick={closeMenu}
              >
                Earrings
              </Link>

              <Link
                to="/category?metal=silver&category=Necklaces"
                onClick={closeMenu}
              >
                Necklaces
              </Link>

              <Link
                to="/category?metal=silver&category=Bangles"
                onClick={closeMenu}
              >
                Bangles
              </Link>

              <Link
                to="/category?metal=silver&category=Chains"
                onClick={closeMenu}
              >
                Chains
              </Link>

              <Link
                to="/category?metal=silver&category=Pendants"
                onClick={closeMenu}
              >
                Pendants
              </Link>

            </div>
          )}


          {/* COLLECTIONS */}

          <button
            type="button"
            className={`mobile-menu-section-button ${
              openSection === "collections"
                ? "open"
                : ""
            }`}
            onClick={() =>
              toggleSection("collections")
            }
          >
            <span>Collections</span>
            <span>⌄</span>
          </button>

          {openSection === "collections" && (
            <div className="mobile-menu-submenu">

              <Link
                to="/category?collection=women"
                onClick={closeMenu}
              >
                Women's Jewellery
              </Link>

              <Link
                to="/category?collection=men"
                onClick={closeMenu}
              >
                Men's Jewellery
              </Link>

              <Link
                to="/category?collection=kids"
                onClick={closeMenu}
              >
                Kids Jewellery
              </Link>

              <Link
                to="/category?collection=wedding"
                onClick={closeMenu}
              >
                Wedding Collection
              </Link>

              <Link
                to="/category?collection=daily-wear"
                onClick={closeMenu}
              >
                Daily Wear
              </Link>

              <Link
                to="/category?collection=bridal"
                onClick={closeMenu}
              >
                Bridal Collection
              </Link>

            </div>
          )}


          <div className="mobile-menu-divider"></div>


          {/* ABOUT */}

          <Link
            to="/about"
            onClick={closeMenu}
          >
            About
          </Link>


          {/* CONTACT */}

          <Link
            to="/contact"
            onClick={closeMenu}
          >
            Contact
          </Link>


          {/* MY ORDERS */}

          <Link
            to="/my-orders"
            onClick={closeMenu}
          >
            My Orders
          </Link>


          {/* WISHLIST */}

          <Link
            to="/wishlist"
            onClick={closeMenu}
          >
            Wishlist
            {wishlistCount > 0
              ? ` (${wishlistCount})`
              : ""}
          </Link>


          {/* SHOPPING BAG */}

          <Link
            to="/cart"
            onClick={closeMenu}
          >
            Shopping Bag
            {cartCount > 0
              ? ` (${cartCount})`
              : ""}
          </Link>

        </div>
      )}

    </header>
  );
}