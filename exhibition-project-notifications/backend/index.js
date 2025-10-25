// 1. Import Express
const express = require('express');

// 2. Create an Express application
const app = express();

// 3. Define a port to run on
const PORT = process.env.PORT || 3000;

// 4. Create a "route"
// This tells the server what to do when someone visits the main URL ("/")
app.get('/', (req, res) => {
  res.send('Hello, World! This is my first backend server.');
});

// 5. Start the server and listen for connections
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});