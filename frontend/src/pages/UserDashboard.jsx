import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';

export default function UserDashboard() {
  const { user, isAuthenticated, isUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && isUser) {
      const fetchBookings = async () => {
        try {
          const res = await bookingAPI.getMyBookings();
          setBookings(res.data);
        } catch (err) {
          console.error(err);
        }
        setLoading(false);
      };
      fetchBookings();
    }
  }, [isAuthenticated, isUser]);

  if (!isAuthenticated || !isUser) {
    return (
      <div className="container" style={{ padding: '120px 20px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>Please log in as a Tenant to view this page.</p>
        <button className="btn btn-primary mt-4" onClick={() => navigate('/login')}>Login Now</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '120px 0 80px', background: 'var(--gray-50)', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }} className="animate-fade-in-down">
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
            {user?.name?.charAt(0)}
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: 4 }}>Hello, {user?.name}</h1>
            <p style={{ color: 'var(--gray-500)' }}>Tenant Dashboard</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }} className="animate-fade-in">
          {/* Sidebar Tabs */}
          <div className="card" style={{ width: 250, padding: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                style={{ padding: '12px 16px', textAlign: 'left', borderRadius: 'var(--radius-sm)', transition: 'all 0.2s',
                  background: activeTab === 'bookings' ? 'var(--primary-blue-50)' : 'transparent',
                  color: activeTab === 'bookings' ? 'var(--primary-blue)' : 'var(--gray-700)',
                  fontWeight: activeTab === 'bookings' ? 600 : 500 }}
                onClick={() => setActiveTab('bookings')}>
                📅 My Bookings
              </button>
              <button
                style={{ padding: '12px 16px', textAlign: 'left', borderRadius: 'var(--radius-sm)', transition: 'all 0.2s',
                  background: activeTab === 'wishlist' ? 'var(--primary-blue-50)' : 'transparent',
                  color: activeTab === 'wishlist' ? 'var(--primary-blue)' : 'var(--gray-700)',
                  fontWeight: activeTab === 'wishlist' ? 600 : 500 }}
                onClick={() => setActiveTab('wishlist')}>
                ❤️ Wishlist
              </button>
              <button
                style={{ padding: '12px 16px', textAlign: 'left', borderRadius: 'var(--radius-sm)', transition: 'all 0.2s',
                  background: activeTab === 'profile' ? 'var(--primary-blue-50)' : 'transparent',
                  color: activeTab === 'profile' ? 'var(--primary-blue)' : 'var(--gray-700)',
                  fontWeight: activeTab === 'profile' ? 600 : 500 }}
                onClick={() => setActiveTab('profile')}>
                👤 Profile & Docs
              </button>
            </div>
          </div>

          /* Main Content */
          <div style={{ flex: 1 }}>
            {activeTab === 'bookings' && (
              <div className="card animate-slide-up" style={{ padding: 32 }}>
                <h3 style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--gray-200)' }}>My Bookings</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {loading ? <p>Loading bookings...</p> : bookings.length === 0 ? <p>No bookings found.</p> : bookings.map(b => (
                    <div key={b.id} style={{ display: 'flex', gap: 20, padding: 20, border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <h4 style={{ fontSize: '1.1rem' }}>{b.property?.title}</h4>
                          <span className={`badge ${b.status === 'APPROVED' ? 'badge-success' : 'badge-primary'}`}>{b.status}</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', margin: '4px 0 12px' }}>Booking ID: {b.id} • Move-in Date: {b.moveInDate}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontWeight: 700, color: 'var(--accent-orange)' }}>₹{b.totalAmount} / month</div>
                          <Link to={`/properties/${b.property?.id}`} className="btn btn-secondary btn-sm">View Property</Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="card animate-slide-up" style={{ padding: 32 }}>
                <h3 style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--gray-200)' }}>My Wishlist</h3>
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-500)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 16 }}>❤️</div>
                  <p>Your wishlist is currently managed on the properties page.</p>
                  <Link to="/properties" className="btn btn-primary mt-4">Browse Properties</Link>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="card animate-slide-up" style={{ padding: 32 }}>
                <h3 style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--gray-200)' }}>Profile Settings</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" defaultValue={user?.name} readOnly />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input className="form-input bg-gray-100" readOnly value={user?.email} />
                  </div>
                </div>

                <h4 style={{ margin: '32px 0 16px', fontSize: '1rem', color: 'var(--gray-900)' }}>Document Verification</h4>
                <div style={{ padding: 20, background: 'var(--success-light)', border: '1px solid #34d399', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontSize: '2rem' }}>✅</div>
                  <div>
                    <h5 style={{ color: '#065f46', marginBottom: 4 }}>Aadhaar Card Verified</h5>
                    <p style={{ fontSize: '0.8rem', color: '#064e3b', margin: 0 }}>Your identity has been verified by our admin team. You are ready to book!</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
