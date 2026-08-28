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

      {/* =====================================================
          DESKTOP HERO
          Hidden/reduced on mobile through CSS
          ===================================================== */}
      <section className="home-hero">
        <Hero />
      </section>


      {/* =====================================================
          SHOP BY CATEGORY
          Mobile-first compact category navigation
          ===================================================== */}
      <section className="home-categories">
        <ShopByCategory />
      </section>


      {/* =====================================================
          NEW ARRIVALS
          ===================================================== */}
      <ProductSection
        title="New Arrivals"
        subtitle="Fresh designs from VIRAJ"
        type="new"
        limit={4}
      />


      {/* =====================================================
          BESTSELLERS
          ===================================================== */}
      <ProductSection
        title="Bestsellers"
        subtitle="Loved by our customers"
        type="bestseller"
        limit={4}
      />


      {/* =====================================================
          EXPLORE JEWELLERY
          ===================================================== */}
      <ProductSection
        title="Explore Jewellery"
        subtitle="Find something made for you"
        type="all"
        limit={8}
      />


      {/* =====================================================
          COLLECTION BANNER
          ===================================================== */}
      <CollectionBanner />


      {/* =====================================================
          NEWSLETTER
          ===================================================== */}
      <Newsletter />


      {/* =====================================================
          FOOTER
          ===================================================== */}
      <Footer />

    </main>
  );
}

export default Home;