export default function VerifiedBadge({ size = 16, showText = false }) {
  return (
    <span className="verified-badge" title="Verified" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 2L3.5 6.5V12c0 4.7 3.2 9.1 8.5 10.5C17.3 21.1 20.5 16.7 20.5 12V6.5L12 2z" fill="#2196F3" stroke="#1976D2" strokeWidth="1"/>
        <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {showText && <span style={{ fontSize: '0.75rem', color: '#2196F3', fontWeight: 600 }}>Verified</span>}
    </span>
  );
}
