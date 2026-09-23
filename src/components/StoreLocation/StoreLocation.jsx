/* =========================================================
   VIRAJ JEWELS — STORE LOCATION
   ========================================================= */

import {
  MapPin,
  Navigation,
  Clock3,
  ExternalLink,
} from "lucide-react";

import "./StoreLocation.css";

const STORE_ADDRESS =
  "Opposite Anjaneya Temple, M G Road, Viraj Jewels Shop, 577101";

const MAP_SEARCH_TEXT =
  "Viraj Jewels, Opposite Anjaneya Temple, M G Road, 577101";

const MAP_QUERY = encodeURIComponent(
  MAP_SEARCH_TEXT
);

/*
 * Google Maps search page.
 * This is used by the buttons.
 */
const GOOGLE_MAPS_URL =
  `https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`;

/*
 * Google Maps embed.
 *
 * The /maps?q= format is intentionally kept simple
 * because it works without requiring a Google Maps API key.
 */
const MAP_EMBED_URL =
  `https://www.google.com/maps?q=${MAP_QUERY}&output=embed`;

export default function StoreLocation() {
  return (
    <section className="store-location">
      <div className="store-location-inner">

        {/* =================================================
            HEADING
            ================================================= */}
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

        {/* =================================================
            LOCATION GRID
            ================================================= */}
        <div className="store-location-grid">

          {/* =================================================
              STORE DETAILS
              ================================================= */}
          <div className="store-location-details">

            <div className="store-location-icon">
              <MapPin
                size={22}
                strokeWidth={1.5}
              />
            </div>

            <span className="store-location-label">
              OUR STORE
            </span>

            <h3>
              Viraj Jewels CKM
            </h3>

            <p className="store-location-address">
              {STORE_ADDRESS}
            </p>

            <div className="store-location-info">
              <div className="store-location-info-row">

                <Clock3
                  size={18}
                  strokeWidth={1.5}
                />

                <div>
                  <strong>
                    Store Hours
                  </strong>

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

              <span>
                Get Directions
              </span>

              <span>
                ↗
              </span>
            </a>

          </div>

          {/* =================================================
              MAP
              ================================================= */}
          <div className="store-location-map">

            <iframe
              title="Viraj Jewels CKM Store Location"
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

            {/* Map fallback / button */}
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="store-location-map-button"
            >
              <Navigation size={16} />

              <span>
                Open in Google Maps
              </span>

              <ExternalLink size={14} />
            </a>

          </div>

        </div>

      </div>
    </section>
  );
}