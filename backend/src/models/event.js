const db = require('../config/db');

const Event = {
  // Get all events
  getAll: async () => {
    const query = 'SELECT * FROM events ORDER BY start_time ASC';
    const { rows } = await db.query(query);
    return rows;
  },

  // --- Bookmarks ---

  // Add a bookmark for a user
  addBookmark: async (userId, eventId) => {
    const query = 'INSERT INTO bookmarks (user_id, event_id) VALUES ($1, $2) RETURNING id';
    const { rows } = await db.query(query, [userId, eventId]);
    return rows[0];
  },

  // Remove a bookmark
  removeBookmark: async (userId, eventId) => {
    const query = 'DELETE FROM bookmarks WHERE user_id = $1 AND event_id = $2';
    await db.query(query, [userId, eventId]);
  },

  // Get all bookmarked events for a user
  getBookmarks: async (userId) => {
    const query = `
      SELECT e.* FROM events e
      JOIN bookmarks b ON e.id = b.event_id
      WHERE b.user_id = $1
      ORDER BY e.start_time ASC
    `;
    const { rows } = await db.query(query, [userId]);
    return rows;
  },

  // Get just the IDs of bookmarked events for a user
  getBookmarkIds: async (userId) => {
    const query = 'SELECT event_id FROM bookmarks WHERE user_id = $1';
    const { rows } = await db.query(query, [userId]);
    return rows.map(row => row.event_id);
  },

  // --- Notifications ---

  // Create a notification
  createNotification: async (userId, message) => {
    const query = 'INSERT INTO notifications (user_id, message) VALUES ($1, $2) RETURNING *';
    const { rows } = await db.query(query, [userId, message]);
    return rows[0];
  },

  // Get unread notifications for a user
  getNotifications: async (userId) => {
    const query = 'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC';
    const { rows } = await db.query(query, [userId]);
    return rows;
  },

  // Mark a notification as read
  markNotificationRead: async (notificationId) => {
    const query = 'UPDATE notifications SET is_read = TRUE WHERE id = $1';
    await db.query(query, [notificationId]);
  }
};

module.exports = Event;
    
