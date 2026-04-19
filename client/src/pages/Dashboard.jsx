import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LoadingSpinner from '../components/LoadingSpinner';
import StarRating from '../components/StarRating';
import { HiOutlinePlusCircle, HiOutlineShoppingBag, HiOutlineTruck, HiOutlineCheckCircle, HiOutlineClock, HiOutlineTrash, HiOutlineChartBar, HiOutlineCalendar } from 'react-icons/hi2';


const statusColors = {
  pending: 'badge-warning',
  confirmed: 'badge-info',
  shipped: 'badge-primary',
  delivered: 'badge-success',
  cancelled: 'badge-error'
};

const statusIcons = {
  pending: '⏳',
  confirmed: '✅',
  shipped: '🚚',
  delivered: '📦',
  cancelled: '❌'
};

export default function Dashboard() {
  const { user, api } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const ordersRes = await api.get('/orders');
      setOrders(ordersRes.data);

      if (user.role === 'farmer') {
        const cropsRes = await api.get('/crops/farmer/me');
        setCrops(cropsRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order');
    }
  };

  const deleteCrop = async (cropId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.delete(`/crops/${cropId}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete crop');
    }
  };

  const submitReview = async () => {
    if (!reviewModal) return;
    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        orderId: reviewModal._id,
        rating: reviewRating,
        comment: reviewComment
      });
      setReviewModal(null);
      setReviewRating(5);
      setReviewComment('');
      fetchData();
      alert('Review submitted successfully! ⭐');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const activeOrders = orders.filter(o => ['confirmed', 'shipped'].includes(o.status)).length;
  const completedOrders = orders.filter(o => o.status === 'delivered').length;
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  // Orders that can be reviewed
  const reviewableOrders = orders.filter(o =>
    o.status === 'delivered' &&
    ((user.role === 'buyer' && !o.buyerReviewed) || (user.role === 'farmer' && !o.farmerReviewed))
  );

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title" style={{ textAlign: 'left', marginBottom: '0.25rem' }}>
              {user.role === 'farmer' ? '🧑‍🌾' : '🛒'} {t('dashboard')}
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>{t('welcome')}, {user.name}!</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {user.role === 'farmer' && (
              <>
                <Link to="/add-crop" className="btn btn-primary" id="add-crop-btn">
                  <HiOutlinePlusCircle /> {t('addCrop')}
                </Link>
                <Link to="/analytics" className="btn btn-secondary">
                  <HiOutlineChartBar /> {t('analytics')}
                </Link>
              </>
            )}
            <Link to="/preorders" className="btn btn-secondary">
              <HiOutlineCalendar /> Pre-Orders
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="dashboard-stats animate-fade-in">
          <div className="stat-card">
            <div className="stat-card-label">
              <HiOutlineClock style={{ verticalAlign: 'middle' }} /> {t('pending')}
            </div>
            <div className="stat-card-value">{pendingOrders}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">
              <HiOutlineTruck style={{ verticalAlign: 'middle' }} /> {t('active')}
            </div>
            <div className="stat-card-value">{activeOrders}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">
              <HiOutlineCheckCircle style={{ verticalAlign: 'middle' }} /> {t('completed')}
            </div>
            <div className="stat-card-value">{completedOrders}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">💰 {user.role === 'farmer' ? t('revenue') : t('spent')}</div>
            <div className="stat-card-value">₹{totalRevenue.toLocaleString()}</div>
          </div>
        </div>


        {/* Review Prompt */}
        {reviewableOrders.length > 0 && (
          <div className="card animate-slide-up" style={{
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, rgba(244,162,97,0.1), rgba(231,111,81,0.05))',
            border: '1px solid rgba(244,162,97,0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.5rem' }}>⭐</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>You have {reviewableOrders.length} order(s) to review!</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Rate your experience to help the community
                </div>
              </div>
              <button className="btn btn-sm btn-accent" onClick={() => setReviewModal(reviewableOrders[0])}>
                Write Review
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('overview')}>
            📊 {t('orders')}
          </button>
          {user.role === 'farmer' && (
            <button className={`btn btn-sm ${activeTab === 'crops' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('crops')}>
              🌾 {t('myCrops')} ({crops.length})
            </button>
          )}
        </div>

        {/* Orders Tab */}
        {activeTab === 'overview' && (
          <div className="stagger-children">
            {orders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <h3>{t('noOrders')}</h3>
                <p>{user.role === 'buyer' ? 'Browse the marketplace to place your first order!' : 'Orders will appear here when buyers purchase your crops.'}</p>
                {user.role === 'buyer' && (
                  <Link to="/marketplace" className="btn btn-primary">
                    <HiOutlineShoppingBag /> {t('browseMarketplace')}
                  </Link>
                )}
              </div>
            ) : (
              orders.map(order => (
                <div key={order._id} className="order-card" id={`order-${order._id}`} style={{ marginBottom: '1rem' }}>
                  <div className="order-card-image">
                    <div className="crop-placeholder-img" style={{ fontSize: '1.8rem' }}>
                      {order.crop?.category ? (order.crop.category === 'vegetables' ? '🥬' : order.crop.category === 'fruits' ? '🍎' : '🌾') : '📦'}
                    </div>
                  </div>
                  <div className="order-card-details">
                    <h3>{order.crop?.title || 'Crop'}</h3>
                    <p>
                      Qty: {order.quantity} • Total: ₹{order.totalPrice.toLocaleString()} •{' '}
                      {user.role === 'farmer' ? `Buyer: ${order.buyer?.name}` : `Farmer: ${order.farmer?.name}`}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                        <span>{order.paymentMethod === 'UPI' ? '📱' : order.paymentMethod === 'wallet' ? '💳' : '💵'}</span>
                        <span style={{ fontWeight: 600 }}>{order.paymentMethod || 'COD'}</span>
                        {order.upiId && <span style={{ color: 'var(--color-text-muted)' }}>({order.upiId})</span>}
                      </div>
                      {order.shippingAddress && (
                        <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', lineHeight: '1.4' }}>
                          📍 {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="order-card-status">
                    <span className={`badge ${statusColors[order.status]}`}>
                      {statusIcons[order.status]} {order.status}
                    </span>
                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <Link to={`/order/${order._id}`} className="btn btn-sm btn-secondary">📦 Track</Link>
                      {user.role === 'farmer' && order.status === 'pending' && (
                        <button className="btn btn-sm btn-primary" onClick={() => updateOrderStatus(order._id, 'confirmed')}>Confirm</button>
                      )}
                      {user.role === 'farmer' && order.status === 'confirmed' && (
                        <button className="btn btn-sm btn-primary" onClick={() => updateOrderStatus(order._id, 'shipped')}>Ship</button>
                      )}
                      {user.role === 'farmer' && order.status === 'shipped' && (
                        <button className="btn btn-sm btn-primary" onClick={() => updateOrderStatus(order._id, 'delivered')}>Delivered</button>
                      )}
                      {user.role === 'buyer' && order.status === 'pending' && (
                        <button className="btn btn-sm btn-secondary" style={{ color: 'var(--color-error)' }} onClick={() => updateOrderStatus(order._id, 'cancelled')}>Cancel</button>
                      )}
                      {order.status === 'delivered' && (
                        ((user.role === 'buyer' && !order.buyerReviewed) || (user.role === 'farmer' && !order.farmerReviewed)) && (
                          <button className="btn btn-sm btn-accent" onClick={() => setReviewModal(order)}>⭐ Review</button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Crops Tab (Farmer Only) */}
        {activeTab === 'crops' && user.role === 'farmer' && (
          <div>
            {crops.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🌱</div>
                <h3>No Crops Listed</h3>
                <p>Start by adding your first crop listing.</p>
                <Link to="/add-crop" className="btn btn-primary">
                  <HiOutlinePlusCircle /> {t('addCrop')}
                </Link>
              </div>
            ) : (
              <div className="grid stagger-children" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {crops.map(crop => (
                  <div key={crop._id} className="card" style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <span className={`badge ${crop.status === 'available' ? 'badge-success' : 'badge-error'}`}>{crop.status}</span>
                        {crop.qualityGrade && <span className="badge badge-info" style={{ marginLeft: '0.25rem' }}>Grade {crop.qualityGrade}</span>}
                        <h3 style={{ fontFamily: 'var(--font-heading)', marginTop: '0.5rem' }}>{crop.title}</h3>
                      </div>
                      <button className="btn btn-sm" style={{ color: 'var(--color-error)' }} onClick={() => deleteCrop(crop._id)} title="Delete">
                        <HiOutlineTrash />
                      </button>
                    </div>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                      {crop.category} • {crop.quantity} {crop.unit} available
                    </p>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary-light)' }}>
                      ₹{crop.price}/{crop.unit}
                    </div>
                    <Link to={`/crop/${crop._id}`} className="btn btn-sm btn-secondary" style={{ marginTop: '1rem', width: '100%' }}>
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Review Modal */}
        {reviewModal && (
          <div className="modal-overlay" onClick={() => setReviewModal(null)}>
            <div className="modal-content animate-scale-in" onClick={e => e.stopPropagation()}>
              <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>⭐ {t('writeReview')}</h3>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                Rate your experience with {user.role === 'buyer' ? reviewModal.farmer?.name : reviewModal.buyer?.name} for "{reviewModal.crop?.title}"
              </p>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <StarRating rating={reviewRating} onRate={setReviewRating} size={32} />
              </div>
              <div className="form-group">
                <label className="form-label">Comment (optional)</label>
                <textarea
                  className="form-input"
                  placeholder="Share your experience..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows="3"
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-primary" onClick={submitReview} disabled={submittingReview} style={{ flex: 1 }}>
                  {submittingReview ? 'Submitting...' : `${t('submitReview')}`}
                </button>
                <button className="btn btn-secondary" onClick={() => setReviewModal(null)}>{t('cancel')}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
