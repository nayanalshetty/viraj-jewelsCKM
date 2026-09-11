import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";
import "./HomeSections.css";

function isVideo(url) {
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(String(url || ""));
}

export default function HomeVideoStory() {
  const [video, setVideo] = useState(null);
  const [poster, setPoster] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      const { data: products } = await supabase
        .from("products")
        .select("id, name, product_images ( image_url, \"order\" )")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(12);

      if (!active) return;

      for (const product of products || []) {
        const media = [...(product.product_images || [])].sort(
          (a, b) => Number(a.order ?? 0) - Number(b.order ?? 0)
        );
        const foundVideo = media.find((item) => isVideo(item?.image_url));
        if (foundVideo?.image_url) {
          const firstImage = media.find((item) => item?.image_url && !isVideo(item.image_url));
          setVideo({ url: foundVideo.image_url, name: product.name || "Viraj Jewellery" });
          setPoster(firstImage?.image_url || "");
          return;
        }
      }

      setVideo(null);
    }

    load();
    return () => { active = false; };
  }, []);

  if (!video) return null;

  return (
    <section className="home-video-story section-shell">
      <div className="video-story-frame">
        <video
          className="video-story-media"
          src={video.url}
          poster={poster || undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className="video-story-shade" />
        <div className="video-story-copy">
          <span>JEWELLERY IN MOTION</span>
          <h2>See the detail.<br />Feel the story.</h2>
          <p>{video.name}</p>
          <Link to="/category" className="video-story-link">Explore Jewellery <b>↗</b></Link>
        </div>
        <div className="video-story-pulse" aria-hidden="true">▶</div>
      </div>
    </section>
  );
}
