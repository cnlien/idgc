require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const app = express();
const port = process.env.API_PORT;

// Passport configuration
require('./config/passport');

// Express session setup
app.use(session({ 
    secret: require('./config/generateSecret')(), // Use the generateSecret function
    resave: false, 
    saveUninitialized: true 
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());

// Import and use the routers

// Google authentication route
app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Callback route after Google authentication
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/'); // Redirect to the homepage or dashboard after successful login
});

const leaguesRouter = require('./routes/leagues');
const authRouter = require('./routes/auth');
app.use('/leagues', leaguesRouter);
app.use('/auth', authRouter);

app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
      // If the user is authenticated, render a logout button
      res.send(`
          <h1>Welcome, ${req.user.DisplayName}!</h1>
          <form action="/auth/logout" method="post">
              <button type="submit">Logout</button>
          </form>
      `);
  } else {
      // If the user is not authenticated, just display 'connected'
      res.send('connected');
  }
});




app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
