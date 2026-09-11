import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";
import Reveal from "./Reveal.jsx";
import "./HomeSections.css";

function isVideo(item) {
  return item?.media_type === "video" || /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(String(item?.media_url || ""));
}

export default function HomeMediaSpotlight() {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const { data, error } = await supabase
        .from("homepage_media")
        .select("id, media_type, title, subtitle, media_url, link_url, display_order")
        .eq("content_area", "hero")
        .eq("is_published", true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(8);

      if (!mounted || error) return;
      setItems(data || []);
    }
    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (items.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % items.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [items.length]);

  const item = items[active];

  const fallbackItem = {
    id: "viraj-signature",
    media_type: "image",
    title: "Crafted to become your story.",
    subtitle: "A little luxury, beautifully made.",
    media_url: "/images/viraj-hero.jpg",
    link_url: "/category",
  };
  const activeItem = item || fallbackItem;
  const video = isVideo(activeItem);

  return (
    <Reveal>
      <section className="home-media-spotlight section-shell">
        <div className="media-spotlight-frame">
          <div className="media-spotlight-media-wrap" key={activeItem.id}>
            {video ? (
              <video
                className="media-spotlight-media media-spotlight-video"
                src={activeItem.media_url}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
            ) : (
              <img className="media-spotlight-media" src={activeItem.media_url} alt={activeItem.title || "Viraj Jewellery"} />
            )}
          </div>
          <div className="media-spotlight-shade" />
          <div className="media-spotlight-copy">
            <span>{video ? "VIRAJ IN MOTION" : "THE VIRAJ SIGNATURE"}</span>
            <h2>{activeItem.title || "Crafted for your moments"}</h2>
            {activeItem.subtitle && <p>{activeItem.subtitle}</p>}
            <Link to={activeItem.link_url || "/category"}>Explore <b>↗</b></Link>
          </div>
          {items.length > 1 && (
            <div className="media-spotlight-dots" aria-label="Homepage media slides">
              {items.map((entry, index) => (
                <button
                  type="button"
                  key={entry.id}
                  className={index === active ? "active" : ""}
                  onClick={() => setActive(index)}
                  aria-label={`Show homepage media ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </Reveal>
  );
}
