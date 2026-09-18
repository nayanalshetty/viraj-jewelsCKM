import ShopByCategory from "../components/ShopByCategory/ShopByCategory.jsx";
import ProductSection from "../components/ProductSection/ProductSection.jsx";
import Newsletter from "../components/Newsletter/Newsletter.jsx";
import Footer from "../components/Footer/Footer.jsx";
import Reveal from "../components/HomeSections/Reveal.jsx";
import HomeMediaSpotlight from "../components/HomeSections/HomeMediaSpotlight.jsx";
import HomeCampaign from "../components/HomeSections/HomeCampaign.jsx";
import HomeGifting from "../components/HomeSections/HomeGifting.jsx";
import HomeFestiveCampaign from "../components/HomeSections/HomeFestiveCampaign.jsx";
import HomeSearch from "../components/HomeSections/HomeSearch.jsx";
import "./Home.css";

function Home() {
  return (
    <main className="home">
      <HomeSearch />

      <Reveal>
        <ShopByCategory />
      </Reveal>

      <HomeMediaSpotlight />

      <Reveal>
        <HomeCampaign />
      </Reveal>

      <Reveal>
        <ProductSection title="Trending Jewels" type="bestseller" limit={6} />
      </Reveal>

      <Reveal>
        <HomeFestiveCampaign />
      </Reveal>

      <Reveal>
        <ProductSection title="New Collection" type="new" limit={6} />
      </Reveal>

      <Reveal>
        <HomeGifting />
      </Reveal>

      <Newsletter />
      <Footer />
    </main>
  );
}

export default Home;
