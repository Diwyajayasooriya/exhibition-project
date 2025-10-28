import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function EventCard({ event, onToggleBookmark }) {
  const { user } = useAuth();

  const formatTime = (isoString) =>
    new Date(isoString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  return (
    <article className="event-card">
      <div className="event-meta">
        <span className="event-tag">Featured</span>
        <h3 className="event-title">{event.name}</h3>
        <p className="event-description">{event.description}</p>
      </div>
      <dl className="event-details">
        <div>
          <dt>Location</dt>
          <dd>{event.location || 'To be announced'}</dd>
        </div>
        <div>
          <dt>Starts</dt>
          <dd>{formatTime(event.start_time)}</dd>
        </div>
        <div>
          <dt>Ends</dt>
          <dd>{formatTime(event.end_time)}</dd>
        </div>
      </dl>
      {user && (
        <button
          type="button"
          className={`bookmark-button${event.isBookmarked ? ' bookmark-button--active' : ''}`}
          onClick={onToggleBookmark}
        >
          {event.isBookmarked ? 'Remove Bookmark' : 'Bookmark Event'}
        </button>
      )}
    </article>
  );
}
