-- Drop existing tables if they exist
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create the 'users' table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the 'events' table
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255)
);

-- Create the 'bookmarks' join table
CREATE TABLE bookmarks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  -- Ensure a user can't bookmark the same event twice
  UNIQUE(user_id, event_id) 
);

-- Create the 'notifications' table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  notification_type VARCHAR(20),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- === DUMMY DATA INSERTION ===

-- === USERS ===
-- Insert users with pre-hashed passwords.
-- User: 'alice', Password: 'password123'
INSERT INTO users (username, password_hash) 
VALUES ('alice', '$2a$10$Y.u1.l/4l5SfsV.g5s1J9.1c3XSS.B.sU.j3.x/bI/U.Z.a..lK5K');

-- User: 'bob', Password: 'password456'
INSERT INTO users (username, password_hash) 
VALUES ('bob', '$2a$10$zKeaJ.A.p.G.o.V.l.A.s.f.u.e.I.k.e.G.b.e.H.S.q.g.i.q');

-- === EVENTS ===
-- We use NOW() so the events are always in the future
INSERT INTO events (name, description, start_time, end_time, location)
VALUES 
(
  'AI in Art: The New Frontier', 
  'A panel discussion on how generative AI is changing the art world.', 
  NOW() + INTERVAL '1 day', 
  NOW() + INTERVAL '1 day 2 hours', 
  'Main Hall A'
),
(
  'Quantum Computing Explained', 
  'A deep dive into the principles of quantum computing and its future applications.', 
  NOW() + INTERVAL '1 day 4 hours', 
  NOW() + INTERVAL '1 day 5 hours 30 minutes', 
  'Room 102'
),
(
  'The Future of Virtual Reality', 
  'Experience the next generation of VR hardware and discuss its impact on entertainment and work.', 
  NOW() + INTERVAL '2 days 1 hour', 
  NOW() + INTERVAL '2 days 3 hours', 
  'Demo Zone'
),
(
  'Web 3.0 & Decentralization Panel', 
  'Experts debate the pros and cons of a decentralized internet.', 
  NOW() + INTERVAL '2 days 3 hours', 
  NOW() + INTERVAL '2 days 4 hours', 
  'Main Hall B'
);

-- === BOOKMARKS ===
-- Link users to events.
-- Note: User ID 1 is 'alice', User ID 2 is 'bob'
-- Event IDs 1-4 correspond to the events above

-- Alice (1) bookmarks 'AI in Art' (1)
INSERT INTO bookmarks (user_id, event_id) VALUES (1, 1);
-- Alice (1) bookmarks 'Future of VR' (3)
INSERT INTO bookmarks (user_id, event_id) VALUES (1, 3);

-- Bob (2) bookmarks 'AI in Art' (1)
INSERT INTO bookmarks (user_id, event_id) VALUES (2, 1);
-- Bob (2) bookmarks 'Web 3.0 Panel' (4)
INSERT INTO bookmarks (user_id, event_id) VALUES (2, 4);

-- === NOTIFICATIONS ===
-- Create notifications for the bookmarks
-- We'll make one for Alice unread so the badge appears

-- Alice's notifications
INSERT INTO notifications (user_id, message, is_read) 
VALUES (1, 'You bookmarked "AI in Art: The New Frontier".', TRUE);
INSERT INTO notifications (user_id, message, is_read) 
VALUES (1, 'You bookmarked "The Future of Virtual Reality".', FALSE); -- This one is unread

-- Bob's notifications
INSERT INTO notifications (user_id, message, is_read) 
VALUES (2, 'You bookmarked "AI in Art: The New Frontier".', TRUE);
INSERT INTO notifications (user_id, message, is_read) 
VALUES (2, 'You bookmarked "Web 3.0 & Decentralization Panel".', TRUE);

-- === EVENT REMINDER NOTIFICATIONS (Example) ===
-- In a real application, these would be created by a scheduled job (e.g., a "cron job") 
-- on the backend that runs every minute to check for upcoming events.
-- This is a static example of what that notification would look like.

-- This notification would be created 30 minutes before the event starts.
-- We set its 'created_at' time to be 30 mins before the event start time.
INSERT INTO notifications (user_id, message, is_read, created_at) 
VALUES (
  1, 
  'REMINDER: "AI in Art: The New Frontier" is starting in 30 minutes!', 
  FALSE, 
  NOW() + INTERVAL '1 day' - INTERVAL '30 minutes'
);
