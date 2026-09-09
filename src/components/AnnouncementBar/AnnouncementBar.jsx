import "./AnnouncementBar.css";

function AnnouncementBar() {
  return (
    <div className="announcement-bar">
      <div className="announcement-track">
        <span>FREE SHIPPING ON ORDERS ABOVE ₹10,000</span>
        <span className="announcement-divider">|</span>
        <span>100% BIS HALLMARKED JEWELLERY</span>
        <span className="announcement-divider">|</span>
        <span>SECURE &amp; TRUSTED SHOPPING</span>
      </div>
    </div>
  );
}

export default AnnouncementBar;