import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { propertyAPI, bookingAPI } from '../services/api';

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [property, setProperty] = useState(null);
  const [moveInDate, setMoveInDate] = useState('');
  const [moveOutDate, setMoveOutDate] = useState('');

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await propertyAPI.getById(id);
        setProperty(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProperty();
  }, [id]);

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '120px 20px', textAlign: 'center' }}>
        <h2>Login Required</h2>
        <p>You must be logged in to book a property.</p>
        <button className="btn btn-primary mt-4" onClick={() => navigate('/login')}>Login Now</button>
      </div>
    );
  }

  if (!property) return <div style={{ padding: '120px 20px', textAlign: 'center' }}>Loading...</div>;

  const gst = property.price * 0.18;
  const total = property.price + property.deposit + gst;

  const handlePayment = async () => {
    if (!agreed) {
      alert('Please agree to the terms and rules');
      return;
    }
    if (!moveInDate) {
      alert('Please select a move-in date');
      return;
    }
    if (!moveOutDate) {
      alert('Please select a move-out date');
      return;
    }
    if (moveOutDate <= moveInDate) {
      alert('Move-out date must be after move-in date');
      return;
    }

    setLoading(true);
    try {
      await bookingAPI.create({
        propertyId: id,
        moveInDate: moveInDate,
        moveOutDate: moveOutDate
      });
      alert('Booking Request Sent! The owner will review your request.');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to send booking request');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '120px 0 80px', background: 'var(--gray-50)', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: 1000 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: 32 }} className="animate-fade-in-down">
          Confirm Your Booking
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', gap: 40 }} className="animate-slide-up">
          {/* Left Side */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="card" style={{ padding: 32 }}>
              <h3 style={{ marginBottom: 20 }}>Booking Rules & Hybrid Approval</h3>
              <div style={{ background: 'var(--primary-blue-50)', padding: 16, borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary-blue)', marginBottom: 20 }}>
                <h4 style={{ color: 'var(--primary-blue-900)', fontSize: '0.9rem', marginBottom: 6 }}>Owner Approval Required</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-700)', margin: 0 }}>This is a Hybrid Booking System. Your request will be sent to the owner first. You will only pay the amount once the owner approves your booking request.</p>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem', color: 'var(--gray-600)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <li>✅ Minimum stay duration is 1 month</li>
                <li>✅ 1 month deposit is fully refundable</li>
                <li>✅ Uploading ID Proof (Aadhaar/PAN) is mandatory</li>
                <li>✅ No parties or loud music after 10 PM</li>
                <li>✅ 15 days notice period required before leaving</li>
              </ul>
            </div>

            <div className="card" style={{ padding: 32 }}>
              <h3 style={{ marginBottom: 20 }}>Your Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input readOnly value={user?.name || ''} className="form-input bg-gray-100" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input readOnly value={user?.email || ''} className="form-input bg-gray-100" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input type="text" className="form-input" placeholder="+91 XXXXXXX" />
                </div>
                <div className="form-group">
                  <label className="form-label">Move-in Date</label>
                  <input type="date" className="form-input" value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Move-out Date</label>
                  <input type="date" className="form-input" value={moveOutDate} onChange={(e) => setMoveOutDate(e.target.value)} min={moveInDate || undefined} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">Upload Government ID (Required for Security)</label>
                <input type="file" className="form-input" />
                <small style={{ color: 'var(--gray-500)', fontSize: '0.75rem' }}>Aadhaar or Passport strongly recommended</small>
              </div>
            </div>
          </div>

          {/* Right Side - Summary */}
          <div>
            <div className="card" style={{ padding: 32, position: 'sticky', top: 100 }}>
              <div style={{ display: 'flex', gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--gray-200)' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: 4 }}>{property.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{property.city}</p>
                  <div className="badge badge-primary mt-2">{property.type}</div>
                </div>
              </div>

              <h3 style={{ fontSize: '1.2rem', marginBottom: 20 }}>Price Breakdown</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-600)' }}>Monthly Rent</span>
                  <span style={{ fontWeight: 600 }}>₹{property.price.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-600)' }}>Security Deposit (Refundable)</span>
                  <span style={{ fontWeight: 600 }}>₹{property.deposit.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-600)' }}>Platform Fee + GST</span>
                  <span style={{ fontWeight: 600 }}>₹{gst.toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px dashed var(--gray-300)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--gray-900)' }}>
                  <span>Total Due</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              <div style={{ margin: '24px 0', fontSize: '0.85rem', color: 'var(--gray-600)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <input type="checkbox" id="agree" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 4 }} />
                <label htmlFor="agree">I agree to the House Rules, Cancellation Policy, and StayZone Terms of Service.</label>
              </div>

              <button
                className="btn btn-primary btn-lg" style={{ width: '100%' }}
                onClick={handlePayment} disabled={loading}
              >
                {loading ? 'Processing...' : 'Send Booking Request'}
              </button>

              <div style={{ textAlign: 'center', marginTop: 16, fontSize: '0.8rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <span>🔒</span> Safe & secure Hybrid System
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
