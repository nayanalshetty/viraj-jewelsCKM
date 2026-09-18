
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";

import "./HomeSections.css";

const campaignItems = [
  {
    key: "new-arrivals",
    title: "New Arrivals",
    fallback: "/images/collection-girl.jpg",
    link: "/category?collection=new-arrivals",
  },
  {
    key: "best-sellers",
    title: "Best Sellers",
    fallback: "/images/categories/bangles.jpg",
    link: "/category?collection=bestsellers",
  },
  {
    key: "festival-edit",
    title: "Festival Edit",
    fallback: "/images/categories/necklaces.jpg",
    link: "/category?collection=festive",
  },
  {
    key: "bridal-edit",
    title: "Bridal Edit",
    fallback: "/images/categories/earrings.jpg",
    link: "/category?collection=bridal",
  },
  {
    key: "daily-luxury",
    title: "Daily Luxury",
    fallback: "/images/categories/rings.jpg",
    link: "/category?collection=daily-wear",
  },
  {
    key: "silver-stories",
    title: "Silver Stories",
    fallback: "/images/categories/silver-jewellery.jpg",
    link: "/category?type=silver",
  },
];

export default function HomeCampaign() {
  const [mediaItems, setMediaItems] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadCampaignMedia() {
      const { data, error } = await supabase
        .from("homepage_media")
        .select("*")
        .eq("placement", "editorial")
        .eq("is_published", true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load campaign media:", error);
        return;
      }

      if (isMounted) {
        setMediaItems(data || []);
      }
    }

    loadCampaignMedia();

    return () => {
      isMounted = false;
    };
  }, []);

  function getMediaForItem(item) {
    return mediaItems.find(
      (media) => media.target_key === item.key
    );
  }

  return (
    <section
      className="home-campaign-grid section-shell"
      aria-label="Featured jewellery edits"
    >
      {campaignItems.map((item) => {
        const media = getMediaForItem(item);

        const imageUrl = media?.media_url || item.fallback;

        return (
          <Link
            key={item.key}
            to={item.link}
            className="home-campaign-card"
          >
            {media?.media_type === "video" ? (
              <video
                src={imageUrl}
                autoPlay
                muted
                loop
                playsInline
                aria-label={item.title}
              />
            ) : (
              <img
                src={imageUrl}
                alt={item.title}
                loading="lazy"
              />
            )}

            <span className="home-campaign-overlay" />

            <span className="home-campaign-copy">
              <strong>{item.title}</strong>

              <small>
                Explore <b aria-hidden="true">→</b>
              </small>
            </span>
          </Link>
        );
      })}
    </section>
  );
}