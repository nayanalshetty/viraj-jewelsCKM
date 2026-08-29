import { Link } from "react-router-dom";
import "./CollectionBanner.css";

function CollectionBanner() {
  return (
    <section className="collection-banner">
      <div className="collection-banner-content">
        <p className="collection-eyebrow">VIRAJ JEWELLERS</p>
        <h2>Timeless<br />Elegance.</h2>
        <p className="collection-description">
          Crafted to shine through every celebration.
        </p>
        <Link to="/category" className="collection-button">
          <span>Shop Collection</span>
          <span>↗</span>
        </Link>
      </div>

      <div className="collection-model">
        <img
          src="/images/collection-girl.jpg"
          alt="Viraj Jewellers collection"
        />
        <div className="collection-image-glow" />
      </div>
    </section>
  );
}

export default CollectionBanner;
