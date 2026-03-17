import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { propertyAPI } from '../services/api';
import property1 from '../assets/property1.png';
import './PropertyListing.css';

export default function PropertyListing() {
  const [searchParams] = useSearchParams();
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [budget, setBudget] = useState(searchParams.get('budget') || '');
  const [sort, setSort] = useState('price-low');
  const [wishlist, setWishlist] = useState([]);
  
  const [allFetchedProperties, setAllFetchedProperties] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProps = async () => {
      setLoading(true);
      try {
        const res = await propertyAPI.getAll();
        setAllFetchedProperties(res.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchProps();
  }, []);

  useEffect(() => {
    let result = [...allFetchedProperties];

    if (city) {
      result = result.filter(p => (p.city || '').toLowerCase().includes(city.toLowerCase()) || (p.title || '').toLowerCase().includes(city.toLowerCase()));
    }
    if (type) {
      result = result.filter(p => p.type === type);
    }
    if (budget) {
      const [min, max] = budget.split('-').map(Number);
      if (max) {
        result = result.filter(p => p.price >= min && p.price <= max);
      } else if (min) {
        result = result.filter(p => p.price >= 20000);
      }
    }

    if (sort === 'price-low') result.sort((a, b) => a.price - b.price);
    else if (sort === 'price-high') result.sort((a, b) => b.price - a.price);

    setFiltered(result);
  }, [city, type, budget, sort, allFetchedProperties]);

  const toggleWishlist = (id) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]);
  };

  return (
    <div className="listing-page">
      <div className="container">
        <div className="listing-header">
          <h1>Find Your Perfect Stay</h1>
          <p>Browse through our verified properties across India</p>
        </div>

        <div className="filters-bar">
          <div className="filter-group">
            <label>City</label>
            <input type="text" placeholder="Search city..." value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="filter-group">
            <label>Property Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">All Types</option>
              <option value="PG">PG</option>
              <option value="Apartment">Apartment</option>
              <option value="Flat">Flat</option>
              <option value="Independent House">Independent House</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Budget</label>
            <select value={budget} onChange={(e) => setBudget(e.target.value)}>
              <option value="">Any Budget</option>
              <option value="0-5000">Under ₹5,000</option>
              <option value="5000-10000">₹5,000 – ₹10,000</option>
              <option value="10000-20000">₹10,000 – ₹20,000</option>
              <option value="20000+">₹20,000+</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Sort By</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
            </select>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => { setCity(''); setType(''); setBudget(''); }}>
            ↻ Reset
          </button>
        </div>

        <div className="listing-count">
          {loading ? 'Loading properties...' : <>Showing <strong>{filtered.length}</strong> properties</>}
        </div>

        <div className="listing-grid">
          {loading ? (
             <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>Loading...</div>
          ) : filtered.length > 0 ? (
            filtered.map((p) => (
              <Link to={`/properties/${p.id}`} key={p.id} className="property-card">
                <div className="property-card-img-wrapper">
                  <img src={property1} alt={p.title} />
                  <div className="property-card-badge">{p.availableRooms > 0 ? 'Available' : 'Occupied'}</div>
                  <button
                    className={`property-card-wishlist ${wishlist.includes(p.id) ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); toggleWishlist(p.id); }}
                  >
                    {wishlist.includes(p.id) ? '❤️' : '🤍'}
                  </button>
                </div>
                <div className="property-card-body">
                  <div className="property-card-type">{p.type}</div>
                  <div className="property-card-title">{p.title}</div>
                  <div className="property-card-location">📍 {p.city}</div>
                  <div className="property-card-amenities">
                    <span className="property-card-amenity">🚪 {p.totalRooms} Rooms</span>
                    <span className="property-card-amenity">✨ {p.availableRooms} Available</span>
                  </div>
                  <div className="property-card-bottom">
                    <div className="property-card-price">₹{p.price.toLocaleString()}<small>/month</small></div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="listing-empty">
              <div style={{ fontSize: '3rem' }}>🏠</div>
              <h3>No properties found</h3>
              <p>We don't have any properties that match your filters right now.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

