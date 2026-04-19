import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import StarRating from '../components/StarRating';
import VerifiedBadge from '../components/VerifiedBadge';
import ReviewCard from '../components/ReviewCard';
import { HiOutlineUser, HiOutlineEnvelope, HiOutlinePhone, HiOutlineMapPin } from 'react-icons/hi2';

export default function Profile() {
  const { user, updateProfile, api } = useAuth();
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || ''
  });

  useEffect(() => {
    if (user) {
      fetchReviews();
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      const [reviewsRes, statsRes] = await Promise.all([
        api.get(`/reviews/user/${user._id}`),
        api.get(`/reviews/stats/${user._id}`)
      ]);
      setReviews(reviewsRes.data);
      setRatingStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    try {
      const { street, city, state, pincode, ...rest } = formData;
      await updateProfile({
        ...rest,
        address: { street, city, state, pincode }
      });
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await api.put('/users/verify');
      alert(res.data.message);
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  if (!user) return null;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '700px' }}>
        <div className="page-header">
          <h1 className="page-title">👤 {t('profile')}</h1>
        </div>

        <div className="card animate-slide-up" style={{ padding: '2.5rem' }}>
          {/* Profile Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--color-border)' }}>
            <div className="navbar-avatar" style={{ width: 80, height: 80, fontSize: '2rem' }}>
              {user.name?.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem' }}>{user.name}</h2>
                {user.isVerified && <VerifiedBadge size={20} showText />}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <span className="badge badge-primary">{user.role === 'farmer' ? '🧑‍🌾 Farmer' : '🛒 Buyer'}</span>
                {ratingStats && ratingStats.totalReviews > 0 && (
                  <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ⭐ {ratingStats.averageRating.toFixed(1)} ({ratingStats.totalReviews} reviews)
                  </span>
                )}
              </div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                {t('memberSince')} {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Verification Banner */}
          {!user.isVerified && (
            <div style={{
              padding: '1rem 1.5rem',
              background: 'rgba(76,201,240,0.08)',
              border: '1px solid rgba(76,201,240,0.2)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <div>
                <div style={{ fontWeight: 600 }}>🛡️ {t('getVerified')}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Complete your profile to get a verified badge
                </div>
              </div>
              <button className="btn btn-sm btn-primary" onClick={handleVerify} disabled={verifying}>
                {verifying ? 'Checking...' : t('getVerified')}
              </button>
            </div>
          )}

          {/* Quick Links */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <Link to="/wallet" className="btn btn-sm btn-secondary">💳 {t('wallet')}</Link>
            {user.role === 'farmer' && (
              <>
                <Link to="/analytics" className="btn btn-sm btn-secondary">📈 {t('analytics')}</Link>
                <Link to="/recommendations" className="btn btn-sm btn-secondary">🌱 Recommendations</Link>
              </>
            )}
            <Link to="/preorders" className="btn btn-sm btn-secondary">📅 Pre-Orders</Link>
          </div>

          {success && (
            <div style={{
              padding: '0.75rem 1rem',
              background: 'rgba(82,183,136,0.1)',
              border: '1px solid rgba(82,183,136,0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-success)',
              marginBottom: '1.5rem'
            }}>
              ✅ {success}
            </div>
          )}

          {editing ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label"><HiOutlineUser style={{verticalAlign:'middle'}} /> Name</label>
                <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label"><HiOutlinePhone style={{verticalAlign:'middle'}} /> Phone</label>
                <input type="tel" name="phone" className="form-input" value={formData.phone} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea name="bio" className="form-input" value={formData.bio} onChange={handleChange} placeholder="Tell us about yourself..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input type="text" name="city" className="form-input" value={formData.city} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input type="text" name="state" className="form-input" value={formData.state} onChange={handleChange} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Street</label>
                  <input type="text" name="street" className="form-input" value={formData.street} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input type="text" name="pincode" className="form-input" value={formData.pincode} onChange={handleChange} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : `💾 ${t('saveChanges')}`}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>{t('cancel')}</button>
              </div>
            </form>
          ) : (
            <div>
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <HiOutlineEnvelope style={{ color: 'var(--color-primary-light)' }} />
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Email</div>
                    <div>{user.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <HiOutlinePhone style={{ color: 'var(--color-primary-light)' }} />
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Phone</div>
                    <div>{user.phone || 'Not set'}</div>
                  </div>
                </div>
                {user.bio && (
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Bio</div>
                    <div style={{ color: 'var(--color-text-secondary)' }}>{user.bio}</div>
                  </div>
                )}
                {user.address && (user.address.city || user.address.state) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <HiOutlineMapPin style={{ color: 'var(--color-primary-light)' }} />
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Address</div>
                      <div>{[user.address.street, user.address.city, user.address.state, user.address.pincode].filter(Boolean).join(', ')}</div>
                    </div>
                  </div>
                )}
              </div>
              <button className="btn btn-primary" style={{ marginTop: '2rem' }} onClick={() => setEditing(true)} id="edit-profile-btn">
                ✏️ {t('editProfile')}
              </button>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="card" style={{ marginTop: '1.5rem', padding: '2rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>
              ⭐ {t('reviews')} ({reviews.length})
            </h3>

            {/* Rating Distribution */}
            {ratingStats && (
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--color-accent-light)' }}>
                    {ratingStats.averageRating.toFixed(1)}
                  </div>
                  <StarRating rating={ratingStats.averageRating} readonly size={16} />
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                    {ratingStats.totalReviews} reviews
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = ratingStats.distribution[star] || 0;
                    const percentage = ratingStats.totalReviews > 0 ? (count / ratingStats.totalReviews) * 100 : 0;
                    return (
                      <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.8rem', minWidth: '15px' }}>{star}⭐</span>
                        <div style={{ flex: 1, height: '6px', background: 'var(--color-surface)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${percentage}%`, background: 'var(--color-accent-light)', borderRadius: 'var(--radius-full)' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', minWidth: '20px' }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gap: '1rem' }}>
              {reviews.map(review => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
