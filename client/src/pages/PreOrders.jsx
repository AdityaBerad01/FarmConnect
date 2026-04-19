import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const statusColors = {
  requested: 'badge-warning',
  accepted: 'badge-success',
  rejected: 'badge-error',
  fulfilled: 'badge-info',
  cancelled: 'badge-error'
};

const statusIcons = {
  requested: '⏳',
  accepted: '✅',
  rejected: '❌',
  fulfilled: '📦',
  cancelled: '🚫'
};

export default function PreOrders() {
  const { user, api } = useAuth();
  const [preOrders, setPreOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPreOrders();
  }, [filter]);

  const fetchPreOrders = async () => {
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await api.get(`/preorders${params}`);
      setPreOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch pre-orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/preorders/${id}/status`, { status });
      fetchPreOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">📅 Pre-Orders</h1>
          <p className="page-subtitle">
            {user?.role === 'buyer' ? 'Book crops in advance and lock prices early' : 'Manage incoming pre-order requests'}
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {['all', 'requested', 'accepted', 'fulfilled', 'rejected', 'cancelled'].map(s => (
            <button
              key={s}
              className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(s)}
            >
              {s === 'all' ? '📋 All' : `${statusIcons[s] || ''} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
            </button>
          ))}
        </div>

        {/* Pre-orders list */}
        {preOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <h3>No Pre-Orders</h3>
            <p>{user?.role === 'buyer' ? 'Browse the marketplace and pre-order crops in advance!' : 'Pre-order requests will appear here.'}</p>
            {user?.role === 'buyer' && (
              <Link to="/marketplace" className="btn btn-primary">Browse Marketplace</Link>
            )}
          </div>
        ) : (
          <div className="stagger-children" style={{ display: 'grid', gap: '1rem' }}>
            {preOrders.map(po => (
              <div key={po._id} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>
                        🌾 {po.cropName}
                      </h3>
                      <span className={`badge ${statusColors[po.status]}`}>
                        {statusIcons[po.status]} {po.status}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', fontSize: '0.9rem' }}>
                      <div>
                        <span style={{ color: 'var(--color-text-muted)' }}>Quantity: </span>
                        <span style={{ fontWeight: 600 }}>{po.quantity} {po.unit}</span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--color-text-muted)' }}>Locked Price: </span>
                        <span style={{ fontWeight: 700, color: 'var(--color-primary-light)' }}>₹{po.lockedPrice}/{po.unit}</span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--color-text-muted)' }}>Total: </span>
                        <span style={{ fontWeight: 700 }}>₹{(po.lockedPrice * po.quantity).toLocaleString()}</span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--color-text-muted)' }}>Expected: </span>
                        <span style={{ fontWeight: 500 }}>
                          {new Date(po.expectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    {po.notes && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
                        📝 {po.notes}
                      </p>
                    )}
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                      {user?.role === 'buyer'
                        ? `Farmer: ${po.farmer?.name}`
                        : `Buyer: ${po.buyer?.name}`
                      } • {new Date(po.createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {user?.role === 'farmer' && po.status === 'requested' && (
                      <>
                        <button className="btn btn-sm btn-primary" onClick={() => updateStatus(po._id, 'accepted')}>
                          ✅ Accept
                        </button>
                        <button className="btn btn-sm btn-secondary" style={{ color: 'var(--color-error)' }} onClick={() => updateStatus(po._id, 'rejected')}>
                          ❌ Reject
                        </button>
                      </>
                    )}
                    {user?.role === 'farmer' && po.status === 'accepted' && (
                      <button className="btn btn-sm btn-primary" onClick={() => updateStatus(po._id, 'fulfilled')}>
                        📦 Mark Fulfilled
                      </button>
                    )}
                    {user?.role === 'buyer' && po.status === 'requested' && (
                      <button className="btn btn-sm btn-secondary" style={{ color: 'var(--color-error)' }} onClick={() => updateStatus(po._id, 'cancelled')}>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
