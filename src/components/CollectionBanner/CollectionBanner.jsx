import { Link } from "react-router-dom";
import "./CollectionBanner.css";

function CollectionBanner() {
  return (
    <section className="collection-banner">

      <div className="collection-banner-background" />

      <div className="collection-banner-content">

        <p className="collection-eyebrow">
          VIRAJ JEWELLERS
        </p>

        <h2>
          Jewellery
          <br />
          Made for
          <br />
          Every Moment.
        </h2>

        <div className="collection-divider">
          <span />
          <i>✦</i>
          <span />
        </div>

        <p className="collection-description">
          Discover timeless designs crafted to celebrate
          life's most beautiful moments.
        </p>

        <div className="collection-points">

          <div className="collection-point">
            <span className="collection-point-icon">◇</span>
            <div>
              <strong>22K GOLD</strong>
              <small>Purity You Can Trust</small>
            </div>
          </div>

          <div className="collection-point">
            <span className="collection-point-icon">♢</span>
            <div>
              <strong>HANDCRAFTED</strong>
              <small>By Skilled Artisans</small>
            </div>
          </div>

          <div className="collection-point">
            <span className="collection-point-icon">◈</span>
            <div>
              <strong>TRUSTED LEGACY</strong>
              <small>Since 1992</small>
            </div>
          </div>

        </div>

        <Link
          to="/category"
          className="collection-button"
        >
          <span>Explore Collection</span>
          <span>↗</span>
        </Link>

        <div className="collection-story">
          <span className="story-line" />
          <p>
            Celebrating over 30 years of trust, purity and timeless beauty.
            <br />
            Where every piece tells a story of elegance and heritage.
          </p>
        </div>

      </div>

      <div className="collection-model">

        <div className="collection-arch" />

        <img
          src="/images/collection-girl.jpg"
          alt="Woman wearing Viraj Jewellers"
        />

      </div>

      <div className="collection-flower flower-top-left" />
      <div className="collection-flower flower-bottom-left" />
      <div className="collection-flower flower-bottom-center" />
      <div className="collection-flower flower-right" />

    </section>
  );
}

export default CollectionBanner;