require('dotenv').config();
const db = require('./config/database');  // Import the database connection
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


app.get('/', (req, res) => {
  res.send('<h1>Indy Disc Golf API</h1><p>Author: Chris Lien</p>');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
