import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { adminAPI, uploadAPI } from '../services/api';

export default function AdminDashboard() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingProperties, setPendingProperties] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingGovId, setViewingGovId] = useState(null); // { ownerId, imageUrl, ownerName }
  const [viewedOwnerIds, setViewedOwnerIds] = useState(new Set()); // track which owner IDs have been viewed

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchData();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await adminAPI.getPendingProperties();
        setPendingProperties(res.data);
      } else if (activeTab === 'users') {
        const res = await adminAPI.getUsers();
        setUsersList(res.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleViewOwnerGovId = async (ownerId, ownerName) => {
    try {
      const res = await uploadAPI.getGovId(ownerId);
      if (res.data.documentUrl) {
        setViewingGovId({ ownerId, imageUrl: res.data.documentUrl, ownerName });
        setViewedOwnerIds(prev => new Set([...prev, ownerId]));
      } else {
        alert('This owner has not uploaded a Government ID yet.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to fetch Government ID.');
    }
  };

  const handleApproveProperty = async (id) => {
    try {
      await adminAPI.approveProperty(id);
      alert('Property Approved!');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to approve property');
    }
  };

  const handleDeleteUser = async (id, name, email) => {
    if (user.id === id) {
      alert("You cannot delete yourself!");
      return;
    }
    if (window.confirm(`Are you sure you want to delete user "${name}" (${email})? This will also delete all their properties.`)) {
      try {
        await adminAPI.deleteUser(id);
        alert('User deleted successfully.');
        fetchData();
      } catch (err) {
        console.error(err);
        alert('Failed to delete user.');
      }
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="container" style={{ padding: '120px 20px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>This area is restricted to System Administrators only.</p>
        <button className="btn btn-primary mt-4" onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  const stats = { users: usersList.length || 0, pendingDocs: pendingProperties.length || 0 };

  return (
    <div style={{ padding: '120px 0 80px', background: 'var(--gray-900)', color: 'var(--white)', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: 1100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }} className="animate-fade-in-down">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: 4, color: 'var(--primary-blue-200)' }}>Super Admin Console</h1>
            <p style={{ color: 'var(--gray-400)' }}>Platform Health & Integrity Management</p>
          </div>
          <div className="badge" style={{ background: 'var(--error-light)', color: '#dc2626' }}>System: Online</div>
        </div>

        {/* Top Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 32 }} className="animate-fade-in">
          {[
            { label: 'Total Users (Loaded)', val: stats.users, color: 'var(--primary-blue-400)' },
            { label: 'Pending Approvals', val: stats.pendingDocs, color: 'var(--warning)', alert: true }
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--gray-800)', border: '1px solid var(--gray-700)', padding: 24, borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', textTransform: 'uppercase', fontWeight: 600 }}>
                {s.label} {s.alert && '🔴'}
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color, margin: '8px 0' }}>{s.val}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }} className="animate-fade-in">
          <div style={{ background: 'var(--gray-800)', border: '1px solid var(--gray-700)', borderRadius: 'var(--radius-lg)', width: 250, padding: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                style={{ padding: '12px 16px', textAlign: 'left', borderRadius: 'var(--radius-sm)', transition: 'all 0.2s', background: activeTab === 'overview' ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeTab === 'overview' ? '#fff' : 'var(--gray-400)', fontWeight: activeTab === 'overview' ? 600 : 500, border: 'none' }}
                onClick={() => setActiveTab('overview')}>🛡️ Verification Queue</button>
              <button
                style={{ padding: '12px 16px', textAlign: 'left', borderRadius: 'var(--radius-sm)', transition: 'all 0.2s', background: activeTab === 'users' ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeTab === 'users' ? '#fff' : 'var(--gray-400)', fontWeight: activeTab === 'users' ? 600 : 500, border: 'none' }}
                onClick={() => setActiveTab('users')}>👥 User Management</button>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            {activeTab === 'overview' && (
              <div style={{ background: 'var(--gray-800)', border: '1px solid var(--gray-700)', borderRadius: 'var(--radius-lg)', padding: 32 }}>
                <h3 style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--gray-700)', color: '#fff' }}>Pending Property Approvals</h3>
                <p style={{ color: 'var(--gray-400)', marginBottom: 24 }}>Review properties submitted by owners. You must view the owner's Government ID before approving.</p>
                
                {loading ? <p>Loading...</p> : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--gray-900)', color: 'var(--gray-500)', textAlign: 'left' }}>
                        <th style={{ padding: 16, borderBottom: '1px solid var(--gray-700)' }}>Property ID</th>
                        <th style={{ padding: 16, borderBottom: '1px solid var(--gray-700)' }}>Owner</th>
                        <th style={{ padding: 16, borderBottom: '1px solid var(--gray-700)' }}>Title / City</th>
                        <th style={{ padding: 16, borderBottom: '1px solid var(--gray-700)' }}>Owner ID</th>
                        <th style={{ padding: 16, borderBottom: '1px solid var(--gray-700)' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingProperties.length === 0 ? (
                        <tr><td colSpan="5" style={{ padding: 16, textAlign: 'center', color: 'var(--gray-400)' }}>No pending properties</td></tr>
                      ) : pendingProperties.map(p => (
                        <tr key={p.id}>
                          <td style={{ padding: '16px', borderBottom: '1px solid var(--gray-700)', color: 'var(--gray-300)' }}>{p.id}</td>
                          <td style={{ padding: '16px', borderBottom: '1px solid var(--gray-700)', fontWeight: 600, color: '#fff' }}>
                            {p.owner?.name || `ID: ${p.owner?.id}`}<br/>
                            <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{p.owner?.email}</span>
                          </td>
                          <td style={{ padding: '16px', borderBottom: '1px solid var(--gray-700)', color: 'var(--primary-blue-200)' }}>
                            {p.title} <br/><span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{p.city}</span>
                          </td>
                          <td style={{ padding: '16px', borderBottom: '1px solid var(--gray-700)' }}>
                            <button
                              onClick={() => handleViewOwnerGovId(p.owner?.id, p.owner?.name)}
                              className="btn btn-sm"
                              style={{
                                background: viewedOwnerIds.has(p.owner?.id) ? 'var(--success)' : 'var(--warning)',
                                color: '#fff', padding: '6px 12px', fontSize: '0.8rem'
                              }}>
                              {viewedOwnerIds.has(p.owner?.id) ? '✅ Viewed' : '🪪 View ID'}
                            </button>
                          </td>
                          <td style={{ padding: '16px', borderBottom: '1px solid var(--gray-700)' }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button
                                onClick={() => handleApproveProperty(p.id)}
                                className="btn btn-sm"
                                disabled={!viewedOwnerIds.has(p.owner?.id)}
                                style={{
                                  background: viewedOwnerIds.has(p.owner?.id) ? 'var(--success)' : 'var(--gray-600)',
                                  color: '#fff', padding: '6px 12px',
                                  cursor: viewedOwnerIds.has(p.owner?.id) ? 'pointer' : 'not-allowed',
                                  opacity: viewedOwnerIds.has(p.owner?.id) ? 1 : 0.5
                                }}>
                                Approve Property
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
            
            {activeTab === 'users' && (
              <div style={{ background: 'var(--gray-800)', border: '1px solid var(--gray-700)', borderRadius: 'var(--radius-lg)', padding: 32 }}>
                <h3 style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--gray-700)', color: '#fff' }}>Manage Accounts</h3>
                <p style={{ color: 'var(--gray-400)', marginBottom: 24 }}>System Users.</p>
                {loading ? <p>Loading...</p> : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--gray-900)', color: 'var(--gray-500)', textAlign: 'left' }}>
                        <th style={{ padding: 16, borderBottom: '1px solid var(--gray-700)' }}>ID</th>
                        <th style={{ padding: 16, borderBottom: '1px solid var(--gray-700)' }}>Name</th>
                         <th style={{ padding: 16, borderBottom: '1px solid var(--gray-700)' }}>Email</th>
                        <th style={{ padding: 16, borderBottom: '1px solid var(--gray-700)' }}>Role</th>
                        <th style={{ padding: 16, borderBottom: '1px solid var(--gray-700)' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map(u => (
                        <tr key={u.id}>
                          <td style={{ padding: '16px', borderBottom: '1px solid var(--gray-700)', color: 'var(--gray-300)' }}>{u.id}</td>
                          <td style={{ padding: '16px', borderBottom: '1px solid var(--gray-700)', fontWeight: 600, color: '#fff' }}>{u.name}</td>
                          <td style={{ padding: '16px', borderBottom: '1px solid var(--gray-700)' }}>{u.email}</td>
                          <td style={{ padding: '16px', borderBottom: '1px solid var(--gray-700)' }}>
                            <span className="badge" style={{ background: 'var(--gray-700)' }}>{u.role}</span>
                          </td>
                          <td style={{ padding: '16px', borderBottom: '1px solid var(--gray-700)' }}>
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name, u.email)}
                              className="btn btn-sm btn-error"
                              style={{ padding: '4px 8px', fontSize: '0.75rem', background: '#dc2626', color: '#fff', border: 'none' }}
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Government ID Modal */}
      {viewingGovId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999
        }} onClick={() => setViewingGovId(null)}>
          <div style={{
            background: '#fff', borderRadius: 'var(--radius-lg)', padding: 32, maxWidth: 500, width: '90%',
            textAlign: 'center'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 8, color: 'var(--gray-900)' }}>🪪 Government ID</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: 16 }}>Owner: {viewingGovId.ownerName}</p>
            <img
              src={viewingGovId.imageUrl}
              alt="Government ID"
              style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 'var(--radius-md)', border: '2px solid var(--gray-200)' }}
            />
            <div style={{ marginTop: 20 }}>
              <button className="btn btn-primary" onClick={() => setViewingGovId(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
