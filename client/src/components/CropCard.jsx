import { Link } from 'react-router-dom';
import { HiOutlineMapPin } from 'react-icons/hi2';
import StarRating from './StarRating';
import VerifiedBadge from './VerifiedBadge';

const categoryEmojis = {
  vegetables: '🥬',
  fruits: '🍎',
  grains: '🌾',
  pulses: '🫘',
  spices: '🌶️',
  dairy: '🥛',
  other: '📦'
};

export default function CropCard({ crop }) {
  const emoji = categoryEmojis[crop.category] || '🌱';

  return (
    <Link to={`/crop/${crop._id}`} className="crop-card" id={`crop-${crop._id}`}>
      <div className="crop-card-image">
        {crop.images && crop.images.length > 0 ? (
          <img src={crop.images[0]} alt={crop.title} />
        ) : (
          <div className="crop-placeholder-img">{emoji}</div>
        )}
        <div className="crop-card-badges">
          {crop.isOrganic && <span className="badge badge-success">🌿 Organic</span>}
          <span className="badge badge-primary">{crop.category}</span>
          {crop.qualityGrade && (
            <span className="badge badge-info">Grade {crop.qualityGrade}</span>
          )}
        </div>
      </div>

      <div className="crop-card-body">
        <div className="crop-card-category">{crop.category}</div>
        <h3 className="crop-card-title">{crop.title}</h3>
        
        <div className="crop-card-location">
          <HiOutlineMapPin />
          {crop.location?.city}, {crop.location?.state}
        </div>

        <div className="crop-card-footer">
          <div className="crop-card-price">
            ₹{crop.price} <span>/{crop.unit}</span>
          </div>
          {crop.farmer && (
            <div className="crop-card-farmer">
              <div className="navbar-avatar" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>
                {crop.farmer.name?.charAt(0)}
              </div>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                {crop.farmer.name}
                {crop.farmer.isVerified && <VerifiedBadge size={12} />}
              </span>
            </div>
          )}
        </div>

        {/* Rating */}
        {crop.farmer?.averageRating > 0 && (
          <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <StarRating rating={crop.farmer.averageRating} readonly size={12} />
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
              ({crop.farmer.totalReviews})
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
