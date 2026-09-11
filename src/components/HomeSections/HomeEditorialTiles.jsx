import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";
import hero1 from "../../assets/hero-1.jpg";
import hero2 from "../../assets/hero-2.jpg";
import hero3 from "../../assets/hero-3.jpg";
import hero4 from "../../assets/hero-4.jpg";
import "./HomeSections.css";

const defaults = [
  { key:"new-arrivals", title:"New Arrivals", eyebrow:"JUST IN", image:hero1, link:"/category" },
  { key:"best-sellers", title:"Best Sellers", eyebrow:"MOST LOVED", image:hero2, link:"/category" },
  { key:"festival-edit", title:"Festival Edit", eyebrow:"CELEBRATE", image:hero3, link:"/category" },
  { key:"bridal-edit", title:"Bridal Edit", eyebrow:"WEDDING", image:hero4, link:"/category" },
  { key:"daily-luxury", title:"Daily Luxury", eyebrow:"EVERYDAY", image:"/images/collection-girl.jpg", link:"/category" },
  { key:"silver-stories", title:"Silver Stories", eyebrow:"SILVER", image:hero2, link:"/category?metal=silver" },
];
export default function HomeEditorialTiles(){
  const [overrides,setOverrides]=useState([]);
  useEffect(()=>{supabase.from("homepage_media").select("media_key,media_type,title,subtitle,media_url,link_url,is_published,display_order").eq("content_area","tile").eq("is_published",true).then(({data})=>setOverrides(data||[]))},[]);
  const byKey=new Map(overrides.map(x=>[x.media_key,x]));
  const tiles=defaults.map(d=>{const o=byKey.get(d.key);return o?{...d,title:o.title||d.title,eyebrow:o.subtitle||d.eyebrow,image:o.media_url,link:o.link_url||d.link}:d});
  return <section className="home-editorial section-shell" aria-label="Viraj collections"><div className="home-editorial-grid">{tiles.map(tile=><Link key={tile.key} to={tile.link} className="home-editorial-card"><img src={tile.image} alt={tile.title} loading="lazy"/><span className="home-editorial-shade"/><span className="home-editorial-copy"><small>{tile.eyebrow}</small><strong>{tile.title}</strong><b>Explore ↗</b></span></Link>)}</div></section>
}
