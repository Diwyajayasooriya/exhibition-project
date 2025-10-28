import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import AppHeader from './AppHeader';
import AuthPage from '../pages/AuthPage';
import EventsPage from '../pages/EventsPage';
import BookmarksPage from '../pages/BookmarksPage';
import NotificationsPage from '../pages/NotificationsPage';

const PAGE_KEYS = {
  LOGIN: 'login',
  EVENTS: 'events',
  BOOKMARKS: 'bookmarks',
  NOTIFICATIONS: 'notifications',
};

export default function AppShell() {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState(PAGE_KEYS.EVENTS);
  const [notifications, setNotifications] = useState([]);
  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications]
  );

  useEffect(() => {
    if (!user) {
      setActivePage(PAGE_KEYS.LOGIN);
      setNotifications([]);
      return;
    }

    setActivePage((previous) => (previous === PAGE_KEYS.LOGIN ? PAGE_KEYS.EVENTS : previous));
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const response = await api.get('/events/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case PAGE_KEYS.EVENTS:
        return <EventsPage />;
      case PAGE_KEYS.BOOKMARKS:
        return <BookmarksPage />;
      case PAGE_KEYS.NOTIFICATIONS:
        return (
          <NotificationsPage
            notifications={notifications}
            onRefresh={fetchNotifications}
          />
        );
      default:
        return <AuthPage onAuthComplete={() => setActivePage(PAGE_KEYS.EVENTS)} />;
    }
  };

  return (
    <div className="app-shell">
      {user && (
        <AppHeader
          activePage={activePage}
          onNavigate={setActivePage}
          unreadCount={unreadCount}
        />
      )}
      <main className="main-content">
        <div className="content-surface">{renderPage()}</div>
      </main>
    </div>
  );
}
