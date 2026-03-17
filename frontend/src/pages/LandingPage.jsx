import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import property1 from '../assets/property1.png';
import property2 from '../assets/property2.png';
import property3 from '../assets/property3.png';
import './LandingPage.css';

/* ── Intersection Observer hook ── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible');
        });
      },
      { threshold: 0.15 }
    );
    const els = ref.current?.querySelectorAll('.reveal');
    els?.forEach((el) => observer.observe(el));
    return () => els?.forEach((el) => observer.unobserve(el));
  }, []);
  return ref;
}

/* ── Animated Counter ── */
function Counter({ end, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const duration = 2000;
          const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

import { propertyAPI } from '../services/api';

/* ── Sample Data ── */
const testimonials = [
  {
    name: 'Priya Sharma', role: 'Student, Bangalore',
    text: 'StayZone made finding a PG super easy! The verified listings gave me confidence, and the booking process was seamless. Highly recommended!',
    rating: 5, initials: 'PS',
  },
  {
    name: 'Rahul Mehta', role: 'IT Professional, Pune',
    text: 'As a property owner, StayZone has been a game-changer. The dashboard analytics help me manage everything and the booking flow is brilliant.',
    rating: 5, initials: 'RM',
  },
  {
    name: 'Ananya Gupta', role: 'Working Professional, Mumbai',
    text: 'I love the smart search filters! Found my dream apartment in just 2 days. The owner verification system makes it trustworthy.',
    rating: 4, initials: 'AG',
  },
];

export default function LandingPage() {
  const [searchCity, setSearchCity] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchBudget, setSearchBudget] = useState('');
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const navigate = useNavigate();
  const revealRef = useReveal();

  useEffect(() => {
    const fetchProps = async () => {
      try {
        const res = await propertyAPI.getAll();
        // take up to 3
        setFeaturedProperties(res.data.slice(0, 3));
      } catch (err) {
        console.error('Failed to load featured properties', err);
      }
    };
    fetchProps();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity) params.set('city', searchCity);
    if (searchType) params.set('type', searchType);
    if (searchBudget) params.set('budget', searchBudget);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div ref={revealRef}>
      {/* ── Hero Section ── */}
      <section className="hero">
        <div className="hero-blob-1"></div>
        <div className="hero-blob-2"></div>
        <div className="container hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              🏆 #1 Smart Rental Platform in India
            </div>

            <h1 className="hero-title">
              Find Your Perfect{' '}
              <span className="highlight">
                <span className="highlight-blue">Stay</span>
                <span className="underline-decoration"></span>
              </span>{' '}
              With{' '}
              <span className="highlight-orange">Confidence</span>
            </h1>

            <p className="hero-subtitle">
              Discover verified PGs, apartments & rooms across India. Book with owner approval,
              transparent pricing, and zero brokerage. Your next home is just a click away.
            </p>

            <div className="hero-buttons">
              <Link to="/properties" className="btn btn-primary btn-lg">
                🔍 Explore Properties
              </Link>
              <Link to="/register" className="btn btn-secondary btn-lg">
                List Your Property →
              </Link>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-number"><Counter end={5000} suffix="+" /></div>
                <div className="hero-stat-label">Verified Properties</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-number"><Counter end={12000} suffix="+" /></div>
                <div className="hero-stat-label">Happy Tenants</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-number"><Counter end={50} /><span>+</span></div>
                <div className="hero-stat-label">Cities Covered</div>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-float-card hero-float-card-1">
              <div className="float-icon">✅</div>
              <div className="float-text">Owner Verified</div>
              <div className="float-subtext">100% Genuine</div>
            </div>
            <div className="hero-float-card hero-float-card-2">
              <div className="float-icon">🛡️</div>
              <div className="float-text">Secure Booking</div>
              <div className="float-subtext">Razorpay Protected</div>
            </div>

            <div className="hero-card-main">
              <img src={property1} alt="Premium PG" className="hero-card-img" />
              <div className="hero-card-body">
                <div className="hero-card-title">Sunshine Premium PG</div>
                <div className="hero-card-location">📍 Koramangala, Bangalore</div>
                <div className="hero-card-tags">
                  <span className="hero-card-tag">WiFi</span>
                  <span className="hero-card-tag">AC</span>
                  <span className="hero-card-tag">Meals</span>
                  <span className="hero-card-tag">Laundry</span>
                </div>
                <div className="hero-card-footer">
                  <div className="hero-card-price">₹8,500<small>/month</small></div>
                  <div className="hero-card-rating">⭐ 4.8 (42)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Search Bar ── */}
      <section className="search-section">
        <div className="container">
          <form className="search-bar" onSubmit={handleSearch}>
            <div className="search-bar-field">
              <label>City</label>
              <input
                type="text"
                placeholder="Bangalore, Pune, Mumbai..."
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
              />
            </div>
            <div className="search-bar-field">
              <label>Property Type</label>
              <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                <option value="">All Types</option>
                <option value="PG">PG</option>
                <option value="Apartment">Apartment</option>
                <option value="Flat">Flat</option>
                <option value="Independent House">Independent House</option>
              </select>
            </div>
            <div className="search-bar-field">
              <label>Budget</label>
              <select value={searchBudget} onChange={(e) => setSearchBudget(e.target.value)}>
                <option value="">Any Budget</option>
                <option value="0-5000">Under ₹5,000</option>
                <option value="5000-10000">₹5,000 – ₹10,000</option>
                <option value="10000-20000">₹10,000 – ₹20,000</option>
                <option value="20000+">₹20,000+</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">🔍 Search</button>
          </form>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features-section">
        <div className="container">
          <div className="section-header reveal">
            <p className="section-subtitle">Why StayZone?</p>
            <h2>Everything You Need in One Platform</h2>
            <p>From verified listings to secure bookings, we've got every aspect of your rental journey covered.</p>
          </div>

          <div className="features-grid">
            {[
              { icon: '🛡️', title: 'Verified Properties', desc: 'Every property owner undergoes document verification. Aadhaar, PAN, and ownership proofs checked by our admin team.', color: 'blue' },
              { icon: '⚡', title: 'Instant Booking', desc: 'No brokers, no delays. Send booking requests directly to owners and get instant approvals.', color: 'orange' },
              { icon: '🔍', title: 'Smart Search', desc: 'Filter by city, budget, room type, amenities and more. Find your perfect match in seconds.', color: 'green' },
              { icon: '💳', title: 'Secure Payments', desc: 'Pay safely with Razorpay integration. Transparent pricing with zero hidden charges.', color: 'blue' },
              { icon: '⭐', title: 'Ratings & Reviews', desc: 'Real reviews from real tenants. Make informed decisions based on genuine experiences.', color: 'orange' },
              { icon: '📊', title: 'Owner Dashboard', desc: 'Property owners get powerful analytics, booking management, and earnings insights all in one place.', color: 'green' },
            ].map((f, i) => (
              <div key={i} className="feature-card reveal" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={`feature-icon ${f.color}`}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header reveal">
            <p className="section-subtitle">How It Works</p>
            <h2>Book Your Stay in 4 Simple Steps</h2>
            <p>Our hybrid booking system ensures both safety and convenience.</p>
          </div>

          <div className="steps-container">
            {[
              { num: '01', icon: '📝', title: 'Sign Up', desc: 'Create your account with document verification for safety.' },
              { num: '02', icon: '🔍', title: 'Search & Filter', desc: 'Browse properties with smart filters to find the right match.' },
              { num: '03', icon: '📩', title: 'Request Booking', desc: 'Send a booking request directly to the property owner.' },
              { num: '04', icon: '✅', title: 'Get Approved', desc: 'Owner approves your request, pay securely and move in!' },
            ].map((s, i) => (
              <div key={i} className="step-card reveal" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="step-number">{s.num}</div>
                <div className="step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Properties ── */}
      <section className="properties-section">
        <div className="container">
          <div className="section-header reveal">
            <p className="section-subtitle">Featured Listings</p>
            <h2>Handpicked Properties For You</h2>
            <p>Explore our top-rated, verified properties across India's top cities.</p>
          </div>

          <div className="properties-grid">
            {featuredProperties.map((p, i) => (
              <Link to={`/properties/${p.id}`} key={p.id} className="property-card reveal" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="property-card-img-wrapper">
                  <img src={property1} alt={p.title} />
                  <div className="property-card-badge">{i === 0 ? 'Featured' : 'Verified'}</div>
                  <button className="property-card-wishlist" onClick={(e) => { e.preventDefault(); }}>🤍</button>
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
                    <div className="property-card-price">₹{p.price}<small>/month</small></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/properties" className="btn btn-primary btn-lg">
              View All Properties →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Banner ── */}
      <section className="stats-banner">
        <div className="container">
          <div className="stats-grid">
            <div className="stats-item reveal">
              <h3><span className="blue"><Counter end={5000} />+</span></h3>
              <p>Properties Listed</p>
            </div>
            <div className="stats-item reveal">
              <h3><span className="orange"><Counter end={12000} />+</span></h3>
              <p>Happy Tenants</p>
            </div>
            <div className="stats-item reveal">
              <h3><span className="blue"><Counter end={800} />+</span></h3>
              <p>Verified Owners</p>
            </div>
            <div className="stats-item reveal">
              <h3><span className="orange"><Counter end={50} />+</span></h3>
              <p>Cities Covered</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header reveal">
            <p className="section-subtitle">Testimonials</p>
            <h2>Loved by Thousands</h2>
            <p>See what our users and property owners have to say about StayZone.</p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card reveal" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="testimonial-stars">
                  {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
                </div>
                <p className="testimonial-text">{t.text}</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.initials}</div>
                  <div className="testimonial-author-info">
                    <h4>{t.name}</h4>
                    <p>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card reveal">
            <h2>Ready to Find Your Perfect Stay?</h2>
            <p>Join thousands of happy tenants and trusted property owners on India's smartest rental platform.</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-white btn-lg">Get Started Free →</Link>
              <Link to="/properties" className="btn btn-outline-white btn-lg">Browse Properties</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
