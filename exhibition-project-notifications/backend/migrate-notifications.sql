-- Migration: Add event_id and notification_type columns to notifications table
-- Run this if your database already exists

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS notification_type VARCHAR(20);
