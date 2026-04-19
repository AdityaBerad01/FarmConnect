import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PriceChart from '../components/PriceChart';
import LoadingSpinner from '../components/LoadingSpinner';

export default function FarmerAnalytics() {
  const { api } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics/farmer');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">📈 Farmer Analytics</h1>
          <p className="page-subtitle">Track your performance, revenue, and crop insights</p>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-stats animate-fade-in" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-card-label">💰 Total Revenue</div>
            <div className="stat-card-value">₹{data.totalRevenue?.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">📦 Total Orders</div>
            <div className="stat-card-value">{data.totalOrders}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">✅ Completed</div>
            <div className="stat-card-value">{data.completedOrders}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">🌾 Active Listings</div>
            <div className="stat-card-value">{data.activeListings}/{data.totalListings}</div>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Revenue Chart */}
          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>📊 Monthly Revenue</h3>
            {data.monthlyRevenue && data.monthlyRevenue.length > 0 ? (
              <PriceChart
                data={data.monthlyRevenue.map(m => ({
                  label: months[m._id.month - 1],
                  value: m.revenue
                }))}
                width={400}
                height={180}
                color="#52b788"
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                No revenue data yet
              </div>
            )}
          </div>

          {/* Best Selling Crops */}
          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>🏆 Best Selling Crops</h3>
            {data.bestSelling && data.bestSelling.length > 0 ? (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {data.bestSelling.map((crop, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '0.75rem', fontWeight: 700
                      }}>
                        {i + 1}
                      </span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{crop._id?.title || 'Crop'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {crop.orderCount} orders • {crop.totalQuantity} units
                        </div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--color-primary-light)' }}>
                      ₹{crop.totalRevenue?.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                No sales data yet
              </div>
            )}
          </div>

          {/* Order Status Distribution */}
          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>📋 Order Status</h3>
            {data.statusDistribution && data.statusDistribution.length > 0 ? (
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {data.statusDistribution.map((status, i) => {
                  const maxCount = Math.max(...data.statusDistribution.map(s => s.count));
                  const colors = {
                    pending: '#f4a261', confirmed: '#4cc9f0', shipped: '#2d6a4f',
                    delivered: '#52b788', cancelled: '#e63946'
                  };
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{status._id}</span>
                        <span style={{ fontWeight: 700 }}>{status.count}</span>
                      </div>
                      <div style={{
                        height: '6px', background: 'var(--color-surface)',
                        borderRadius: 'var(--radius-full)', overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${(status.count / maxCount) * 100}%`,
                          background: colors[status._id] || 'var(--color-primary)',
                          borderRadius: 'var(--radius-full)'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                No order data yet
              </div>
            )}
          </div>

          {/* Category Distribution */}
          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>🗂️ Crop Categories</h3>
            {data.categoryDistribution && data.categoryDistribution.length > 0 ? (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {data.categoryDistribution.map((cat, i) => {
                  const catEmojis = {
                    vegetables: '🥬', fruits: '🍎', grains: '🌾',
                    pulses: '🫘', spices: '🌶️', dairy: '🥛', other: '📦'
                  };
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.5rem 0.75rem', background: 'var(--color-surface)',
                      borderRadius: 'var(--radius-md)'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>{catEmojis[cat._id] || '📦'}</span>
                      <span style={{ flex: 1, fontWeight: 500, textTransform: 'capitalize' }}>{cat._id}</span>
                      <span className="badge badge-primary">{cat.count} listings</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                No crops listed yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
