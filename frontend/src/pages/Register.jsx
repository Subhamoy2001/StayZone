import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, uploadAPI } from '../services/api';
import './Auth.css';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'USER',
  });
  const [govIdFile, setGovIdFile] = useState(null);
  const [govIdPreview, setGovIdPreview] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGovIdSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGovIdFile(file);
      const reader = new FileReader();
      reader.onload = () => setGovIdPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (formData.role === 'OWNER' && !govIdPreview) {
      setError('Government ID is required for Owner registration.');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      // Include govt ID in registration payload
      if (govIdPreview) {
        registerData.documentUrl = govIdPreview;
      }
      const res = await authAPI.register(registerData);
      
      const userObj = { id: res.data.id, name: res.data.name, email: res.data.email, role: res.data.role };
      login(userObj, res.data.token);
      
      const role = res.data.role;
      navigate(role === 'ADMIN' ? '/admin' : role === 'OWNER' ? '/owner-dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">
            <Link to="/">Stay<span>zone</span></Link>
          </div>
          <div className="auth-header">
            <h1>Create Account</h1>
            <p>Join StayZone today</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div className="role-selector">
              {[
                { role: 'USER', icon: '👤', label: 'Tenant' },
                { role: 'OWNER', icon: '🏠', label: 'Owner' },
              ].map((r) => (
                <div
                  key={r.role}
                  className={`role-option ${formData.role === r.role ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, role: r.role })}
                >
                  <div className="role-icon">{r.icon}</div>
                  <div className="role-label">{r.label}</div>
                </div>
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text" name="name" className="form-input"
                placeholder="Enter your full name"
                value={formData.name} onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email" name="email" className="form-input"
                placeholder="you@example.com"
                value={formData.email} onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel" name="phone" className="form-input"
                placeholder="+91 XXXXX XXXXX"
                value={formData.phone} onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password" className="form-input"
                  placeholder="Min. 6 characters"
                  value={formData.password} onChange={handleChange}
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password" name="confirmPassword" className="form-input"
                placeholder="Re-enter password"
                value={formData.confirmPassword} onChange={handleChange}
              />
            </div>

            {/* Government ID upload for Owner role */}
            {formData.role === 'OWNER' && (
              <div className="form-group" style={{ background: 'var(--primary-blue-50)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-blue-200)' }}>
                <label className="form-label" style={{ color: 'var(--primary-blue)' }}>🪪 Government ID (Required for Owners) *</label>
                <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: 12 }}>Upload your Aadhaar, PAN, Voter ID, or Passport for verification</p>
                <label htmlFor="gov-id-upload" className="btn btn-secondary" style={{ cursor: 'pointer', display: 'inline-block', fontSize: '0.85rem' }}>
                  📎 Select ID Document
                </label>
                <input id="gov-id-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleGovIdSelect} />
                {govIdPreview && (
                  <div style={{ marginTop: 12, textAlign: 'center' }}>
                    <img src={govIdPreview} alt="Government ID Preview" style={{ maxWidth: '100%', maxHeight: 150, borderRadius: 'var(--radius-md)', border: '2px solid var(--gray-200)' }} />
                    <p style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: 6 }}>✅ {govIdFile?.name}</p>
                  </div>
                )}
              </div>
            )}

            {/* Government ID upload for Tenant role */}
            {formData.role === 'USER' && (
              <div className="form-group" style={{ background: '#f0fdf4', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0' }}>
                <label className="form-label" style={{ color: '#16a34a' }}>🪪 Government ID (Recommended for Tenants)</label>
                <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: 12 }}>Upload Aadhaar, PAN, etc. so owners can verify your identity</p>
                <label htmlFor="gov-id-upload" className="btn btn-secondary" style={{ cursor: 'pointer', display: 'inline-block', fontSize: '0.85rem' }}>
                  📎 Select ID Document
                </label>
                <input id="gov-id-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleGovIdSelect} />
                {govIdPreview && (
                  <div style={{ marginTop: 12, textAlign: 'center' }}>
                    <img src={govIdPreview} alt="Government ID Preview" style={{ maxWidth: '100%', maxHeight: 150, borderRadius: 'var(--radius-md)', border: '2px solid var(--gray-200)' }} />
                    <p style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: 6 }}>✅ {govIdFile?.name}</p>
                  </div>
                )}
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '⏳ Creating account...' : '🚀 Create Account'}
            </button>
          </form>

          <div className="auth-divider">or</div>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Log In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
