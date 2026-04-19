import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { HiOutlineBell } from 'react-icons/hi2';

const typeIcons = {
  order_update: '📦',
  price_alert: '📊',
  new_request: '🔔',
  review: '⭐',
  system: 'ℹ️',
  message: '💬',
  preorder: '📅'
};

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
    setIsOpen(false);
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="notification-bell-wrapper" ref={panelRef}>
      <button
        className="notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        id="notification-bell"
        aria-label="Notifications"
      >
        <HiOutlineBell />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-panel animate-scale-in">
          <div className="notification-panel-header">
            <h4>🔔 Notifications</h4>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="notification-mark-all">
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-panel-body">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <span>🔕</span>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 15).map(n => (
                <div
                  key={n._id}
                  className={`notification-item ${!n.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className="notification-item-icon">
                    {n.icon || typeIcons[n.type] || '🔔'}
                  </div>
                  <div className="notification-item-content">
                    <div className="notification-item-title">{n.title}</div>
                    <div className="notification-item-message">{n.message}</div>
                    <div className="notification-item-time">{timeAgo(n.createdAt)}</div>
                  </div>
                  {!n.read && <div className="notification-item-dot" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
