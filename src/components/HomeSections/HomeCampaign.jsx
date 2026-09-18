import { Link } from "react-router-dom";
import "./HomeSections.css";

const campaignItems = [
  { title: "New Arrivals", image: "/images/collection-girl.jpg", link: "/category?collection=new-arrivals" },
  { title: "Best Sellers", image: "/images/categories/bangles.jpg", link: "/category?collection=bestsellers" },
  { title: "Festival Edit", image: "/images/categories/necklaces.jpg", link: "/category?collection=festive" },
  { title: "Bridal Edit", image: "/images/categories/earrings.jpg", link: "/category?collection=bridal" },
  { title: "Daily Luxury", image: "/images/categories/rings.jpg", link: "/category?collection=daily-wear" },
  { title: "Silver Stories", image: "/images/categories/silver-jewellery.jpg", link: "/category?type=silver" },
];

export default function HomeCampaign() {
  return (
    <section className="home-campaign-grid section-shell" aria-label="Featured jewellery edits">
      {campaignItems.map((item) => (
        <Link key={item.title} to={item.link} className="home-campaign-card">
          <img src={item.image} alt={item.title} loading="lazy" />
          <span className="home-campaign-overlay" />
          <span className="home-campaign-copy">
            <strong>{item.title}</strong>
            <small>Explore <b aria-hidden="true">→</b></small>
          </span>
        </Link>
      ))}
    </section>
  );
}
