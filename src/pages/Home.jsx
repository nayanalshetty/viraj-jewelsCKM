import Hero from "../components/Hero/Hero.jsx";
import ShopByCategory from "../components/ShopByCategory/ShopByCategory.jsx";
import ProductSection from "../components/ProductSection/ProductSection.jsx";
import CollectionBanner from "../components/CollectionBanner/CollectionBanner.jsx";
import Newsletter from "../components/Newsletter/Newsletter.jsx";
import Footer from "../components/Footer/Footer.jsx";

import "./Home.css";

function Home() {
  return (
    <main className="home">

      <Hero />

      <ShopByCategory />

      <ProductSection
        title="Best Sellers"
        type="bestseller"
        limit={6}
      />

      <CollectionBanner />

      <ProductSection
        title="New Arrivals"
        type="new"
        limit={6}
      />

      <Newsletter />

      <Footer />

    </main>
  );
}

export default Home;