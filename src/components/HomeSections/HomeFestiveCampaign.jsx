import { Link } from "react-router-dom";
import "./HomeSections.css";

export default function HomeFestiveCampaign() {
  return (
    <section className="home-mini-campaign section-shell" aria-labelledby="festive-campaign-title">
      <div className="home-mini-campaign-media">
        <img
          src="/images/collection-girl.jpg"
          alt="Woman wearing an elegant gold jewellery set"
          loading="lazy"
        />
      </div>

      <div className="home-mini-campaign-copy">
        <span>The Festive Edit</span>
        <h2 id="festive-campaign-title">Moments deserve a little more sparkle.</h2>
        <p>
          Discover elegant gold and silver pieces made for celebrations,
          gifting and memories.
        </p>
        <Link to="/category?collection=festive" className="home-mini-campaign-link">
          Explore Collection <b aria-hidden="true">↗</b>
        </Link>
      </div>
    </section>
  );
}
