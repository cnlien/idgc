const express = require('express');
const router = express.Router();
const db = require('../config/database');  // Import the database connection

router.post('/logout', (req, res) => {
  // Check if the user is authenticated
  if (!req.user) {
    return res.status(400).send("You are not logged in.");
  }

  // Remove the user from the UserSessions table
  db.run("DELETE FROM UserSessions WHERE UserID = ?", [req.user.ID], (err) => {
    if (err) {
      console.error("Error removing user from UserSessions:", err.message);
      return res.status(500).send("An error occurred while logging out. Please try again later.");
    }

    // Log the user out and end the Passport session
    req.logout(() => {
      // Optionally, destroy the session
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err.message);
          return res.status(500).send("An error occurred while logging out. Please try again later.");
        }
        res.send("Successfully logged out.");
      });
    });
  });
});


module.exports = router;
