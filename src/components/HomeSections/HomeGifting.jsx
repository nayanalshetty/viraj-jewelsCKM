
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";

import "./HomeSections.css";

const occasionItems = [
  {
    key: "gifting",
    title: "Gifting",
    fallback: "/images/categories/pendants.jpg",
    link: "/category?collection=gifting",
  },
  {
    key: "bridal-edit",
    title: "Wedding",
    fallback: "/images/categories/necklaces.jpg",
    link: "/category?collection=bridal",
  },
  {
    key: "daily-luxury",
    title: "Everyday",
    fallback: "/images/categories/chains.jpg",
    link: "/category?collection=daily-wear",
  },
];

export default function HomeGifting() {
  const [mediaItems, setMediaItems] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadOccasionMedia() {
      const { data, error } = await supabase
        .from("homepage_media")
        .select("*")
        .eq("is_published", true)
        .in("placement", ["editorial", "campaign"])
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Occasion media error:", error);
        return;
      }

      if (isMounted) {
        setMediaItems(data || []);
      }
    }

    loadOccasionMedia();

    return () => {
      isMounted = false;
    };
  }, []);

  function getMediaForItem(item) {
    return mediaItems.find(
      (media) =>
        media.target_key?.toLowerCase().trim() === item.key
    );
  }

  return (
    <section
      className="home-occasion section-shell"
      aria-labelledby="occasion-title"
    >
      <div className="compact-section-heading">
        <h2 id="occasion-title">Shop by Occasion</h2>

        <Link to="/category" className="compact-view-all">
          View All <span>→</span>
        </Link>
      </div>

      <div className="home-occasion-grid">
        {occasionItems.map((item) => {
          const media = getMediaForItem(item);
          const imageUrl = media?.media_url || item.fallback;

          return (
            <Link
              key={item.key}
              to={item.link}
              className="home-occasion-card"
            >
              <div className="home-occasion-image">
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
              </div>

              <h3>{item.title}</h3>
            </Link>
          );
        })}
      </div>
    </section>
  );
}