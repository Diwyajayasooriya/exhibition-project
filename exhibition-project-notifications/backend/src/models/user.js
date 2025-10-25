const db = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  // Find a user by their username
  findByUsername: async (username) => {
    const query = 'SELECT * FROM users WHERE username = $1';
    const { rows } = await db.query(query, [username]);
    return rows[0];
  },

  // Create a new user
  create: async (username, password) => {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    const query = 'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username';
    const { rows } = await db.query(query, [username, password_hash]);
    return rows[0];
  },

  // Compare password
  comparePassword: async (inputPassword, password_hash) => {
    return await bcrypt.compare(inputPassword, password_hash);
  }
};

module.exports = User;
