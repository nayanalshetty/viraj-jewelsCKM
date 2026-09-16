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
