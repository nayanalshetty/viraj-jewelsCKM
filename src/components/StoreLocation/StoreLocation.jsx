import {
  MapPin,
  Navigation,
  Clock3,
  ExternalLink,
} from "lucide-react";

import "./StoreLocation.css";

const STORE_ADDRESS =
  "Opposite Anjaneya Temple, M G Road, Viraj Jewellers Shop, 577101";

const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Viraj%20Jewellers%2C%20Kadur%2C%20Karnataka%20577101";

const MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3882.5000345183325!2d75.7741248!3d13.3191418!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bbad796e2b8a86d%3A0x6b17a61bea19580!2sViraj%20Jewellers!5e0!3m2!1sen!2sin!4v1790169060729!5m2!1sen!2sin";

export default function StoreLocation() {
  return (
    <section className="store-location">
      <div className="store-location-inner">

        <div className="store-location-heading">
          <span className="store-location-eyebrow">
            VISIT VIRAJ JEWELS
          </span>

          <h2>
            Find us in the
            <em> heart of the city.</em>
          </h2>

          <p>
            Discover timeless jewellery in person.
            Visit our store for a personal shopping
            experience.
          </p>
        </div>

        <div className="store-location-grid">

          <div className="store-location-details">

            <div className="store-location-icon">
              <MapPin size={22} strokeWidth={1.5} />
            </div>

            <span className="store-location-label">
              OUR STORE
            </span>

            <h3>Viraj Jewellers</h3>

            <p className="store-location-address">
              {STORE_ADDRESS}
            </p>

            <div className="store-location-info">
              <div className="store-location-info-row">
                <Clock3 size={18} strokeWidth={1.5} />

                <div>
                  <strong>Store Hours</strong>

                  <span>
                    Contact us for opening hours
                  </span>
                </div>
              </div>
            </div>

            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="store-location-directions"
            >
              <Navigation size={17} />

              <span>Get Directions</span>

              <span>↗</span>
            </a>

          </div>

          <div className="store-location-map">

            <iframe
              title="Viraj Jewellers Store Location"
              src={MAP_EMBED_URL}
              width="600"
              height="450"
              style={{
                border: 0,
                width: "100%",
                height: "100%",
                minHeight: "285px",
                display: "block",
              }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />

            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="store-location-map-button"
            >
              <Navigation size={16} />

              <span>Open in Google Maps</span>

              <ExternalLink size={14} />
            </a>

          </div>

        </div>
      </div>
    </section>
  );
}