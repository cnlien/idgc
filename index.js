require('dotenv').config();
const db = require('./config/database'); // Import the database connection
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const authRoutes = require('./routes/authRoutes'); // Import the authentication routes
const app = express();
const port = process.env.API_PORT;
const logger = require('./utils/logger');

const AppError = require('./utils/AppError');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes"
});

// Passport configuration
require('./config/passportConfig');

// Express session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Use the authentication routes
app.use('/', authRoutes);

app.get('/', (req, res) => {
  res.send('<h1>Indy Disc Golf API</h1><p>Author: Chris Lien</p>');
});

// Handle 404 Not Found
app.use('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handling middleware
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  logger.error(`Error: ${err.message}`);

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
