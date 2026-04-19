import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import CropCard from '../components/CropCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { HiOutlineMagnifyingGlass, HiOutlineFunnel } from 'react-icons/hi2';

const categories = [
  { value: 'all', label: 'All Categories', emoji: '🌍' },
  { value: 'vegetables', label: 'Vegetables', emoji: '🥬' },
  { value: 'fruits', label: 'Fruits', emoji: '🍎' },
  { value: 'grains', label: 'Grains', emoji: '🌾' },
  { value: 'pulses', label: 'Pulses', emoji: '🫘' },
  { value: 'spices', label: 'Spices', emoji: '🌶️' },
  { value: 'dairy', label: 'Dairy', emoji: '🥛' },
  { value: 'other', label: 'Other', emoji: '📦' }
];

export default function Marketplace() {
  const { api } = useAuth();
  const { t } = useLanguage();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  const [organic, setOrganic] = useState(false);
  const [city, setCity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchCrops();
  }, [category, sort, organic, page]);

  const fetchCrops = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.append('category', category);
      if (search) params.append('search', search);
      if (organic) params.append('organic', 'true');
      if (city) params.append('city', city);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      params.append('sort', sort);
      params.append('page', page);
      params.append('limit', '12');

      const res = await api.get(`/crops?${params.toString()}`);
      setCrops(res.data.crops);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Failed to fetch crops:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCrops();
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('all');
    setSort('newest');
    setOrganic(false);
    setCity('');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">🌾 {t('freshMarketplace')}</h1>
          <p className="page-subtitle">
            Discover fresh, farm-direct produce from verified farmers across India
          </p>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar" id="marketplace-filters">
          <form onSubmit={handleSearch} className="search-wrapper">
            <HiOutlineMagnifyingGlass className="search-icon" />
            <input
              type="text"
              placeholder={t('searchCrops')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="search-input"
            />
          </form>

          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '160px' }}
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            id="category-filter"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.emoji} {cat.label}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '140px' }}
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            id="sort-filter"
          >
            <option value="newest">⏰ Newest</option>
            <option value="price_low">💰 Price: Low</option>
            <option value="price_high">💰 Price: High</option>
          </select>

          <button
            className={`btn btn-sm ${organic ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setOrganic(!organic); setPage(1); }}
            id="organic-filter"
          >
            🌿 {t('organic')}
          </button>

          <button
            className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <HiOutlineFunnel /> {t('filter')}
          </button>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="card animate-slide-up" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '150px' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>📍 City</label>
                <input type="text" className="form-input" placeholder="e.g., Pune" value={city} onChange={e => setCity(e.target.value)} />
              </div>
              <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '120px' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Min Price (₹)</label>
                <input type="number" className="form-input" placeholder="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} min="0" />
              </div>
              <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '120px' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Max Price (₹)</label>
                <input type="number" className="form-input" placeholder="10000" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} min="0" />
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => { setPage(1); fetchCrops(); }}>
                Apply
              </button>
              <button className="btn btn-secondary btn-sm" onClick={clearFilters}>
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Result count */}
        {!loading && (
          <div style={{ marginBottom: '1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            Showing {crops.length} of {total} crops
          </div>
        )}

        {/* Results */}
        {loading ? (
          <LoadingSpinner />
        ) : crops.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🌱</div>
            <h3>{t('noCropsFound')}</h3>
            <p>Try adjusting your filters or search terms to find what you're looking for.</p>
            <button className="btn btn-secondary" onClick={clearFilters}>Clear Filters</button>
          </div>
        ) : (
          <>
            <div className="grid grid-3 stagger-children" id="crop-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {crops.map(crop => (
                <CropCard key={crop._id} crop={crop} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                <button className="btn btn-sm btn-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  ← Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button className="btn btn-sm btn-secondary" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
