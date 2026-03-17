import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { propertyAPI } from '../services/api';
import property1 from '../assets/property1.png';
import property2 from '../assets/property2.png';
import property3 from '../assets/property3.png';
import './PropertyDetails.css';

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('single');
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProp = async () => {
      setLoading(true);
      try {
        const res = await propertyAPI.getById(id);
        setProperty(res.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchProp();
  }, [id]);

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Proceed to booking page
    navigate(`/booking/${id}`);
  };

  if (loading) return <div style={{ padding: '120px 20px', textAlign: 'center' }}>Loading Property Details...</div>;
  if (!property) return <div style={{ padding: '120px 20px', textAlign: 'center' }}>Property Not Found!</div>;

  return (
    <div className="details-page">
      <div className="container">
        <div className="breadcrumbs animate-fade-in-down">
          <Link to="/">Home</Link> / <Link to="/properties">Properties</Link> / <span>{property.city}</span>
        </div>

        <div className="details-header animate-fade-in">
          <div className="details-title-area">
            <div className="badge badge-primary" style={{ marginBottom: '12px' }}>{property.type}</div>
            <h1>{property.title}</h1>
            <div className="details-location">
              📍 {property.city}
              <span style={{ margin: '0 8px', color: '#d1d5db' }}>|</span>
            </div>
          </div>
          <div className="details-actions">
            <button className="btn-icon-outline" title="Share">↗️</button>
            <button
              className={`btn-icon-outline ${wishlist ? 'active' : ''}`}
              title="Save to Wishlist"
              onClick={() => setWishlist(!wishlist)}
            >
              {wishlist ? '❤️' : '🤍'}
            </button>
          </div>
        </div>

        <div className="details-gallery animate-scale-in">
          {property.images && property.images.length > 0 ? (
            <>
              <img src={property.images[0]} alt="Main view" className="gallery-main" />
              {property.images.slice(1, 3).map((img, i) => (
                <img key={i} src={img} alt={`View ${i + 2}`} className="gallery-sub" />
              ))}
            </>
          ) : (
            <>
              <img src={property1} alt="Main view" className="gallery-main" />
              <img src={property2} alt="Room view" className="gallery-sub" />
              <img src={property3} alt="Living area" className="gallery-sub" />
            </>
          )}
        </div>

        <div className="details-content">
          <div className="details-left animate-fade-in-up">
            <div className="details-section">
              <h3>Property Overview</h3>
              <div className="info-grid mb-4">
                <div className="info-item">
                  <div className="info-icon">🚪</div>
                  <div className="info-text"><span>Total Rooms</span><strong>{property.totalRooms}</strong></div>
                </div>
                <div className="info-item">
                  <div className="info-icon">✨</div>
                  <div className="info-text"><span>Available</span><strong>{property.availableRooms}</strong></div>
                </div>
                <div className="info-item">
                  <div className="info-icon">🏠</div>
                  <div className="info-text"><span>Property Type</span><strong>{property.type}</strong></div>
                </div>
                <div className="info-item">
                  <div className="info-icon">📍</div>
                  <div className="info-text"><span>City</span><strong>{property.city}</strong></div>
                </div>
              </div>
              <p>{property.description}</p>
            </div>

            <div className="details-section">
              <h3>Amenities</h3>
              <div className="amenities-grid">
                {property.amenities?.map((amenity, i) => (
                  <div key={i} className="amenity-item">
                    <span>✅</span> {amenity}
                  </div>
                )) || <p>No amenities listed.</p>}
              </div>
            </div>

            {property.mapLink && (
              <div className="details-section animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <h3>Location</h3>
                <p style={{ color: 'var(--gray-500)', marginBottom: '16px' }}>View the exact location of this property on Google Maps.</p>
                <div className="map-container">
                  <div className="map-placeholder">
                    <div className="map-icon">🗺️</div>
                    <a 
                      href={property.mapLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-primary"
                      style={{ padding: '12px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      📍 Open in Google Maps
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div className="details-section">
              <h3>About the Owner</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-blue-100)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {property.owner?.name?.charAt(0) || "U"}
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{property.owner?.name || "Unknown Owner"}</h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-success">✅ Platform Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="details-right animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="booking-card">
              <div className="booking-price">
                ₹{property.price.toLocaleString()} <small>/month</small>
              </div>

              <div className="booking-form">
                <div className="form-group">
                  <label className="form-label">Select Room Type</label>
                  <select
                    className="form-select"
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                  >
                    <option value="single">Single Room (₹{property.price.toLocaleString()})</option>
                  </select>
                </div>

              </div>

              <div className="booking-total">
                <span>Security Deposit</span>
                <span>₹{property.deposit.toLocaleString()}</span>
              </div>

              <button className="btn btn-orange booking-btn" onClick={handleBookNow}>
                ⚡ Request to Book
              </button>

              <div className="booking-note">
                <p>🔒 You won't be charged yet.</p>
                <p style={{ marginTop: '8px' }}>Booking request will be sent to owner for approval.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

