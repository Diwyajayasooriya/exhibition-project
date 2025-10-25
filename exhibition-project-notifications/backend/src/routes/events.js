const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middlewear/authMiddleware');

// --- Public Routes ---

// GET /api/events
// Get all events. Includes bookmark status if user is logged in.
router.get('/', eventController.getAllEvents);


// --- Protected Routes (Require Login) ---

// POST /api/events/:id/bookmark
// Bookmark an event
router.post('/:id/bookmark', authMiddleware, eventController.bookmarkEvent);

// DELETE /api/events/:id/bookmark
// Remove a bookmark
router.delete('/:id/bookmark', authMiddleware, eventController.removeBookmark);

// GET /api/events/my-bookmarks
// Get all events bookmarked by the current user
router.get('/my-bookmarks', authMiddleware, eventController.getBookmarkedEvents);

// GET /api/events/notifications
// Get all notifications for the current user
router.get('/notifications', authMiddleware, eventController.getNotifications);

// PUT /api/events/notifications/:id/read
// Mark a notification as read
router.put('/notifications/:id/read', authMiddleware, eventController.markRead);


module.exports = router;
