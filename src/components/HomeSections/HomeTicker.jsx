import "./HomeSections.css";

const items = [
  "New Gold Collection",
  "Bridal Jewellery",
  "Silver Collection",
  "Everyday Elegance",
  "Crafted for Generations",
];

export default function HomeTicker() {
  return (
    <div className="home-ticker" aria-label="Viraj highlights">
      <div className="home-ticker-track">
        {[...items, ...items].map((item, index) => (
          <span key={`${item}-${index}`}>
            <i>✦</i> {item}
          </span>
        ))}
      </div>
    </div>
  );
}
