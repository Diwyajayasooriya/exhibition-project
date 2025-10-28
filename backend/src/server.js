require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const pool = require('./config/db'); // Import the connection pool
const { scheduleNotifications } = require('./services/notificationScheduler');

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---

// Enable CORS (Cross-Origin Resource Sharing)
// This is crucial for your React frontend to talk to this backend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Allow React app's origins (both CRA and Vite)
  credentials: true // Allow cookies to be sent
}));

// Parse incoming JSON requests
app.use(express.json());

// Parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use true in production (HTTPS)
    httpOnly: true, // Prevents client-side JS from reading the cookie
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

// Simple test route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the Exhibition API' });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Test the database connection
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Error connecting to PostgreSQL:', err);
    } else {
      console.log('Successfully connected to PostgreSQL:', res.rows[0].now);
    }
  });
  
  // Start the notification scheduler
  scheduleNotifications();
});
