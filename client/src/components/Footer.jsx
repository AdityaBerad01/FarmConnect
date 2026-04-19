import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="navbar-logo" style={{ marginBottom: '0.5rem' }}>
              <div className="logo-icon">🌾</div>
              <span>FarmConnect</span>
            </Link>
            <p>Bridging the gap between farmers and buyers. Fresh produce, fair prices, direct from the farm to your doorstep.</p>
          </div>

          <div className="footer-column">
            <h4>Platform</h4>
            <Link to="/marketplace">Marketplace</Link>
            <Link to="/register">Sell as Farmer</Link>
            <Link to="/register">Buy as Buyer</Link>
          </div>

          <div className="footer-column">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Contact</a>
            <a href="#">Blog</a>
          </div>

          <div className="footer-column">
            <h4>Support</h4>
            <a href="#">Help Center</a>
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} FarmConnect. All rights reserved.</p>
          <p>Made with 💚 for Indian Farmers</p>
        </div>
      </div>
    </footer>
  );
}
