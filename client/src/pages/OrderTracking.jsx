import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OrderTimeline from '../components/OrderTimeline';
import LoadingSpinner from '../components/LoadingSpinner';

export default function OrderTracking() {
  const { id } = useParams();
  const { api } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      console.error('Failed to fetch order:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!order) return (
    <div className="page"><div className="container"><div className="empty-state">
      <div className="empty-state-icon">😕</div>
      <h3>Order Not Found</h3>
      <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
    </div></div></div>
  );

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/dashboard" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            ← Back to Dashboard
          </Link>
        </div>

        <div className="page-header" style={{ textAlign: 'left' }}>
          <h1 className="page-title" style={{ fontSize: '2rem' }}>📦 Order Tracking</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            Order #{order._id.slice(-8).toUpperCase()} • {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Timeline */}
        <div className="card animate-fade-in" style={{ marginBottom: '1.5rem' }}>
          <OrderTimeline
            trackingHistory={order.trackingHistory || []}
            currentStatus={order.status}
          />
        </div>

        {/* Order Details */}
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Product Info */}
          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>🌾 Product Details</h3>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
              <div className="crop-placeholder-img" style={{ width: 60, height: 60, borderRadius: 'var(--radius-md)', fontSize: '1.5rem' }}>
                {order.crop?.category === 'vegetables' ? '🥬' : order.crop?.category === 'fruits' ? '🍎' : '🌾'}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{order.crop?.title}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  {order.quantity} × ₹{order.crop?.price}/{order.crop?.unit}
                </div>
              </div>
            </div>
            <div style={{
              padding: '1rem',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Total Amount</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary-light)' }}>
                ₹{order.totalPrice?.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>🚚 Delivery Info</h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Shipping Address</div>
                <div style={{ fontWeight: 500 }}>
                  {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Payment Method</div>
                <div style={{ fontWeight: 500 }}>
                  {order.paymentMethod === 'UPI' ? '📱 UPI' : order.paymentMethod === 'wallet' ? '💳 Wallet' : '💵 Cash on Delivery'}
                  {order.upiId && ` (${order.upiId})`}
                </div>
              </div>
              {order.estimatedDelivery && (
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Estimated Delivery</div>
                  <div style={{ fontWeight: 500, color: 'var(--color-primary-light)' }}>
                    📅 {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              )}
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Farmer</div>
                <div style={{ fontWeight: 500 }}>
                  🧑‍🌾 {order.farmer?.name} • {order.farmer?.phone || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tracking History */}
        {order.trackingHistory && order.trackingHistory.length > 0 && (
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>📋 Tracking History</h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {[...order.trackingHistory].reverse().map((entry, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '0.75rem',
                  background: i === 0 ? 'rgba(45,106,79,0.08)' : 'transparent',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: `3px solid ${i === 0 ? 'var(--color-primary)' : 'var(--color-border)'}`
                }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', minWidth: '120px' }}>
                    {new Date(entry.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{entry.status}</div>
                    {entry.note && <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{entry.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
          {order.farmer && (
            <Link to={`/messages?user=${order.farmer._id}`} className="btn btn-primary">
              💬 Message Farmer
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
