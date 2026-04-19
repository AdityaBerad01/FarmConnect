export default function OrderTimeline({ trackingHistory = [], currentStatus }) {
  const steps = [
    { status: 'pending', label: 'Order Placed', icon: '📝' },
    { status: 'confirmed', label: 'Confirmed', icon: '✅' },
    { status: 'shipped', label: 'Shipped', icon: '🚚' },
    { status: 'delivered', label: 'Delivered', icon: '📦' }
  ];

  const statusOrder = ['pending', 'confirmed', 'shipped', 'delivered'];
  const currentIndex = statusOrder.indexOf(currentStatus);
  const isCancelled = currentStatus === 'cancelled';

  const getTrackingDate = (status) => {
    const entry = trackingHistory.find(t => t.status === status);
    if (entry) {
      return new Date(entry.timestamp).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
      });
    }
    return '';
  };

  const getTrackingNote = (status) => {
    const entry = trackingHistory.find(t => t.status === status);
    return entry?.note || '';
  };

  if (isCancelled) {
    return (
      <div className="order-timeline">
        <div className="timeline-cancelled">
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>❌</div>
          <h3 style={{ color: 'var(--color-error)', marginBottom: '0.25rem' }}>Order Cancelled</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            {getTrackingDate('cancelled')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-timeline">
      {steps.map((step, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step.status} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
            <div className="timeline-step-indicator">
              <div className={`timeline-dot ${isCompleted ? 'active' : ''} ${isCurrent ? 'pulse' : ''}`}>
                {isCompleted ? step.icon : (index + 1)}
              </div>
              {index < steps.length - 1 && (
                <div className={`timeline-line ${index < currentIndex ? 'active' : ''}`} />
              )}
            </div>
            <div className="timeline-step-content">
              <div className="timeline-step-label">{step.label}</div>
              {isCompleted && (
                <>
                  <div className="timeline-step-date">{getTrackingDate(step.status)}</div>
                  {getTrackingNote(step.status) && (
                    <div className="timeline-step-note">{getTrackingNote(step.status)}</div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
