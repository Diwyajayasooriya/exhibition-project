import React from 'react';
import api from '../../services/api';

export default function NotificationsPage({ notifications, onRefresh }) {
  const handleMarkRead = async (notificationId) => {
    try {
      await api.put(`/events/notifications/${notificationId}/read`);
      onRefresh?.();
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  };

  return (
    <section className="page-section">
      <header className="section-header">
        <div>
          <span className="eyebrow">Inbox</span>
          <h2>Updates tailored to you</h2>
        </div>
      </header>
      {notifications.length === 0 ? (
        <div className="empty-state">
          <h3>You are all caught up</h3>
          <p>Bookmark events to start receiving reminders and highlights.</p>
        </div>
      ) : (
        <ul className="notification-list">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`notification-card${notification.is_read ? ' notification-card--read' : ''}`}
            >
              <div>
                <p className="notification-message">{notification.message}</p>
                <time className="notification-time">
                  {new Date(notification.created_at).toLocaleString()}
                </time>
              </div>
              {!notification.is_read && (
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => handleMarkRead(notification.id)}
                >
                  Mark read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
