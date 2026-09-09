import { Link } from "react-router-dom";
import hero1 from "../../assets/hero-1.jpg";
import hero2 from "../../assets/hero-2.jpg";
import hero3 from "../../assets/hero-3.jpg";
import hero4 from "../../assets/hero-4.jpg";
import "./HomeSections.css";

const tiles = [
  { title: "New Arrivals", eyebrow: "JUST IN", image: hero1, link: "/category" },
  { title: "Best Sellers", eyebrow: "MOST LOVED", image: hero2, link: "/category" },
  { title: "Festival Edit", eyebrow: "CELEBRATE", image: hero3, link: "/category" },
  { title: "Bridal Edit", eyebrow: "WEDDING", image: hero4, link: "/category" },
  { title: "Daily Luxury", eyebrow: "EVERYDAY", image: "/images/collection-girl.jpg", link: "/category" },
  { title: "Silver Stories", eyebrow: "SILVER", image: hero2, link: "/category?metal=silver" },
];

export default function HomeEditorialTiles() {
  return (
    <section className="home-editorial section-shell" aria-label="Viraj collections">
      <div className="home-editorial-grid">
        {tiles.map((tile) => (
          <Link key={tile.title} to={tile.link} className="home-editorial-card">
            <img src={tile.image} alt={tile.title} loading="lazy" />
            <span className="home-editorial-shade" />
            <span className="home-editorial-copy">
              <small>{tile.eyebrow}</small>
              <strong>{tile.title}</strong>
              <b>Explore ↗</b>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
