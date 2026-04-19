import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CropRecommendations() {
  const { api } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const res = await api.get('/analytics/recommendations');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const profitColors = {
    'Very High': '#52b788',
    'High': '#40916c',
    'Medium': '#f4a261',
    'Low': '#e76f51'
  };

  const demandColors = {
    'Very High': '#52b788',
    'High': '#40916c',
    'Medium': '#f4a261',
    'Low': '#e76f51'
  };

  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  const seasonEmojis = { kharif: '🌧️', rabi: '❄️', zaid: '☀️' };
  const seasonNames = { kharif: 'Kharif (Monsoon)', rabi: 'Rabi (Winter)', zaid: 'Zaid (Summer)' };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">🌱 Crop Recommendations</h1>
          <p className="page-subtitle">Smart suggestions based on season, location, and market demand</p>
        </div>

        {/* Season Banner */}
        <div className="card animate-fade-in" style={{
          background: 'linear-gradient(135deg, rgba(45,106,79,0.15), rgba(231,111,81,0.1))',
          border: '1px solid rgba(45,106,79,0.3)',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
            {seasonEmojis[data.season] || '🌱'}
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            Current Season: {seasonNames[data.season] || data.season}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            {data.tip}
          </p>
        </div>

        {/* Recommendations Grid */}
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '1rem' }}>
          🎯 Recommended Crops for This Season
        </h2>
        <div className="grid stagger-children" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', marginBottom: '2rem' }}>
          {data.recommendations.map((crop, i) => (
            <div key={i} className="card recommendation-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>{crop.name}</h3>
                  <span className="badge badge-primary" style={{ textTransform: 'capitalize', marginTop: '0.25rem' }}>
                    {crop.category}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem' }}>
                    {crop.category === 'vegetables' ? '🥬' : crop.category === 'fruits' ? '🍎' :
                     crop.category === 'grains' ? '🌾' : crop.category === 'pulses' ? '🫘' :
                     crop.category === 'spices' ? '🌶️' : '🌱'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  background: `${profitColors[crop.profit]}20`,
                  color: profitColors[crop.profit]
                }}>
                  💰 Profit: {crop.profit}
                </span>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  background: `${demandColors[crop.demand]}20`,
                  color: demandColors[crop.demand]
                }}>
                  📊 Demand: {crop.demand}
                </span>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                💡 {crop.tip}
              </p>
            </div>
          ))}
        </div>

        {/* Demand Trends */}
        {data.demandTrends && data.demandTrends.length > 0 && (
          <>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '1rem' }}>
              📈 Platform Demand Trends
            </h2>
            <div className="card" style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {data.demandTrends.map((trend, i) => {
                  const maxValue = Math.max(...data.demandTrends.map(t => t.totalOrders));
                  const percentage = (trend.totalOrders / maxValue) * 100;
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{trend._id}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                          {trend.totalOrders} orders • ₹{trend.totalValue?.toLocaleString()}
                        </span>
                      </div>
                      <div style={{
                        height: '8px',
                        background: 'var(--color-surface)',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${percentage}%`,
                          background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-light))',
                          borderRadius: 'var(--radius-full)',
                          transition: 'width 1s ease'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
