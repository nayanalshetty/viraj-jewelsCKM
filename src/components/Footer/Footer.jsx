import "./Footer.css";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">

        {/* BRAND */}
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="footer-logo-mark">V</span>

            <div>
              <div className="footer-logo-name">VIRAJ</div>
              <div className="footer-logo-sub">JEWELLERS</div>
            </div>
          </div>

          <p>
            Every piece of jewellery tells a story.
            Discover timeless gold and silver jewellery
            crafted for every occasion.
          </p>
        </div>

        {/* SHOP */}
        <div className="footer-column">
          <h3>Shop</h3>

          <a href="/category?type=gold">Gold Jewellery</a>
          <a href="/category?type=silver">Silver Jewellery</a>
          <a href="/category?type=rings">Rings</a>
          <a href="/category?type=earrings">Earrings</a>
          <a href="/category?type=necklaces">Necklaces</a>
          <a href="/category?type=bangles">Bangles</a>
        </div>

        {/* COLLECTIONS */}
        <div className="footer-column">
          <h3>Collections</h3>

          <a href="/category?collection=women">Women</a>
          <a href="/category?collection=men">Men</a>
          <a href="/category?collection=kids">Kids</a>
          <a href="/category?collection=bridal">Bridal</a>
          <a href="/category?collection=daily-wear">Daily Wear</a>
          <a href="/category?collection=latest">New Arrivals</a>
        </div>

        {/* INFORMATION */}
        <div className="footer-column">
          <h3>Information</h3>

          <a href="/about">About Viraj</a>
          <a href="/contact">Contact Us</a>
          <a href="/wishlist">Wishlist</a>
          <a href="/cart">Shopping Bag</a>
          <a href="/search">Search</a>
        </div>

        {/* CONTACT */}
        <div className="footer-column footer-contact">
          <h3>Contact</h3>

          <p>Visit our showroom</p>
          <p>For jewellery enquiries</p>

          <a href="tel:+917019615965">
            +91 70196 15965
          </a>

          <a href="mailto:info@virajjewellers.com">
            info@virajjewellers.com
          </a>
        </div>

      </div>

      <div className="footer-bottom">

        <p>
          © {new Date().getFullYear()} Viraj Jewellers.
          All Rights Reserved.
        </p>

        <div className="footer-bottom-links">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms & Conditions</a>
        </div>

        <p className="footer-tagline">
          EVERY PIECE OF JEWELLERY TELLS A STORY.
        </p>

      </div>
    </footer>
  );
}

export default Footer;