import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CropCard from '../components/CropCard';
import LoadingSpinner from '../components/LoadingSpinner';
import StarRating from '../components/StarRating';
import VerifiedBadge from '../components/VerifiedBadge';
import { HiOutlineMapPin, HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';

export default function Favorites() {
  const { api, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [favoriteCrops, setFavoriteCrops] = useState([]);
  const [favoriteFarmers, setFavoriteFarmers] = useState([]);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/me/favorites');
      setFavoriteCrops(res.data.favoriteCrops || []);
      setFavoriteFarmers(res.data.favoriteFarmers || []);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Favorites</h1>
          <p className="page-subtitle">Your saved crops and farmers for quick reorder and reconnect.</p>
        </div>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Saved Crops ({favoriteCrops.length})</h2>
          {favoriteCrops.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🌱</div>
              <h3>No favorite crops yet</h3>
              <p>Save crops from the crop details page.</p>
              <Link to="/marketplace" className="btn btn-primary">Browse Marketplace</Link>
            </div>
          ) : (
            <div className="grid grid-3 stagger-children" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {favoriteCrops.map((crop) => (
                <CropCard key={crop._id} crop={crop} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 style={{ marginBottom: '1rem' }}>Saved Farmers ({favoriteFarmers.length})</h2>
          {favoriteFarmers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🧑‍🌾</div>
              <h3>No favorite farmers yet</h3>
              <p>Save farmers directly from crop detail pages.</p>
            </div>
          ) : (
            <div className="grid stagger-children" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {favoriteFarmers.map((farmer) => (
                <div key={farmer._id} className="card">
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div className="navbar-avatar" style={{ width: 48, height: 48 }}>
                      {farmer.name?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                        {farmer.name}
                        {farmer.isVerified && <VerifiedBadge size={14} />}
                      </div>
                      {farmer.averageRating > 0 && (
                        <StarRating rating={farmer.averageRating} readonly size={14} showValue />
                      )}
                    </div>
                  </div>

                  {farmer.bio && (
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                      {farmer.bio.length > 90 ? `${farmer.bio.substring(0, 90)}...` : farmer.bio}
                    </p>
                  )}

                  {(farmer.address?.city || farmer.address?.state) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem', color: 'var(--color-text-muted)' }}>
                      <HiOutlineMapPin />
                      {[farmer.address?.city, farmer.address?.state].filter(Boolean).join(', ')}
                    </div>
                  )}

                  {user?._id !== farmer._id && (
                    <Link to={`/messages?user=${farmer._id}`} className="btn btn-secondary" style={{ width: '100%' }}>
                      <HiOutlineChatBubbleLeftRight /> Message Farmer
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
