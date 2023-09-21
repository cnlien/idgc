const express = require('express');
const router = express.Router();

router.get('/logout', (req, res) => {
  req.logout(() => {
      res.redirect('/');  // Redirect to the homepage or login page after logging out
  });
});


module.exports = router;