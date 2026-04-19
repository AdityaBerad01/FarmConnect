import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import VerifiedBadge from '../components/VerifiedBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { HiOutlineMapPin, HiOutlineMagnifyingGlass } from 'react-icons/hi2';

export default function NearbySearch() {
  const { api } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('farmer');
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [coords, setCoords] = useState({ lat: 18.5204, lng: 73.8567 });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [role, coords.lat, coords.lng]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('lat', coords.lat);
      params.append('lng', coords.lng);
      params.append('role', role);
      params.append('radius', '100');
      params.append('limit', '30');

      const res = await api.get(`/users/nearby?${params.toString()}`);
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.address?.city?.toLowerCase().includes(search.toLowerCase());
    const matchesCity = city
      ? u.address?.city?.toLowerCase().includes(city.toLowerCase())
      : true;
    return matchesSearch && matchesCity;
  });

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">📍 Nearby Search</h1>
          <p className="page-subtitle">Find farmers and buyers near your location</p>
        </div>

        {/* Controls */}
        <div className="filter-bar" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className={`btn btn-sm ${role === 'farmer' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setRole('farmer')}
            >
              🧑‍🌾 Farmers
            </button>
            <button
              className={`btn btn-sm ${role === 'buyer' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setRole('buyer')}
            >
              🛒 Buyers
            </button>
          </div>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: 1, maxWidth: '500px' }}>
            <div className="search-wrapper" style={{ flex: 1 }}>
              <HiOutlineMagnifyingGlass className="search-icon" />
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <input
              type="text"
              className="form-input"
              placeholder="City..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={{ maxWidth: '150px' }}
            />
            <button type="submit" className="btn btn-primary btn-sm">Search</button>
          </form>
        </div>

        {/* Map placeholder */}
        <div className="card" style={{
          height: '250px',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, rgba(45,106,79,0.1), rgba(76,201,240,0.05))',
          border: '2px dashed var(--color-border-light)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🗺️</div>
          <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '0.25rem' }}>Map View</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            Showing {filteredUsers.length} {role}s in your area
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {filteredUsers.slice(0, 5).map((u, i) => (
              <span key={i} className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                📍 {u.address?.city || 'Unknown'}
              </span>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <LoadingSpinner />
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No {role}s Found</h3>
            <p>Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="grid stagger-children" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {filteredUsers.map(u => (
              <div key={u._id} className="card" style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <div className="navbar-avatar" style={{ width: 50, height: 50, fontSize: '1.2rem', flexShrink: 0 }}>
                    {u.name?.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{u.name}</span>
                      {u.isVerified && <VerifiedBadge size={14} />}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      {u.role === 'farmer' ? '🧑‍🌾 Farmer' : '🛒 Buyer'}
                    </div>
                  </div>
                </div>

                {u.averageRating > 0 && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <StarRating rating={u.averageRating} readonly size={14} showValue />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '4px' }}>
                      ({u.totalReviews} reviews)
                    </span>
                  </div>
                )}

                {u.bio && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                    {u.bio.length > 80 ? u.bio.substring(0, 80) + '...' : u.bio}
                  </p>
                )}

                {(u.address?.city || u.address?.state) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    <HiOutlineMapPin />
                    {[u.address.city, u.address.state].filter(Boolean).join(', ')}
                  </div>
                )}

                {typeof u.distanceKm === 'number' && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                    Distance: {u.distanceKm} km
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link to={`/messages?user=${u._id}`} className="btn btn-sm btn-primary" style={{ flex: 1 }}>
                    💬 Message
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
