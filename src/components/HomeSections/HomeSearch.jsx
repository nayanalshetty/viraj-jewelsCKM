import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HomeSections.css";

export default function HomeSearch() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function submit(event) {
    event.preventDefault();
    const value = query.trim();
    navigate(value ? `/search?q=${encodeURIComponent(value)}` : "/search");
  }

  return (
    <section className="home-search section-shell">
      <form className="home-search-form" onSubmit={submit} role="search">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16 16L21 21" />
        </svg>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search jewellery, rings, earrings..."
          aria-label="Search jewellery"
        />
        <button type="submit" aria-label="Search">Search</button>
      </form>
    </section>
  );
}
