import { Link } from "react-router-dom";
import "./HomeSections.css";

const occasionItems = [
  { title: "Gifting", image: "/images/categories/pendants.jpg", link: "/category?collection=gifting" },
  { title: "Wedding", image: "/images/categories/necklaces.jpg", link: "/category?collection=bridal" },
  { title: "Everyday", image: "/images/categories/chains.jpg", link: "/category?collection=daily-wear" },
];

export default function HomeGifting() {
  return (
    <section className="home-occasion section-shell" aria-labelledby="occasion-title">
      <div className="compact-section-heading">
        <h2 id="occasion-title">Shop by Occasion</h2>
        <Link to="/category" className="compact-view-all">View All <span>→</span></Link>
      </div>
      <div className="home-occasion-grid">
        {occasionItems.map((item) => (
          <Link key={item.title} to={item.link} className="home-occasion-card">
            <div className="home-occasion-image">
              <img src={item.image} alt={item.title} loading="lazy" />
            </div>
            <h3>{item.title}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
