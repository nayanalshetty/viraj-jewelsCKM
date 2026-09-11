import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import ShopByCategory from "../components/ShopByCategory/ShopByCategory.jsx";
import ProductSection from "../components/ProductSection/ProductSection.jsx";
import Newsletter from "../components/Newsletter/Newsletter.jsx";
import Footer from "../components/Footer/Footer.jsx";
import Reveal from "../components/HomeSections/Reveal.jsx";
import HomeMediaSpotlight from "../components/HomeSections/HomeMediaSpotlight.jsx";
import HomeEditorialTiles from "../components/HomeSections/HomeEditorialTiles.jsx";
import HomeSearch from "../components/HomeSections/HomeSearch.jsx";
import HomeCampaign from "../components/HomeSections/HomeCampaign.jsx";

import "./Home.css";

function Home() {
  const [campaign, setCampaign] = useState(null);
  useEffect(() => {
    supabase.from("homepage_media").select("media_type,title,subtitle,media_url,link_url").eq("content_area", "campaign").eq("is_published", true).order("display_order").limit(1).maybeSingle().then(({ data }) => setCampaign(data || null));
  }, []);
  const campaignMedia = campaign?.media_url || "/images/collection-girl.jpg";
  return (
    <main className="home">
      <HomeSearch />

      <Reveal>
        <ShopByCategory />
      </Reveal>

      {/* Main luxury hero: uses the admin photo/video rotation */}
      <HomeMediaSpotlight />

      <Reveal>
        <HomeEditorialTiles />
      </Reveal>

      <Reveal>
        <ProductSection title="Trending Jewellery" type="bestseller" limit={7} />
      </Reveal>

      <Reveal>
        <HomeCampaign />
      </Reveal>

      <Reveal>
        <ProductSection title="New Collection" type="new" limit={7} />
      </Reveal>

      <Newsletter />
      <Footer />
    </main>
  );
}

export default Home;
