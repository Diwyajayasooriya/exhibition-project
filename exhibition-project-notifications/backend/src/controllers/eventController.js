const Event = require('../models/event');

const eventController = {
  // Get all events and include user's bookmark status
  getAllEvents: async (req, res) => {
    try {
      let bookmarkedIds = [];
      // Check if user is logged in
      if (req.session.user && req.session.user.id) {
        bookmarkedIds = await Event.getBookmarkIds(req.session.user.id);
      }

      const events = await Event.getAll();

      // Map events to include a boolean `isBookmarked`
      const eventsWithBookmarks = events.map(event => ({
        ...event,
        isBookmarked: bookmarkedIds.includes(event.id)
      }));

      res.status(200).json(eventsWithBookmarks);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error fetching events' });
    }
  },

  // --- Bookmarks ---
  
  // Bookmark an event
  bookmarkEvent: async (req, res) => {
    try {
      const eventId = parseInt(req.params.id, 10);
      const userId = req.user.id; // From authMiddleware

      await Event.addBookmark(userId, eventId);

      // Create a notification
      const event = (await Event.getAll()).find(e => e.id === eventId);
      if (event) {
        await Event.createNotification(userId, `You bookmarked "${event.name}".`);
      }

      res.status(201).json({ message: 'Event bookmarked successfully' });
    } catch (err) {
      console.error(err);
      // Handle unique constraint violation (already bookmarked)
      if (err.code === '23505') {
        return res.status(400).json({ message: 'Event already bookmarked' });
      }
      res.status(500).json({ message: 'Server error bookmarking event' });
    }
  },

  // Remove a bookmark
  removeBookmark: async (req, res) => {
    try {
      const eventId = parseInt(req.params.id, 10);
      const userId = req.user.id; // From authMiddleware
      
      await Event.removeBookmark(userId, eventId);
      res.status(200).json({ message: 'Bookmark removed successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error removing bookmark' });
    }
  },

  // Get user's bookmarked events
  getBookmarkedEvents: async (req, res) => {
    try {
      const userId = req.user.id;
      const events = await Event.getBookmarks(userId);
      // All events returned here are bookmarked
      const eventsWithBookmarks = events.map(event => ({
        ...event,
        isBookmarked: true
      }));
      res.status(200).json(eventsWithBookmarks);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error fetching bookmarks' });
    }
  },

  // --- Notifications ---

  // Get user's notifications
  getNotifications: async (req, res) => {
    try {
      const userId = req.user.id;
      const notifications = await Event.getNotifications(userId);
      res.status(200).json(notifications);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error fetching notifications' });
    }
  },

  // Mark a notification as read
  markRead: async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id, 10);
      // You could add a check here to ensure req.user.id owns this notification
      await Event.markNotificationRead(notificationId);
      res.status(200).json({ message: 'Notification marked as read' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = eventController;
