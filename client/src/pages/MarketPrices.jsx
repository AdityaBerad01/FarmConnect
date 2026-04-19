import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import PriceChart from '../components/PriceChart';
import LoadingSpinner from '../components/LoadingSpinner';
import { HiOutlineMagnifyingGlass, HiOutlineArrowTrendingUp, HiOutlineArrowTrendingDown } from 'react-icons/hi2';

const categoryFilters = [
  { value: 'all', label: 'All', emoji: '🌍' },
  { value: 'vegetables', label: 'Vegetables', emoji: '🥬' },
  { value: 'fruits', label: 'Fruits', emoji: '🍎' },
  { value: 'grains', label: 'Grains', emoji: '🌾' },
  { value: 'pulses', label: 'Pulses', emoji: '🫘' },
  { value: 'spices', label: 'Spices', emoji: '🌶️' },
  { value: 'dairy', label: 'Dairy', emoji: '🥛' },
];

export default function MarketPrices() {
  const { api } = useAuth();
  const { t } = useLanguage();
  const [prices, setPrices] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [cropHistory, setCropHistory] = useState([]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [category]);

  const fetchData = async () => {
    try {
      const [pricesRes, trendingRes] = await Promise.all([
        api.get('/market-prices?days=3'),
        api.get('/market-prices/trending')
      ]);
      setPrices(pricesRes.data);
      setTrending(trendingRes.data);
    } catch (err) {
      console.error('Failed to fetch market data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrices = async () => {
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.append('category', category);
      params.append('days', '3');
      const res = await api.get(`/market-prices?${params.toString()}`);
      setPrices(res.data);
    } catch (err) {
      console.error('Failed to fetch prices:', err);
    }
  };

  const fetchCropHistory = async (cropName) => {
    setSelectedCrop(cropName);
    try {
      const res = await api.get(`/market-prices/crop/${cropName}`);
      setCropHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch crop history:', err);
    }
  };

  const filteredPrices = prices.filter(p =>
    p.crop.toLowerCase().includes(search.toLowerCase()) ||
    p.market.toLowerCase().includes(search.toLowerCase())
  );

  // Get unique latest prices per crop
  const latestPrices = {};
  prices.forEach(p => {
    if (!latestPrices[p.crop] || new Date(p.date) > new Date(latestPrices[p.crop].date)) {
      latestPrices[p.crop] = p;
    }
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">📊 {t('liveMarketPrices')}</h1>
          <p className="page-subtitle">{t('livePricesDesc')}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span className="live-dot" />
            <span style={{ fontSize: '0.85rem', color: 'var(--color-success)' }}>Live • Auto-refreshes every 60s</span>
          </div>
        </div>

        {/* Trending Ticker */}
        <div className="price-ticker-wrapper">
          <div className="price-ticker">
            {trending.map((t, i) => (
              <div key={i} className="price-ticker-item">
                <span style={{ fontWeight: 600 }}>{t._id}</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>₹{Math.round(t.avgPrice)}/q</span>
                <span style={{
                  color: t.trend === 'up' ? 'var(--color-success)' : t.trend === 'down' ? 'var(--color-error)' : 'var(--color-text-muted)',
                  fontWeight: 600,
                  fontSize: '0.8rem'
                }}>
                  {t.trend === 'up' ? '▲' : t.trend === 'down' ? '▼' : '●'} {t.changePercent > 0 ? '+' : ''}{t.changePercent?.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Cards */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '1rem' }}>
            🔥 Trending Prices
          </h2>
          <div className="grid stagger-children" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {trending.slice(0, 8).map((crop, i) => (
              <div
                key={i}
                className="card price-trend-card"
                onClick={() => fetchCropHistory(crop._id)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{crop._id}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                      {crop.category}
                    </div>
                  </div>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    background: crop.trend === 'up' ? 'rgba(82,183,136,0.15)' : crop.trend === 'down' ? 'rgba(230,57,70,0.15)' : 'rgba(255,255,255,0.05)',
                    color: crop.trend === 'up' ? 'var(--color-success)' : crop.trend === 'down' ? 'var(--color-error)' : 'var(--color-text-muted)'
                  }}>
                    {crop.trend === 'up' ? '▲' : crop.trend === 'down' ? '▼' : '●'} {crop.changePercent > 0 ? '+' : ''}{crop.changePercent?.toFixed(1)}%
                  </span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-primary-light)', marginTop: '0.75rem' }}>
                  ₹{Math.round(crop.avgPrice)}
                  <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-text-muted)' }}>/quintal</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                  Range: ₹{crop.minPrice} - ₹{crop.maxPrice}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="filter-bar" style={{ marginBottom: '2rem' }}>
          <div className="search-wrapper" style={{ flex: 1 }}>
            <HiOutlineMagnifyingGlass className="search-icon" />
            <input
              type="text"
              placeholder="Search crop or market..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="price-search"
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {categoryFilters.map(cat => (
              <button
                key={cat.value}
                className={`btn btn-sm ${category === cat.value ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCategory(cat.value)}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Crop History Chart */}
        {selectedCrop && cropHistory.length > 0 && (
          <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)' }}>📈 {selectedCrop} — Price History (30 Days)</h3>
              <button className="btn btn-sm btn-secondary" onClick={() => setSelectedCrop(null)}>Close</button>
            </div>
            <PriceChart
              data={cropHistory.map(p => ({
                label: new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                value: p.modalPrice
              }))}
              width={800}
              height={200}
              color="#52b788"
            />
          </div>
        )}

        {/* Price Table */}
        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)' }}>📋 All Market Prices</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="price-table">
              <thead>
                <tr>
                  <th>{t('cropName')}</th>
                  <th>Category</th>
                  <th>{t('market')}</th>
                  <th>State</th>
                  <th>{t('minPrice')} (₹)</th>
                  <th>{t('maxPrice')} (₹)</th>
                  <th>{t('modalPrice')} (₹)</th>
                  <th>{t('trend')}</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrices.slice(0, 50).map((price, i) => (
                  <tr key={i} onClick={() => fetchCropHistory(price.crop)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 600 }}>{price.crop}</td>
                    <td><span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>{price.category}</span></td>
                    <td>{price.market}</td>
                    <td>{price.state}</td>
                    <td>₹{price.minPrice.toLocaleString()}</td>
                    <td>₹{price.maxPrice.toLocaleString()}</td>
                    <td style={{ fontWeight: 700, color: 'var(--color-primary-light)' }}>₹{price.modalPrice.toLocaleString()}</td>
                    <td>
                      <span style={{
                        color: price.trend === 'up' ? 'var(--color-success)' : price.trend === 'down' ? 'var(--color-error)' : 'var(--color-text-muted)',
                        fontWeight: 600
                      }}>
                        {price.trend === 'up' ? '▲ Up' : price.trend === 'down' ? '▼ Down' : '● Stable'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      {new Date(price.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredPrices.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
              No prices found. Try adjusting your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
