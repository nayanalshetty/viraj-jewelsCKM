import { Link } from "react-router-dom";
import hero2 from "../../assets/hero-2.jpg";
import hero4 from "../../assets/hero-4.jpg";
const collectionGirl = "/images/collection-girl.jpg";
import "./HomeSections.css";

const occasions = [
  { title: "Wedding", text: "Statement pieces for your biggest moments.", image: collectionGirl, link: "/category" },
  { title: "Festive", text: "Traditional sparkle with a modern finish.", image: hero2, link: "/category" },
  { title: "Daily Wear", text: "Light, refined pieces made for every day.", image: hero4, link: "/category" },
];

export default function HomeOccasions() {
  return (
    <section className="home-occasions section-shell">
      <div className="section-intro">
        <span>SHOP BY MOMENT</span>
        <h2>Jewellery for every chapter.</h2>
      </div>

      <div className="occasion-grid">
        {occasions.map((item, index) => (
          <Link key={item.title} to={item.link} className={`occasion-card occasion-${index + 1}`}>
            <img src={item.image} alt={item.title} loading="lazy" />
            <div className="occasion-shade" />
            <div className="occasion-copy">
              <small>0{index + 1}</small>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <b>Discover →</b>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
