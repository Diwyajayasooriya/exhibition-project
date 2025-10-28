import React from 'react';
import { useAuth } from '../../context/AuthContext';
import NavPill from '../navigation/NavPill';

const NAV_ITEMS = [
  { key: 'events', label: 'Events', icon: '🗓️' },
  { key: 'bookmarks', label: 'Bookmarks', icon: '⭐' },
  { key: 'notifications', label: 'Notifications', icon: '🔔' },
];

export default function AppHeader({ activePage, onNavigate, unreadCount }) {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand">
          <div className="brand-mark">EX</div>
          <div className="brand-copy">
            <span className="brand-title">ExpoEvents</span>
            <span className="brand-subtitle">Worthwhile experiences, curated for you.</span>
          </div>
        </div>
        <nav className="nav-cluster" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <NavPill
              key={item.key}
              label={item.label}
              icon={item.icon}
              isActive={activePage === item.key}
              badge={item.key === 'notifications' ? unreadCount : 0}
              onClick={() => onNavigate(item.key)}
            />
          ))}
        </nav>
        <div className="user-cluster">
          <div className="user-chip">
            <span className="user-initials">{user?.username?.slice(0, 2).toUpperCase()}</span>
            <div className="user-meta">
              <span className="user-label">Signed in as</span>
              <span className="user-name">{user?.username}</span>
            </div>
          </div>
          <button className="ghost-button" onClick={logout}>
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
