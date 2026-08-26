import "./Contact.css";

function Contact() {
  return (
    <main className="contact-page">

      <section className="contact-hero">
        <p>VIRAJ JEWELLERY</p>

        <h1>We're Here to Help</h1>

        <span>
          Visit us, call us or send us a message.
          Our jewellery experts are happy to assist you.
        </span>
      </section>

      <section className="contact-grid">

        <div className="contact-card">
          <span>VISIT US</span>
          <h2>Our Showroom</h2>
          <p>
            Viraj Jewellery<br />
            Main Road<br />
            Karnataka, India
          </p>
        </div>

        <div className="contact-card">
          <span>CALL US</span>
          <h2>Customer Care</h2>
          <p>
            Our team is available to help with
            products, orders and jewellery enquiries.
          </p>

          <a href="tel:+7019615965">
            +91 70196 15965
          </a>
        </div>

        <div className="contact-card">
          <span>EMAIL</span>
          <h2>Write to Us</h2>
          <p>
            For product and shopping enquiries:
          </p>

          <a href="mailto:info@virajjewellery.com">
            info@virajjewellery.com
          </a>
        </div>

      </section>

    </main>
  );
}

export default Contact;