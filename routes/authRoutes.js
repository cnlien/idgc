const express = require('express');
const passport = require('passport');
const router = express.Router();

// Google authentication route
router.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

// Callback route after Google authentication
router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/'); // Redirect to the homepage or dashboard after successful login
  }
);

module.exports = router;
