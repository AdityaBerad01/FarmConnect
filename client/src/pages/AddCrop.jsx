import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ImageUpload from '../components/ImageUpload';

export default function AddCrop() {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'vegetables',
    price: '',
    quantity: '',
    unit: 'kg',
    city: '',
    state: '',
    isOrganic: false,
    harvestDate: '',
    qualityGrade: '',
    qualityDetails: '',
    season: '',
    preOrderAvailable: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { city, state, ...rest } = formData;
      await api.post('/crops', {
        ...rest,
        price: Number(rest.price),
        quantity: Number(rest.quantity),
        location: { city, state },
        harvestDate: rest.harvestDate || undefined,
        images
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '700px' }}>
        <div className="page-header">
          <h1 className="page-title">🌾 Add New Crop</h1>
          <p className="page-subtitle">List your produce for buyers to discover</p>
        </div>

        <div className="card animate-slide-up" style={{ padding: '2.5rem' }}>
          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              background: 'rgba(230,57,70,0.1)',
              border: '1px solid rgba(230,57,70,0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-error)',
              marginBottom: '1.5rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} id="add-crop-form">
            {/* Image Upload */}
            <div className="form-group">
              <label className="form-label">📸 Crop Photos</label>
              <ImageUpload images={images} onChange={setImages} maxImages={5} />
            </div>

            <div className="form-group">
              <label className="form-label">Crop Title *</label>
              <input type="text" name="title" className="form-input" placeholder="e.g., Fresh Organic Tomatoes" value={formData.title} onChange={handleChange} required id="crop-title" />
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea name="description" className="form-input" placeholder="Describe your crop, quality, farming practices..." value={formData.description} onChange={handleChange} required id="crop-description" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select name="category" className="form-select" value={formData.category} onChange={handleChange} id="crop-category">
                  <option value="vegetables">🥬 Vegetables</option>
                  <option value="fruits">🍎 Fruits</option>
                  <option value="grains">🌾 Grains</option>
                  <option value="pulses">🫘 Pulses</option>
                  <option value="spices">🌶️ Spices</option>
                  <option value="dairy">🥛 Dairy</option>
                  <option value="other">📦 Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Unit *</label>
                <select name="unit" className="form-select" value={formData.unit} onChange={handleChange} id="crop-unit">
                  <option value="kg">Kilogram (kg)</option>
                  <option value="quintal">Quintal</option>
                  <option value="ton">Ton</option>
                  <option value="dozen">Dozen</option>
                  <option value="piece">Piece</option>
                  <option value="litre">Litre</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Price per unit (₹) *</label>
                <input type="number" name="price" className="form-input" placeholder="e.g., 50" value={formData.price} onChange={handleChange} required min="0" id="crop-price" />
              </div>

              <div className="form-group">
                <label className="form-label">Available Quantity *</label>
                <input type="number" name="quantity" className="form-input" placeholder="e.g., 100" value={formData.quantity} onChange={handleChange} required min="1" id="crop-quantity" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">City *</label>
                <input type="text" name="city" className="form-input" placeholder="e.g., Pune" value={formData.city} onChange={handleChange} required id="crop-city" />
              </div>

              <div className="form-group">
                <label className="form-label">State *</label>
                <input type="text" name="state" className="form-input" placeholder="e.g., Maharashtra" value={formData.state} onChange={handleChange} required id="crop-state" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Quality Grade</label>
                <select name="qualityGrade" className="form-select" value={formData.qualityGrade} onChange={handleChange}>
                  <option value="">No Grade</option>
                  <option value="A">Grade A (Premium)</option>
                  <option value="B">Grade B (Standard)</option>
                  <option value="C">Grade C (Economy)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Season</label>
                <select name="season" className="form-select" value={formData.season} onChange={handleChange}>
                  <option value="">Not specified</option>
                  <option value="kharif">🌧️ Kharif (Monsoon)</option>
                  <option value="rabi">❄️ Rabi (Winter)</option>
                  <option value="zaid">☀️ Zaid (Summer)</option>
                  <option value="year-round">🔄 Year-round</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Quality Details (optional)</label>
              <textarea name="qualityDetails" className="form-input" placeholder="Describe quality, farming method, certifications..." value={formData.qualityDetails} onChange={handleChange} style={{ minHeight: '80px' }} />
            </div>

            <div className="form-group">
              <label className="form-label">Harvest Date</label>
              <input type="date" name="harvestDate" className="form-input" value={formData.harvestDate} onChange={handleChange} id="crop-harvest-date" />
            </div>

            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox" name="isOrganic" checked={formData.isOrganic} onChange={handleChange}
                  style={{ width: 20, height: 20, accentColor: 'var(--color-primary)' }} id="crop-organic"
                />
                <span style={{ fontWeight: 500 }}>🌿 Organically grown</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox" name="preOrderAvailable" checked={formData.preOrderAvailable} onChange={handleChange}
                  style={{ width: 20, height: 20, accentColor: 'var(--color-primary)' }}
                />
                <span style={{ fontWeight: 500 }}>📅 Accept pre-orders</span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1rem' }} disabled={loading} id="submit-crop">
              {loading ? 'Publishing...' : '🚀 Publish Listing'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
