import ShopByCategory from "../components/ShopByCategory/ShopByCategory.jsx";
import ProductSection from "../components/ProductSection/ProductSection.jsx";
import Newsletter from "../components/Newsletter/Newsletter.jsx";
import Footer from "../components/Footer/Footer.jsx";
import Reveal from "../components/HomeSections/Reveal.jsx";
import HomeMediaSpotlight from "../components/HomeSections/HomeMediaSpotlight.jsx";
import HomeEditorialTiles from "../components/HomeSections/HomeEditorialTiles.jsx";
import HomeSearch from "../components/HomeSections/HomeSearch.jsx";

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
        <section className="home-mini-campaign section-shell">
          <div className="home-mini-campaign-media">
            <img src="/images/collection-girl.jpg" alt="Viraj Jewellery collection" loading="lazy" />
          </div>
          <div className="home-mini-campaign-copy">
            <span>THE FESTIVE EDIT</span>
            <h2>Moments deserve a little more sparkle.</h2>
            <p>Discover elegant gold and silver pieces made for celebrations, gifting and memories.</p>
            <a href="/category">Explore collection <b>↗</b></a>
          </div>
        </section>
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
