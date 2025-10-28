function authMiddleware(req, res, next) {
  // Check if the user is stored in the session
  if (req.session.user && req.session.user.id) {
    // User is logged in, attach their info to req.user
    req.user = req.session.user;
    next(); // Continue to the protected route
  } else {
    // User is not logged in
    res.status(401).json({ message: 'Unauthorized: You must be logged in.' });
  }
}

module.exports = authMiddleware;
