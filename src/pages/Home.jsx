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

      {/* HERO */}
      <Hero />

      {/* SHOP BY CATEGORY */}
      <ShopByCategory />

      {/* NEW ARRIVALS */}
      <ProductSection
        title="New Arrivals"
        subtitle="Discover the latest additions to our jewellery collection."
        type="new"
        limit={4}
      />

      {/* BESTSELLERS */}
      <ProductSection
        title="Bestsellers"
        subtitle="Our most loved jewellery, chosen by Viraj customers."
        type="bestseller"
        limit={4}
      />

      {/* EXPLORE ALL JEWELLERY */}
      <ProductSection
        title="Explore Our Jewellery"
        subtitle="Timeless designs crafted for every occasion."
        type="all"
        limit={8}
      />

      {/* COLLECTION BANNER */}
      <CollectionBanner />

      {/* FEATURED COLLECTION */}
      <ProductSection
        title="Featured Jewellery"
        subtitle="Signature pieces selected from the VIRAJ collection."
        type="featured"
        limit={4}
      />

      {/* NEWSLETTER */}
      <Newsletter />

      {/* FOOTER */}
      <Footer />

    </main>
  );
}

export default Home;