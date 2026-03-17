import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">Stay<span>zone</span></div>
          <p>
            India's smart PG & room rental platform. Find verified properties, book with confidence, and enjoy seamless living.
          </p>
          <div className="footer-socials">
            <div className="footer-social-icon">📘</div>
            <div className="footer-social-icon">🐦</div>
            <div className="footer-social-icon">📷</div>
            <div className="footer-social-icon">💼</div>
          </div>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/properties">Properties</Link>
          <Link to="/register">Sign Up</Link>
          <Link to="/login">Login</Link>
        </div>

        <div className="footer-col">
          <h4>For Owners</h4>
          <Link to="/register">List Your Property</Link>
          <Link to="/owner-dashboard">Owner Dashboard</Link>
          <a href="#">Pricing</a>
          <a href="#">FAQs</a>
        </div>

        <div className="footer-col">
          <h4>Support</h4>
          <a href="#">Help Center</a>
          <a href="#">Contact Us</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>

      <div className="footer-bottom">
        © 2026 <a href="/">StayZone</a>. All rights reserved. Built with ❤️ in India.
      </div>
    </footer>
  );
}
