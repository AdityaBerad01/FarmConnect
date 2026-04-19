import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import StarRating from '../components/StarRating';
import VerifiedBadge from '../components/VerifiedBadge';
import ReviewCard from '../components/ReviewCard';
import { HiOutlineMapPin, HiOutlineCalendar, HiOutlineChatBubbleLeftRight, HiOutlineShoppingCart } from 'react-icons/hi2';

const categoryEmojis = {
  vegetables: '🥬', fruits: '🍎', grains: '🌾',
  pulses: '🫘', spices: '🌶️', dairy: '🥛', other: '📦'
};

export default function CropDetail() {
  const { id } = useParams();
  const { user, api, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderQty, setOrderQty] = useState(1);
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState(null);
  const [address, setAddress] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || ''
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [upiId, setUpiId] = useState('');
  const [preOrderData, setPreOrderData] = useState({ quantity: 10, unit: 'kg', expectedDate: '', notes: '' });
  const [showPreOrder, setShowPreOrder] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    fetchCrop();
  }, [id]);

  const fetchCrop = async () => {
    try {
      const res = await api.get(`/crops/${id}`);
      setCrop(res.data);
      // Fetch farmer reviews
      if (res.data.farmer?._id) {
        const [reviewsRes, statsRes] = await Promise.all([
          api.get(`/reviews/user/${res.data.farmer._id}`),
          api.get(`/reviews/stats/${res.data.farmer._id}`)
        ]);
        setReviews(reviewsRes.data);
        setRatingStats(statsRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch crop:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async () => {
    if (!user) { navigate('/login'); return; }
    if (!address.street || !address.city || !address.state || !address.pincode) {
      alert('Please fill in all address fields'); return;
    }
    if (paymentMethod === 'UPI' && !upiId) {
      alert('Please provide your UPI ID'); return;
    }

    setOrdering(true);
    try {
      await api.post('/orders', {
        cropId: crop._id,
        quantity: orderQty,
        shippingAddress: address,
        paymentMethod,
        upiId: paymentMethod === 'UPI' ? upiId : undefined
      });
      setOrderSuccess(true);
      fetchCrop();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order');
    } finally {
      setOrdering(false);
    }
  };

  const handlePreOrder = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await api.post('/preorders', {
        farmerId: crop.farmer._id,
        cropId: crop._id,
        cropName: crop.title,
        quantity: preOrderData.quantity,
        unit: preOrderData.unit || crop.unit,
        lockedPrice: crop.price,
        expectedDate: preOrderData.expectedDate,
        notes: preOrderData.notes
      });
      alert('Pre-order request sent to farmer! ✅');
      setShowPreOrder(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create pre-order');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!crop) return (
    <div className="page"><div className="container"><div className="empty-state">
      <div className="empty-state-icon">😕</div>
      <h3>Crop Not Found</h3>
      <Link to="/marketplace" className="btn btn-primary">Back to Marketplace</Link>
    </div></div></div>
  );

  const emoji = categoryEmojis[crop.category] || '🌱';
  const isCropFavorite = user?.favoriteCrops?.includes(crop?._id);
  const isFarmerFavorite = user?.favoriteFarmers?.includes(crop?.farmer?._id);

  const toggleFavoriteCrop = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setFavoriteLoading(true);
      await api.put(`/users/favorites/crops/${crop._id}`);
      await refreshUser();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update favorite crop');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const toggleFavoriteFarmer = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!crop?.farmer?._id) return;
    try {
      setFavoriteLoading(true);
      await api.put(`/users/favorites/farmers/${crop.farmer._id}`);
      await refreshUser();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update favorite farmer');
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/marketplace" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            ← Back to Marketplace
          </Link>
        </div>

        <div className="crop-detail animate-fade-in">
          {/* Image */}
          <div>
            <div className="crop-detail-image">
              {crop.images && crop.images.length > 0 ? (
                <div>
                  <img src={crop.images[0]} alt={crop.title} />
                  {crop.images.length > 1 && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', overflowX: 'auto' }}>
                      {crop.images.slice(1).map((img, i) => (
                        <img key={i} src={img} alt={`${crop.title} ${i + 2}`}
                          style={{ width: 60, height: 60, borderRadius: 'var(--radius-md)', objectFit: 'cover', border: '2px solid var(--color-border)' }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="crop-placeholder-img" style={{ fontSize: '5rem' }}>{emoji}</div>
              )}
            </div>
            
            {/* Description */}
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '0.75rem' }}>Description</h3>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                {crop.description}
              </p>
            </div>

            {/* Quality Details */}
            {(crop.qualityGrade || crop.qualityDetails) && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '0.75rem' }}>Quality Information</h3>
                <div className="card" style={{ background: 'rgba(45,106,79,0.05)' }}>
                  {crop.qualityGrade && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span className="badge badge-info" style={{ fontSize: '0.85rem' }}>
                        🏆 Grade {crop.qualityGrade} {crop.qualityGrade === 'A' ? '(Premium)' : crop.qualityGrade === 'B' ? '(Standard)' : '(Economy)'}
                      </span>
                    </div>
                  )}
                  {crop.qualityDetails && (
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{crop.qualityDetails}</p>
                  )}
                </div>
              </div>
            )}

            {/* Farmer Reviews */}
            {reviews.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>
                  ⭐ Farmer Reviews ({reviews.length})
                </h3>
                {ratingStats && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <StarRating rating={ratingStats.averageRating} readonly size={18} showValue />
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      ({ratingStats.totalReviews} total reviews)
                    </span>
                  </div>
                )}
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {reviews.slice(0, 5).map(review => (
                    <ReviewCard key={review._id} review={review} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Info Sidebar */}
          <div className="crop-detail-info">
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span className="badge badge-primary">{emoji} {crop.category}</span>
              {crop.isOrganic && <span className="badge badge-success">🌿 Organic</span>}
              <span className={`badge ${crop.status === 'available' ? 'badge-success' : 'badge-error'}`}>
                {crop.status}
              </span>
              {crop.qualityGrade && <span className="badge badge-info">Grade {crop.qualityGrade}</span>}
              {crop.season && <span className="badge badge-warning">{crop.season}</span>}
            </div>

            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              {crop.title}
            </h1>

            {user && (
              <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}>
                <button className="btn btn-sm btn-secondary" onClick={toggleFavoriteCrop} disabled={favoriteLoading}>
                  {isCropFavorite ? '❤️ Saved Crop' : '🤍 Save Crop'}
                </button>
                {crop?.farmer?._id && user._id !== crop.farmer._id && (
                  <button className="btn btn-sm btn-secondary" onClick={toggleFavoriteFarmer} disabled={favoriteLoading}>
                    {isFarmerFavorite ? '⭐ Saved Farmer' : '☆ Save Farmer'}
                  </button>
                )}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              <HiOutlineMapPin /> {crop.location?.city}, {crop.location?.state}
            </div>

            <div style={{
              fontSize: '2.5rem',
              fontFamily: 'var(--font-heading)',
              fontWeight: 900,
              color: 'var(--color-primary-light)',
              marginBottom: '1.5rem'
            }}>
              ₹{crop.price} <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--color-text-muted)' }}>per {crop.unit}</span>
            </div>

            {/* Meta Grid */}
            <div className="crop-detail-meta">
              <div className="crop-meta-item">
                <div className="crop-meta-label">Available</div>
                <div className="crop-meta-value">{crop.quantity} {crop.unit}</div>
              </div>
              <div className="crop-meta-item">
                <div className="crop-meta-label">Unit</div>
                <div className="crop-meta-value" style={{ textTransform: 'capitalize' }}>{crop.unit}</div>
              </div>
              {crop.harvestDate && (
                <div className="crop-meta-item">
                  <div className="crop-meta-label">Harvest Date</div>
                  <div className="crop-meta-value">
                    <HiOutlineCalendar style={{ verticalAlign: 'middle' }} /> {new Date(crop.harvestDate).toLocaleDateString()}
                  </div>
                </div>
              )}
              <div className="crop-meta-item">
                <div className="crop-meta-label">Type</div>
                <div className="crop-meta-value">{crop.isOrganic ? '🌿 Organic' : 'Conventional'}</div>
              </div>
            </div>

            {/* Order Section */}
            {crop.status === 'available' && user?.role !== 'farmer' && (
              <div className="card" style={{ marginTop: '1.5rem', background: 'rgba(45,106,79,0.08)' }}>
                {orderSuccess ? (
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
                    <h3 style={{ color: 'var(--color-success)', marginBottom: '0.5rem' }}>Order Placed!</h3>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>Check your dashboard for details.</p>
                    <Link to="/dashboard" className="btn btn-primary btn-sm">Go to Dashboard</Link>
                  </div>
                ) : (
                  <>
                    <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>🛒 Place Order</h3>
                    
                    <div className="form-group">
                      <label className="form-label">Quantity ({crop.unit})</label>
                      <input type="number" className="form-input" min="1" max={crop.quantity}
                        value={orderQty} onChange={(e) => setOrderQty(Number(e.target.value))} id="order-quantity"
                      />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--color-text-secondary)' }}>Shipping Address</h4>
                      <div className="form-group">
                        <input type="text" placeholder="Street Address" className="form-input" value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div className="form-group">
                          <input type="text" placeholder="City" className="form-input" value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <input type="text" placeholder="State" className="form-input" value={address.state} onChange={(e) => setAddress({...address, state: e.target.value})} />
                        </div>
                      </div>
                      <div className="form-group">
                        <input type="text" placeholder="Pincode" className="form-input" value={address.pincode} onChange={(e) => setAddress({...address, pincode: e.target.value})} />
                      </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--color-text-secondary)' }}>Payment Method</h4>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {['COD', 'UPI', 'wallet'].map(method => (
                          <label key={method} style={{ flex: 1, cursor: 'pointer' }}>
                            <input type="radio" name="payment" value={method} checked={paymentMethod === method}
                              onChange={() => setPaymentMethod(method)} style={{ display: 'none' }}
                            />
                            <div style={{
                              padding: '0.75rem', borderRadius: 'var(--radius-md)',
                              border: `2px solid ${paymentMethod === method ? 'var(--color-primary)' : 'var(--color-border)'}`,
                              background: paymentMethod === method ? 'rgba(74,157,117,0.1)' : 'var(--color-surface)',
                              textAlign: 'center', transition: 'all 0.2s', fontSize: '0.85rem'
                            }}>
                              {method === 'COD' ? '💵 COD' : method === 'UPI' ? '📱 UPI' : '💳 Wallet'}
                            </div>
                          </label>
                        ))}
                      </div>

                      {paymentMethod === 'UPI' && (
                        <div className="form-group" style={{ marginTop: '0.75rem' }}>
                          <input type="text" placeholder="Enter your UPI ID (e.g. user@bank)" className="form-input"
                            value={upiId} onChange={(e) => setUpiId(e.target.value)}
                          />
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', padding: '0.75rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Total Amount</span>
                      <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-primary-light)' }}>₹{(crop.price * orderQty).toLocaleString()}</span>
                    </div>
                    
                    <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleOrder} disabled={ordering} id="place-order-btn">
                      <HiOutlineShoppingCart /> {ordering ? 'Placing Order...' : 'Confirm & Place Order'}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Pre-order section */}
            {crop.preOrderAvailable && user?.role === 'buyer' && (
              <div className="card" style={{ marginTop: '1rem' }}>
                {!showPreOrder ? (
                  <button className="btn btn-accent" style={{ width: '100%' }} onClick={() => setShowPreOrder(true)}>
                    📅 Pre-Order This Crop
                  </button>
                ) : (
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>📅 Pre-Order</h3>
                    <div className="form-group">
                      <label className="form-label">Quantity</label>
                      <input type="number" className="form-input" min="1" value={preOrderData.quantity} onChange={e => setPreOrderData({...preOrderData, quantity: Number(e.target.value)})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Expected Date</label>
                      <input type="date" className="form-input" value={preOrderData.expectedDate} onChange={e => setPreOrderData({...preOrderData, expectedDate: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Notes (optional)</label>
                      <textarea className="form-input" placeholder="Any special requirements..." value={preOrderData.notes} onChange={e => setPreOrderData({...preOrderData, notes: e.target.value})} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', padding: '0.75rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Locked Price</span>
                      <span style={{ fontWeight: 800, color: 'var(--color-primary-light)' }}>₹{crop.price}/{crop.unit}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button className="btn btn-primary" style={{ flex: 1 }} onClick={handlePreOrder}>Submit Pre-Order</button>
                      <button className="btn btn-secondary" onClick={() => setShowPreOrder(false)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Farmer Info */}
            {crop.farmer && (
              <div className="card" style={{ marginTop: '1.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>🧑‍🌾 Farmer</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="navbar-avatar" style={{ width: 48, height: 48, fontSize: '1.1rem' }}>
                    {crop.farmer.name?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {crop.farmer.name}
                      {crop.farmer.isVerified && <VerifiedBadge size={16} />}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      Member since {new Date(crop.farmer.createdAt).toLocaleDateString()}
                    </div>
                    {crop.farmer.averageRating > 0 && (
                      <div style={{ marginTop: '0.25rem' }}>
                        <StarRating rating={crop.farmer.averageRating} readonly size={14} showValue />
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          ({crop.farmer.totalReviews} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {crop.farmer.bio && (
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>{crop.farmer.bio}</p>
                )}
                {user && user._id !== crop.farmer._id && (
                  <Link to={`/messages?user=${crop.farmer._id}`} className="btn btn-secondary" style={{ width: '100%' }}>
                    <HiOutlineChatBubbleLeftRight /> Message Farmer
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
