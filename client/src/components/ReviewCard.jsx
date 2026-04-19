import StarRating from './StarRating';
import VerifiedBadge from './VerifiedBadge';

export default function ReviewCard({ review }) {
  const timeAgo = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="review-card">
      <div className="review-card-header">
        <div className="review-card-user">
          <div className="navbar-avatar" style={{ width: 40, height: 40, fontSize: '0.9rem' }}>
            {review.reviewer?.name?.charAt(0)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 600 }}>{review.reviewer?.name}</span>
              <span className="badge" style={{
                fontSize: '0.65rem',
                padding: '2px 8px',
                background: review.reviewerRole === 'buyer' ? 'rgba(76,201,240,0.15)' : 'rgba(82,183,136,0.15)',
                color: review.reviewerRole === 'buyer' ? 'var(--color-info)' : 'var(--color-success)'
              }}>
                {review.reviewerRole === 'buyer' ? '🛒 Buyer' : '🧑‍🌾 Farmer'}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              {timeAgo(review.createdAt)}
            </div>
          </div>
        </div>
        <StarRating rating={review.rating} readonly size={16} />
      </div>
      {review.comment && (
        <p className="review-card-comment">{review.comment}</p>
      )}
    </div>
  );
}
