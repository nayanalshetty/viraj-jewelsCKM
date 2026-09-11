import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";
import "./HomeSections.css";
export default function HomeCampaign(){
 const [item,setItem]=useState(null);
 useEffect(()=>{let active=true;(async()=>{const {data}=await supabase.from("homepage_media").select("*").eq("is_published",true).eq("placement","campaign").order("display_order",{ascending:true}).limit(1).maybeSingle();if(active)setItem(data||null);})();return()=>{active=false};},[]);
 const current=item||{media_url:"/images/collection-girl.jpg",title:"Moments deserve a little more sparkle.",eyebrow:"THE FESTIVE EDIT",subtitle:"Discover elegant gold and silver pieces made for celebrations, gifting and memories.",link_url:"/category"};
 return <section className="home-mini-campaign section-shell"><div className="home-mini-campaign-media">{current.media_type==="video"?<video src={current.media_url} autoPlay muted loop playsInline/>:<img src={current.media_url} alt={current.title} loading="lazy"/>}</div><div className="home-mini-campaign-copy"><span>{current.eyebrow||"THE VIRAJ EDIT"}</span><h2>{current.title}</h2>{current.subtitle&&<p>{current.subtitle}</p>}<Link to={current.link_url||"/category"}>Explore collection <b>↗</b></Link></div></section>;
}
