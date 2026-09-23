import {
  MapPin,
  Navigation,
  Clock3,
  ExternalLink,
} from "lucide-react";

import "./StoreLocation.css";

const STORE_ADDRESS =
  "Opposite Anjaneya Temple, M G Road, Viraj Jewels Shop, 577101";

// Exact Viraj Jewellers location
const LATITUDE = 13.3191418;
const LONGITUDE = 75.7741248;

const GOOGLE_MAPS_URL =
  `https://www.google.com/maps/search/?api=1&query=${LATITUDE},${LONGITUDE}`;

const MAP_EMBED_URL =
  `https://www.google.com/maps?q=${LATITUDE},${LONGITUDE}&z=17&output=embed`;

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

            <h3>Viraj Jewels CKM</h3>

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
              title="Viraj Jewellers CKM Store Location"
              src={MAP_EMBED_URL}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              style={{
                width: "100%",
                height: "100%",
                minHeight: "285px",
                border: 0,
                display: "block",
              }}
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