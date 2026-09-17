import { Link } from "react-router-dom";
import hero1 from "../../assets/hero-1.jpg";
import hero3 from "../../assets/hero-3.jpg";
import "./HomeSections.css";

export default function HomeWorlds() {
  return (
    <section className="home-worlds section-shell">
      <div className="section-intro compact-intro">
        <span>EXPLORE THE COLLECTION</span>
        <h2>Two worlds. One timeless story.</h2>
      </div>

      <div className="world-grid">
        <Link to="/category?metal=gold" className="world-card world-gold">
          <img src={hero1} alt="Gold jewellery collection" loading="lazy" />
          <div className="world-overlay" />
          <div className="world-copy">
            <small>THE GOLD EDIT</small>
            <h3>Gold Jewellery</h3>
            <b>Explore →</b>
          </div>
        </Link>

        <Link to="/category?metal=silver" className="world-card world-silver">
          <img src={hero3} alt="Silver jewellery collection" loading="lazy" />
          <div className="world-overlay" />
          <div className="world-copy">
            <small>THE SILVER EDIT</small>
            <h3>Silver Jewellery</h3>
            <b>Explore →</b>
          </div>
        </Link>
      </div>
    </section>
  );
}
