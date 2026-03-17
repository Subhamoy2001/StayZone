import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { propertyAPI, bookingAPI, uploadAPI } from '../services/api';

export default function OwnerDashboard() {
  const { user, isAuthenticated, isOwner } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [properties, setProperties] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingTenantId, setViewingTenantId] = useState(null); // { tenantName, imageUrl }

  useEffect(() => {
    if (isAuthenticated && isOwner) {
      fetchData();
    }
  }, [isAuthenticated, isOwner]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const propRes = await propertyAPI.getMyProperties();
      setProperties(propRes.data);
      
      const bookRes = await bookingAPI.getOwnerRequests();
      setBookingRequests(bookRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleApprove = async (id) => {
    try {
      await bookingAPI.approve(id);
      alert('Booking Approved!');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to approve booking');
    }
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    try {
      await propertyAPI.delete(id);
      alert('Property deleted successfully.');
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete property');
    }
  };

  const handleViewTenantId = async (tenantId, tenantName) => {
    try {
      const res = await uploadAPI.getGovId(tenantId);
      if (res.data.documentUrl) {
        setViewingTenantId({ tenantName, imageUrl: res.data.documentUrl });
      } else {
        alert('This tenant has not uploaded a Government ID.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to fetch tenant Government ID.');
    }
  };

  if (!isAuthenticated || !isOwner) {
    return (
      <div className="container" style={{ padding: '120px 20px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>Please log in as an Owner to view this page.</p>
        <button className="btn btn-primary mt-4" onClick={() => navigate('/login')}>Login Now</button>
      </div>
    );
  }

  // Derived stats
  const totalProperties = properties.length;
  const totalRooms = properties.reduce((sum, p) => sum + (p.totalRooms || 0), 0);
  const availableRooms = properties.reduce((sum, p) => sum + (p.availableRooms || 0), 0);
  const earnings = bookingRequests.filter(b => b.status === 'APPROVED').reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return (
    <div style={{ padding: '120px 0 80px', background: 'var(--gray-50)', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: 1100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }} className="animate-fade-in-down">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-orange)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {user?.name?.charAt(0)}
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: 4 }}>Owner Dashboard</h1>
              <p style={{ color: 'var(--gray-500)' }}>Welcome back, {user?.name}</p>
            </div>
          </div>
          <Link to="/add-property" className="btn btn-primary">➕ Add Property</Link>
        </div>

        {/* Top Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 32 }} className="animate-fade-in">
          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 600 }}>Total Properties</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gray-900)', margin: '8px 0' }}>{totalProperties}</div>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 600 }}>Total Rooms</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-blue)', margin: '8px 0' }}>{totalRooms}</div>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 600 }}>Available Rooms</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)', margin: '8px 0' }}>{availableRooms}</div>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 600 }}>Earnings (Approved)</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-orange)', margin: '8px 0' }}>₹{earnings}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }} className="animate-fade-in">
          <div className="card" style={{ width: 250, padding: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                style={{ padding: '12px 16px', textAlign: 'left', borderRadius: 'var(--radius-sm)', transition: 'all 0.2s', background: activeTab === 'overview' ? 'var(--primary-blue-50)' : 'transparent', color: activeTab === 'overview' ? 'var(--primary-blue)' : 'var(--gray-700)', fontWeight: activeTab === 'overview' ? 600 : 500 }}
                onClick={() => setActiveTab('overview')}>📊 Overview</button>
              <button
                style={{ padding: '12px 16px', textAlign: 'left', borderRadius: 'var(--radius-sm)', transition: 'all 0.2s', background: activeTab === 'properties' ? 'var(--primary-blue-50)' : 'transparent', color: activeTab === 'properties' ? 'var(--primary-blue)' : 'var(--gray-700)', fontWeight: activeTab === 'properties' ? 600 : 500 }}
                onClick={() => setActiveTab('properties')}>🏠 My Properties</button>
              <button
                style={{ padding: '12px 16px', textAlign: 'left', borderRadius: 'var(--radius-sm)', transition: 'all 0.2s', background: activeTab === 'requests' ? 'var(--primary-blue-50)' : 'transparent', color: activeTab === 'requests' ? 'var(--primary-blue)' : 'var(--gray-700)', fontWeight: activeTab === 'requests' ? 600 : 500 }}
                onClick={() => setActiveTab('requests')}>🔔 Booking Requests</button>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            {(activeTab === 'overview' || activeTab === 'requests') && (
              <div className="card animate-slide-up" style={{ padding: 32 }}>
                <h3 style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--gray-200)' }}>Booking Requests (Hybrid System)</h3>
                <div style={{ overflowX: 'auto' }}>
                  {loading ? <p>Loading...</p> : bookingRequests.length === 0 ? <p>No booking requests yet.</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ background: 'var(--gray-50)', color: 'var(--gray-500)', textAlign: 'left' }}>
                          <th style={{ padding: 16, borderBottom: '1px solid var(--gray-200)' }}>ID</th>
                          <th style={{ padding: 16, borderBottom: '1px solid var(--gray-200)' }}>Tenant</th>
                          <th style={{ padding: 16, borderBottom: '1px solid var(--gray-200)' }}>Property & Date</th>
                          <th style={{ padding: 16, borderBottom: '1px solid var(--gray-200)' }}>Tenant ID</th>
                          <th style={{ padding: 16, borderBottom: '1px solid var(--gray-200)' }}>Status</th>
                          <th style={{ padding: 16, borderBottom: '1px solid var(--gray-200)' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookingRequests.map(r => (
                          <tr key={r.id}>
                            <td style={{ padding: '16px', borderBottom: '1px solid var(--gray-100)' }}>{r.id}</td>
                            <td style={{ padding: '16px', borderBottom: '1px solid var(--gray-100)', fontWeight: 600 }}>
                              {r.user?.name || 'Unknown'}<br/>
                              <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 400 }}>{r.user?.email}</span>
                            </td>
                            <td style={{ padding: '16px', borderBottom: '1px solid var(--gray-100)' }}>{r.property?.title}<br/><span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>📅 {r.moveInDate} → {r.moveOutDate}</span></td>
                            <td style={{ padding: '16px', borderBottom: '1px solid var(--gray-100)' }}>
                              <button
                                onClick={() => handleViewTenantId(r.user?.id, r.user?.name)}
                                className="btn btn-sm"
                                style={{ background: 'var(--primary-blue)', color: '#fff', padding: '6px 12px', fontSize: '0.8rem' }}>
                                🪪 View ID
                              </button>
                            </td>
                            <td style={{ padding: '16px', borderBottom: '1px solid var(--gray-100)' }}>
                              <span className={`badge ${r.status === 'PENDING' ? 'badge-warning' : 'badge-success'}`}>{r.status}</span>
                            </td>
                            <td style={{ padding: '16px', borderBottom: '1px solid var(--gray-100)' }}>
                              {r.status === 'PENDING' ? (
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button onClick={() => handleApprove(r.id)} className="btn btn-sm" style={{ background: 'var(--success)', color: '#fff' }}>Approve</button>
                                </div>
                              ) : (
                                <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>Processed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'properties' && (
              <div className="card animate-slide-up" style={{ padding: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--gray-200)' }}>
                  <h3>My Properties</h3>
                  <Link to="/add-property" className="btn btn-primary btn-sm">Add New</Link>
                </div>
                <p style={{ color: 'var(--gray-500)' }}>Manage your listed properties and room availability here.</p>
                {loading ? <p>Loading...</p> : properties.length === 0 ? <p>No properties listed.</p> : properties.map(p => (
                  <div key={p.id} style={{ border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: 16, marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      {p.images && p.images.length > 0 && (
                        <img src={p.images[0]} alt={p.title} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                      )}
                      <div>
                        <h4 style={{ marginBottom: 4 }}>{p.title}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', margin: 0 }}>📍 {p.city} • <span style={{ color: p.isApproved ? 'var(--success)' : 'var(--warning)', fontWeight: 600 }}>
                          {p.isApproved ? 'Approved by Admin' : 'Pending Admin Approval'}
                        </span></p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', margin: '4px 0 0' }}>{p.availableRooms} Rooms Available / {p.totalRooms} Total Rooms</p>
                      </div>
                    </div>
                    {!p.isApproved && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/edit-property/${p.id}`} className="btn btn-secondary btn-sm">Edit</Link>
                        <button onClick={() => handleDeleteProperty(p.id)} className="btn btn-sm" style={{ background: '#dc2626', color: '#fff' }}>Delete</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tenant Government ID Modal */}
      {viewingTenantId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999
        }} onClick={() => setViewingTenantId(null)}>
          <div style={{
            background: '#fff', borderRadius: 'var(--radius-lg)', padding: 32, maxWidth: 500, width: '90%',
            textAlign: 'center'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 8 }}>🪪 Tenant Government ID</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: 16 }}>Tenant: {viewingTenantId.tenantName}</p>
            <img
              src={viewingTenantId.imageUrl}
              alt="Government ID"
              style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 'var(--radius-md)', border: '2px solid var(--gray-200)' }}
            />
            <div style={{ marginTop: 20 }}>
              <button className="btn btn-primary" onClick={() => setViewingTenantId(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
