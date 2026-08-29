import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import "./AdminRates.css";

export default function AdminRates() {
  const [rates, setRates] = useState({
    rate_24k: "",
    rate_22k: "",
    rate_18k: "",
    silver_rate: "",
    effective_date: new Date()
      .toISOString()
      .slice(0, 10),
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  /* =========================================================
     LOAD LATEST RATES
     ========================================================= */

  async function loadRates() {
    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase
        .from("gold_rates")
        .select("*")
        .order("effective_date", {
          ascending: false,
        })
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setRates({
          rate_24k: data.rate_24k ?? "",
          rate_22k: data.rate_22k ?? "",
          rate_18k: data.rate_18k ?? "",
          silver_rate: data.silver_rate ?? "",
          effective_date:
            data.effective_date ||
            new Date()
              .toISOString()
              .slice(0, 10),
        });
      }
    } catch (error) {
      console.error(
        "VIRAJ RATES LOAD ERROR:",
        error
      );

      setMessage(
        error?.message ||
          "Unable to load saved rates."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     INITIAL LOAD
     ========================================================= */

  useEffect(() => {
    loadRates();
  }, []);

  /* =========================================================
     CHANGE FIELD
     ========================================================= */

  function updateRate(field, value) {
    setRates((current) => ({
      ...current,
      [field]: value,
    }));
  }

  /* =========================================================
     SAVE RATES
     ========================================================= */

  async function save(event) {
    event.preventDefault();

    setMessage("");

    const rate24 = Number(rates.rate_24k);
    const rate22 = Number(rates.rate_22k);
    const rate18 = Number(rates.rate_18k);
    const silver = Number(rates.silver_rate);

    if (rate24 <= 0) {
      setMessage(
        "Please enter a valid 24K Gold rate."
      );
      return;
    }

    if (rate22 <= 0) {
      setMessage(
        "Please enter a valid 22K Gold rate."
      );
      return;
    }

    if (rate18 <= 0) {
      setMessage(
        "Please enter a valid 18K Gold rate."
      );
      return;
    }

    if (silver <= 0) {
      setMessage(
        "Please enter a valid Silver rate."
      );
      return;
    }

    if (!rates.effective_date) {
      setMessage(
        "Please select an effective date."
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        rate_24k: rate24,
        rate_22k: rate22,
        rate_18k: rate18,
        silver_rate: silver,
        effective_date:
          rates.effective_date,
      };

      const { error } = await supabase
        .from("gold_rates")
        .insert(payload);

      if (error) {
        throw error;
      }

      setMessage(
        "✓ Gold & Silver rates saved successfully."
      );

      await loadRates();
    } catch (error) {
      console.error(
        "VIRAJ RATE SAVE ERROR:",
        error
      );

      setMessage(
        error?.message ||
          "Unable to save rates."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <main className="admin-rates-page">
        <div className="admin-loading-box">
          Loading Gold & Silver rates...
        </div>
      </main>
    );
  }

  /* =========================================================
     PAGE
     ========================================================= */

  return (
    <main className="admin-rates-page">

      <header className="admin-page-header">

        <div>
          <p className="admin-eyebrow">
            VIRAJ JEWELLERY · DAILY PRICING
          </p>

          <h1>
            Gold & Silver Rates
          </h1>

          <p>
            Update today's rates. Product prices
            will automatically use these rates.
          </p>
        </div>

        <Link
          to="/admin"
          className="admin-light-button"
        >
          ← Dashboard
        </Link>

      </header>

      {message && (
        <div className="admin-message">
          {message}
        </div>
      )}

      <form
        className="rates-card"
        onSubmit={save}
      >

        <div className="rate-grid">

          {/* 24K */}

          <label>
            24K Gold / gram

            <input
              type="number"
              step="0.01"
              min="0"
              value={rates.rate_24k}
              onChange={(event) =>
                updateRate(
                  "rate_24k",
                  event.target.value
                )
              }
              placeholder="₹ 0.00"
            />
          </label>

          {/* 22K */}

          <label>
            22K Gold / gram

            <input
              type="number"
              step="0.01"
              min="0"
              value={rates.rate_22k}
              onChange={(event) =>
                updateRate(
                  "rate_22k",
                  event.target.value
                )
              }
              placeholder="₹ 0.00"
            />
          </label>

          {/* 18K */}

          <label>
            18K Gold / gram

            <input
              type="number"
              step="0.01"
              min="0"
              value={rates.rate_18k}
              onChange={(event) =>
                updateRate(
                  "rate_18k",
                  event.target.value
                )
              }
              placeholder="₹ 0.00"
            />
          </label>

          {/* SILVER */}

          <label>
            Silver / gram

            <input
              type="number"
              step="0.01"
              min="0"
              value={rates.silver_rate}
              onChange={(event) =>
                updateRate(
                  "silver_rate",
                  event.target.value
                )
              }
              placeholder="₹ 0.00"
            />
          </label>

          {/* DATE */}

          <label>
            Effective Date

            <input
              type="date"
              value={rates.effective_date}
              onChange={(event) =>
                updateRate(
                  "effective_date",
                  event.target.value
                )
              }
            />
          </label>

        </div>

        <div className="rate-note">

          <strong>
            💰 AUTOMATIC PRODUCT PRICING
          </strong>

          <span>
            Gold products use the selected
            purity rate. Silver products use
            the Silver rate. Changing these
            rates updates the calculation on
            product pages.
          </span>

        </div>

        <button
          type="submit"
          className="admin-publish-button"
          disabled={saving}
        >
          {saving
            ? "SAVING..."
            : "SAVE TODAY'S RATES"}
        </button>

      </form>

    </main>
  );
}