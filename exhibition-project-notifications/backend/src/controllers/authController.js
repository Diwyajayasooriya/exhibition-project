const User = require('../models/user');

const authController = {
  // Register a new user
  register: async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      // Check if user already exists
      const existingUser = await User.findByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      // Create new user
      const newUser = await User.create(username, password);

      // Set session
      req.session.user = {
        id: newUser.id,
        username: newUser.username
      };

      res.status(201).json(req.session.user);
    } catch (err) {
      // Log full error for debugging
      console.error('Register error:', err);
      // In development, include the error message to help debug on the client
      const message = err.message || 'Server error during registration';
      const payload = { message };
      if (process.env.NODE_ENV !== 'production') payload.error = err.stack;
      res.status(500).json(payload);
    }
  },

  // Log in an existing user
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      // Find user
      const user = await User.findByUsername(username);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await User.comparePassword(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Set session
      req.session.user = {
        id: user.id,
        username: user.username
      };

      res.status(200).json(req.session.user);
    } catch (err) {
      console.error('Login error:', err);
      const message = err.message || 'Server error during login';
      const payload = { message };
      if (process.env.NODE_ENV !== 'production') payload.error = err.stack;
      res.status(500).json(payload);
    }
  },

  // Log out the user
  logout: (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ message: 'Could not log out, please try again' });
      }
      res.clearCookie('connect.sid'); // Clear the session cookie
      res.status(200).json({ message: 'Logged out successfully' });
    });
  },

  // Check user's current session
  checkSession: (req, res) => {
    if (req.session.user) {
      res.status(200).json(req.session.user);
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  }
};

module.exports = authController;
