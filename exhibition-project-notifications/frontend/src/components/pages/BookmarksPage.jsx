import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import EventCard from '../cards/EventCard';

export default function BookmarksPage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookmarkedEvents();
  }, []);

  const fetchBookmarkedEvents = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/events/my-bookmarks');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveBookmark = (event) => {
    setEvents((current) => current.filter((item) => item.id !== event.id));
    api.delete(`/events/${event.id}/bookmark`).catch((error) => {
      console.error('Failed to remove bookmark', error);
      setEvents((current) => [...current, event]);
    });
  };

  return (
    <section className="page-section">
      <header className="section-header">
        <div>
          <span className="eyebrow">Saved picks</span>
          <h2>Your curated shortlist</h2>
        </div>
        <button type="button" className="ghost-button" onClick={fetchBookmarkedEvents}>
          Refresh
        </button>
      </header>
      {isLoading ? (
        <div className="loading-state">Loading bookmarks...</div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <h3>No bookmarks yet</h3>
          <p>Tap the bookmark icon on an event to keep it on your radar.</p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onToggleBookmark={() => handleRemoveBookmark(event)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
