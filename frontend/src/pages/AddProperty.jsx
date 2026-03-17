import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { propertyAPI } from '../services/api';

export default function AddProperty() {
  const { isAuthenticated, isOwner } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [existingImages, setExistingImages] = useState([]); // Base64 strings from DB
  const [newImagePreviews, setNewImagePreviews] = useState([]); // { name, base64 }

  const [formData, setFormData] = useState({
    title: '', type: 'PG', description: '',
    city: '', address: '', mapLink: '',
    price: '', deposit: '',
    totalRooms: '', availableRooms: '',
    amenities: [],
  });

  const amenitiesList = [
    'WiFi', 'AC', 'TV', 'Meals', 'Laundry', 'Housekeeping',
    'Parking', 'Power Backup', 'Geyser', 'Security', 'Gym'
  ];

  useEffect(() => {
    if (id) {
      const fetchProperty = async () => {
        try {
          const res = await propertyAPI.getById(id);
          const data = res.data;
          setFormData({
            title: data.title, type: data.type, description: data.description,
            city: data.city, address: data.address, mapLink: data.mapLink,
            price: data.price, deposit: data.deposit,
            totalRooms: data.totalRooms, availableRooms: data.availableRooms,
            amenities: data.amenities || [],
          });
          setExistingImages(data.images || []);
        } catch (error) {
          console.error('Failed to load property', error);
          alert('Failed to load property details.');
        }
      };
      fetchProperty();
    }
  }, [id]);

  if (!isAuthenticated || !isOwner) {
    return (
      <div className="container" style={{ padding: '120px 20px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>Only verified property owners can add listings.</p>
        <button className="btn btn-primary mt-4" onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  const handleToggleAmenity = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      const base64 = await fileToBase64(file);
      setNewImagePreviews(prev => [...prev, { name: file.name, base64 }]);
    }
    e.target.value = ''; // reset input
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    const allImages = [...existingImages, ...newImagePreviews.map(img => img.base64)];
    if (!id && allImages.length === 0) {
      alert('Please upload at least one photo.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        type: formData.type,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        price: parseFloat(formData.price),
        deposit: parseFloat(formData.deposit),
        totalRooms: parseInt(formData.totalRooms, 10),
        availableRooms: parseInt(formData.totalRooms, 10),
        mapLink: formData.mapLink,
        amenities: formData.amenities,
        images: allImages
      };
      
      if (id) {
        await propertyAPI.update(id, payload);
        alert('Property updated successfully!');
      } else {
        await propertyAPI.create(payload);
        alert('Property listed successfully! Waiting for Admin verification.');
      }
      
      navigate('/owner-dashboard');
    } catch (error) {
      console.error(error);
      alert((id ? 'Failed to update property. ' : 'Failed to list property. ') + (error.response?.data?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const renderStepIcon = (num, label) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: step >= num ? 1 : 0.4 }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: step >= num ? 'var(--primary-blue)' : 'var(--gray-200)',
        color: step >= num ? '#fff' : 'var(--gray-500)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 'bold', marginBottom: '8px'
      }}>
        {num}
      </div>
      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{label}</span>
      {num < 3 && (
        <div style={{
          position: 'absolute', height: 2, background: step > num ? 'var(--primary-blue)' : 'var(--gray-200)',
          width: '100px', transform: 'translateX(70px) translateY(-30px)'
        }} />
      )}
    </div>
  );

  const imgThumbStyle = {
    width: 100, height: 100, objectFit: 'cover', borderRadius: 'var(--radius-md)',
    border: '2px solid var(--gray-200)',
  };

  return (
    <div style={{ padding: '120px 0 80px', background: 'var(--gray-50)', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }} className="animate-fade-in-down">
          <h1 style={{ fontFamily: 'var(--font-display)' }}>{id ? 'Edit Your Property' : 'List Your Property'}</h1>
          <p style={{ color: 'var(--gray-500)' }}>{id ? 'Update the details of your property' : 'Fill in the details to publish your space on StayZone'}</p>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', marginBottom: 40,
          position: 'relative', padding: '0 40px'
        }} className="animate-fade-in">
          {renderStepIcon(1, 'Basic Info')}
          {renderStepIcon(2, 'Features')}
          {renderStepIcon(3, 'Photos')}
        </div>

        <div className="card animate-slide-up" style={{ padding: 40 }}>
          <form onSubmit={handleSubmit}>

            {step === 1 && (
              <div>
                <h3 style={{ marginBottom: 24 }}>Basic Information</h3>
                <div className="form-group">
                  <label className="form-label">Property Title *</label>
                  <input required
                    className="form-input" placeholder="e.g. Sunshine Premium PG"
                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div className="form-group">
                    <label className="form-label">Property Type *</label>
                    <select className="form-select" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                      <option value="PG">PG</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Flat">Flat</option>
                      <option value="Independent House">Independent House</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input required className="form-input" placeholder="e.g. Bangalore"
                      value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Full Address *</label>
                  <textarea required className="form-input" rows="3" placeholder="Enter full address"
                    value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea required className="form-input" rows="4" placeholder="Describe your property..."
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 style={{ marginBottom: 24 }}>Pricing & Features</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div className="form-group">
                    <label className="form-label">Monthly Rent (₹) *</label>
                    <input type="number" required className="form-input" placeholder="e.g. 10000"
                      value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Security Deposit (₹) *</label>
                    <input type="number" required className="form-input" placeholder="e.g. 20000"
                      value={formData.deposit} onChange={e => setFormData({...formData, deposit: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Rooms *</label>
                    <input type="number" required className="form-input" placeholder="e.g. 10"
                      value={formData.totalRooms} onChange={e => setFormData({...formData, totalRooms: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Google Maps Link *</label>
                    <input type="url" required className="form-input" placeholder="https://maps.google.com/..."
                      value={formData.mapLink} onChange={e => setFormData({...formData, mapLink: e.target.value})} />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: 16 }}>
                  <label className="form-label">Amenities</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 12 }}>
                    {amenitiesList.map(item => (
                      <div key={item} style={{
                        padding: '10px 16px', border: `2px solid ${formData.amenities.includes(item) ? 'var(--primary-blue)' : 'var(--gray-200)'}`,
                        borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '0.9rem',
                        background: formData.amenities.includes(item) ? 'var(--primary-blue-50)' : '#fff',
                        transition: 'all 0.2s', textAlign: 'center', fontWeight: formData.amenities.includes(item) ? 600 : 400,
                        color: formData.amenities.includes(item) ? 'var(--primary-blue)' : 'var(--gray-700)'
                      }} onClick={() => handleToggleAmenity(item)}>
                        {formData.amenities.includes(item) && '✓ '} {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h3 style={{ marginBottom: 24 }}>Upload Photos</h3>

                {/* Existing images (edit mode) */}
                {existingImages.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: 12 }}>Current Photos ({existingImages.length}):</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                      {existingImages.map((img, idx) => (
                        <div key={`existing-${idx}`} style={{ position: 'relative' }}>
                          <img src={img} alt={`Property ${idx + 1}`} style={imgThumbStyle} />
                          <button type="button" onClick={() => removeExistingImage(idx)} style={{
                            position: 'absolute', top: -8, right: -8,
                            width: 24, height: 24, borderRadius: '50%',
                            background: '#dc2626', color: '#fff', border: 'none',
                            cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload area */}
                <div style={{
                  border: '2px dashed var(--gray-300)', borderRadius: 'var(--radius-lg)',
                  padding: '40px 20px', textAlign: 'center', background: 'var(--gray-50)'
                }}>
                  <div style={{ fontSize: '3rem', margin: '0 0 16px', color: 'var(--primary-blue)' }}>📸</div>
                  <h4 style={{ marginBottom: 8, color: 'var(--gray-800)' }}>Click to upload or drag and drop</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>SVG, PNG, JPG or GIF (max. 5MB)</p>
                  <label htmlFor="file-upload" className="btn btn-secondary mt-4" style={{ cursor: 'pointer', display: 'inline-block' }}>
                    Select Files
                  </label>
                  <input id="file-upload" type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                </div>

                {/* Newly selected images */}
                {newImagePreviews.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: 12 }}>New Photos ({newImagePreviews.length}):</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                      {newImagePreviews.map((img, idx) => (
                        <div key={`new-${idx}`} style={{ position: 'relative' }}>
                          <img src={img.base64} alt={img.name} style={imgThumbStyle} />
                          <button type="button" onClick={() => removeNewImage(idx)} style={{
                            position: 'absolute', top: -8, right: -8,
                            width: 24, height: 24, borderRadius: '50%',
                            background: '#dc2626', color: '#fff', border: 'none',
                            cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>✕</button>
                          <p style={{ fontSize: '0.7rem', color: 'var(--gray-500)', textAlign: 'center', marginTop: 4, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 16, textAlign: 'center' }}>
                  {id ? 'You can delete old photos and add new ones.' : 'A complete listing requires at least 1 photo.'}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--gray-200)' }}>
              {step > 1 ? (
                <button type="button" className="btn btn-ghost" onClick={() => setStep(step - 1)}>
                  ← Back
                </button>
              ) : <div></div>}

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '⏳ Processing...' : step === 3 ? (id ? '✅ Update Listing' : '✅ Submit Listing') : 'Next Step →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
