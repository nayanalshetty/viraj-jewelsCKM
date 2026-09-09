import "./Newsletter.css";

function Newsletter() {
  const handleSubmit = (event) => {
    event.preventDefault();

    const email = event.target.email.value.trim();

    if (!email) return;

    alert("Thank you for subscribing to VIRAJ JEWELLERS.");

    event.target.reset();
  };

  return (
    <section className="newsletter">
      <div className="newsletter-inner">

        <div className="newsletter-copy">
          <span className="newsletter-label">
            STAY CONNECTED
          </span>

          <h2>
            Be the first
            <br />
            to discover.
          </h2>

          <p>
            Subscribe to receive new collection launches,
            exclusive offers and jewellery inspiration from
            VIRAJ JEWELLERS.
          </p>
        </div>

        <div className="newsletter-form-area">
          <form
            className="newsletter-form"
            onSubmit={handleSubmit}
          >
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              aria-label="Email address"
              required
            />

            <button type="submit">
              Subscribe
              <span>↗</span>
            </button>
          </form>

          <small>
            By subscribing, you agree to receive updates from
            VIRAJ JEWELLERS.
          </small>
        </div>

      </div>
    </section>
  );
}

export default Newsletter;