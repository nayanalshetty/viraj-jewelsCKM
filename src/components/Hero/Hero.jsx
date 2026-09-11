import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Hero.css";

import hero1 from "../../assets/hero-1.jpg";
import hero2 from "../../assets/hero-2.jpg";
import hero3 from "../../assets/hero-3.jpg";
import hero4 from "../../assets/hero-4.jpg";

const slides = [
  {
    image: hero1,
    alt: "Viraj Jewellers gold jewellery collection",
    link: "/category?metal=gold",
  },
  {
    image: hero2,
    alt: "Viraj Jewellers traditional jewellery collection",
    link: "/category?metal=gold",
  },
  {
    image: hero3,
    alt: "Viraj Jewellers premium jewellery collection",
    link: "/category?metal=gold",
  },
  {
    image: hero4,
    alt: "Viraj Jewellers heritage jewellery collection",
    link: "/category?metal=gold",
  },
];

function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Automatic slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const current = slides[currentSlide];

  return (
    <section className="hero">

      {/* Current hero image */}
      <img
        key={current.image}
        className="hero-image"
        src={current.image}
        alt={current.alt}
      />

      {/* Invisible Explore Collection clickable area */}
      <Link
        to={current.link}
        className="hero-explore-link"
        aria-label="Explore Collection"
      />

      {/* Slide indicators */}
      <div className="hero-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`hero-dot ${
              index === currentSlide ? "active" : ""
            }`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

    </section>
  );
}

export default Hero;