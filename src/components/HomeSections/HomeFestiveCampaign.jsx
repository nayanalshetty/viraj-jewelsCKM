import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";

import "./HomeSections.css";

export default function HomeFestiveCampaign() {
  const [campaign, setCampaign] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCampaign() {
      const { data, error } = await supabase
        .from("homepage_media")
        .select("*")
        .eq("placement", "campaign")
        .eq("is_published", true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Failed to load festive campaign:", error);
        return;
      }

      if (isMounted && data) {
        setCampaign(data);
      }
    }

    loadCampaign();

    return () => {
      isMounted = false;
    };
  }, []);

  const imageUrl =
    campaign?.media_url || "/images/collection-girl.jpg";

  const title =
    campaign?.title || "Moments deserve a little more sparkle.";

  const eyebrow =
    campaign?.eyebrow || "The Festive Edit";

  const description =
    campaign?.subtitle ||
    "Discover elegant gold and silver pieces made for celebrations, gifting and memories.";

  const linkUrl =
    campaign?.link_url || "/category?collection=festive";

  return (
    <section
      className="home-mini-campaign section-shell"
      aria-labelledby="festive-campaign-title"
    >
      <div className="home-mini-campaign-media">
        {campaign?.media_type === "video" ? (
          <video
            src={imageUrl}
            autoPlay
            muted
            loop
            playsInline
            aria-label={title}
          />
        ) : (
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
          />
        )}
      </div>

      <div className="home-mini-campaign-copy">
        <span>{eyebrow}</span>

        <h2 id="festive-campaign-title">
          {title}
        </h2>

        <p>{description}</p>

        <Link
          to={linkUrl}
          className="home-mini-campaign-link"
        >
          Explore Collection <b aria-hidden="true">↗</b>
        </Link>
      </div>
    </section>
  );
}