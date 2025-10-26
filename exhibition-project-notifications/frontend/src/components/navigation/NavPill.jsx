import React from 'react';

export default function NavPill({ label, icon, isActive, badge = 0, onClick }) {
  return (
    <button
      className={`nav-pill${isActive ? ' nav-pill--active' : ''}`}
      onClick={onClick}
      type="button"
    >
      <span className="nav-pill__icon" aria-hidden>{icon}</span>
      <span className="nav-pill__label">{label}</span>
      {badge > 0 && <span className="nav-pill__badge">{badge}</span>}
    </button>
  );
}
