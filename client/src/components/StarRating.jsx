import { useState } from 'react';

export default function StarRating({ rating = 0, onRate, size = 20, readonly = false, showValue = false }) {
  const [hover, setHover] = useState(0);

  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="star-rating" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
      {stars.map(star => (
        <button
          key={star}
          type="button"
          className={`star-btn ${star <= (hover || rating) ? 'filled' : ''}`}
          style={{
            background: 'none',
            border: 'none',
            cursor: readonly ? 'default' : 'pointer',
            fontSize: `${size}px`,
            padding: '2px',
            transition: 'transform 0.15s ease',
            transform: !readonly && hover === star ? 'scale(1.2)' : 'scale(1)',
            filter: star <= (hover || rating) ? 'none' : 'grayscale(100%) opacity(0.3)'
          }}
          onClick={() => !readonly && onRate && onRate(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          disabled={readonly}
        >
          ⭐
        </button>
      ))}
      {showValue && (
        <span style={{
          marginLeft: '6px',
          fontSize: `${size * 0.7}px`,
          fontWeight: 700,
          color: 'var(--color-accent-light)'
        }}>
          {rating > 0 ? rating.toFixed(1) : ''}
        </span>
      )}
    </div>
  );
}
