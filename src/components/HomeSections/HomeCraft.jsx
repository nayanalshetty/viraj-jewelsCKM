import { Link } from "react-router-dom";
import hero1 from "../../assets/hero-1.jpg";
import hero3 from "../../assets/hero-3.jpg";
import "./HomeSections.css";

export default function HomeCraft() {
  return (
    <section className="home-craft section-shell">
      <div className="craft-copy">
        <span>THE VIRAJ SIGNATURE</span>
        <h2>Crafted to become<br /><em>your story.</em></h2>
        <p>From traditional forms to contemporary silhouettes, every piece is chosen to feel special today and treasured tomorrow.</p>
        <Link to="/category" className="craft-link">Discover the collection <b>→</b></Link>
      </div>
      <div className="craft-collage">
        <div className="craft-large"><img src={hero3} alt="Viraj jewellery craftsmanship" loading="lazy" /></div>
        <div className="craft-small"><img src={hero1} alt="Gold jewellery detail" loading="lazy" /></div>
        <div className="craft-number">V<br /><small>01</small></div>
      </div>
    </section>
  );
}
