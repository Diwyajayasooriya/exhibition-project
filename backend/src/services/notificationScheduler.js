const cron = require('node-cron');
const db = require('../config/db');

// Check every 5 minutes for events that need notifications
const scheduleNotifications = () => {
  cron.schedule('*/5 * * * *', async () => {
    console.log('Checking for events to notify...');
    
    try {
      const now = new Date();
      
      // Calculate the time ranges for notifications
      // 1 day before: 24 hours
      // 1 hour before: 1 hour
      // 30 minutes before: 30 minutes
      
      const oneDayFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000));
      const oneDayBuffer = new Date(now.getTime() + (24 * 60 + 5) * 60 * 1000); // +5 min buffer
      
      const oneHourFromNow = new Date(now.getTime() + (60 * 60 * 1000));
      const oneHourBuffer = new Date(now.getTime() + (65 * 60 * 1000)); // +5 min buffer
      
      const thirtyMinFromNow = new Date(now.getTime() + (30 * 60 * 1000));
      const thirtyMinBuffer = new Date(now.getTime() + (35 * 60 * 1000)); // +5 min buffer
      
      // Get all bookmarked events with their users
      const bookmarksQuery = `
        SELECT b.user_id, e.id as event_id, e.name, e.start_time
        FROM bookmarks b
        JOIN events e ON b.event_id = e.id
        WHERE e.start_time > $1
      `;
      
      const { rows: bookmarks } = await db.query(bookmarksQuery, [now]);
      
      for (const bookmark of bookmarks) {
        const eventTime = new Date(bookmark.start_time);
        
        // Check if we should send a 1-day notification
        if (eventTime >= oneDayFromNow && eventTime <= oneDayBuffer) {
          await sendNotificationIfNotSent(
            bookmark.user_id,
            bookmark.event_id,
            `Reminder: "${bookmark.name}" starts in 1 day!`,
            '1_day'
          );
        }
        
        // Check if we should send a 1-hour notification
        if (eventTime >= oneHourFromNow && eventTime <= oneHourBuffer) {
          await sendNotificationIfNotSent(
            bookmark.user_id,
            bookmark.event_id,
            `Reminder: "${bookmark.name}" starts in 1 hour!`,
            '1_hour'
          );
        }
        
        // Check if we should send a 30-minute notification
        if (eventTime >= thirtyMinFromNow && eventTime <= thirtyMinBuffer) {
          await sendNotificationIfNotSent(
            bookmark.user_id,
            bookmark.event_id,
            `Reminder: "${bookmark.name}" starts in 30 minutes!`,
            '30_min'
          );
        }
      }
      
    } catch (err) {
      console.error('Error in notification scheduler:', err);
    }
  });
  
  console.log('Notification scheduler started - checking every 5 minutes');
};

// Helper function to prevent duplicate notifications
const sendNotificationIfNotSent = async (userId, eventId, message, notificationType) => {
  try {
    // Check if this notification was already sent
    const checkQuery = `
      SELECT id FROM notifications 
      WHERE user_id = $1 
      AND event_id = $2 
      AND notification_type = $3
      AND created_at > NOW() - INTERVAL '2 hours'
    `;
    
    const { rows } = await db.query(checkQuery, [userId, eventId, notificationType]);
    
    if (rows.length === 0) {
      // Notification hasn't been sent, create it
      const insertQuery = `
        INSERT INTO notifications (user_id, event_id, message, notification_type)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      await db.query(insertQuery, [userId, eventId, message, notificationType]);
      console.log(`✓ Sent ${notificationType} notification to user ${userId} for event ${eventId}`);
    }
  } catch (err) {
    console.error('Error sending notification:', err);
  }
};

module.exports = { scheduleNotifications };
