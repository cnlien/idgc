const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const sqlite3 = require('sqlite3').verbose();
const db = require('../config/database');

passport.serializeUser((user, done) => {
    done(null, user.ID);
});

passport.deserializeUser((id, done) => {
    db.get("SELECT * FROM Users WHERE ID = ?", [id], (err, user) => {
        done(err, user);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.API_BASE_URL}/auth/google/callback`
}, (token, tokenSecret, profile, done) => {
    db.get("SELECT * FROM Users WHERE GoogleID = ?", [profile.id], (err, user) => {
        if (err) return done(err);

        if (user) {
            // Insert a new session record for the existing user
            db.run("INSERT INTO UserSessions (UserID) VALUES (?)", [user.ID], (err) => {
                if (err) {
                    console.error(err.message);
                    // Handle error, maybe return an error response or log it
                }
                return done(null, user);
            });
        } else {
            const newUser = {
                GoogleID: profile.id,
                DisplayName: profile.displayName,
                FirstName: profile.name.givenName,
                LastName: profile.name.familyName,
                Email: profile.emails[0].value,
                ProfilePhotoURL: profile.photos[0].value
            };

            db.run("INSERT INTO Users (GoogleID, DisplayName, FirstName, LastName, Email, ProfilePhotoURL) VALUES (?, ?, ?, ?, ?, ?)", 
                [newUser.GoogleID, newUser.DisplayName, newUser.FirstName, newUser.LastName, newUser.Email, newUser.ProfilePhotoURL], 
                function(err) {
                    if (err) return done(err);
                    newUser.ID = this.lastID;

                    // Insert a new session record for the new user
                    db.run("INSERT INTO UserSessions (UserID) VALUES (?)", [newUser.ID], (err) => {
                        if (err) {
                            console.error(err.message);
                            // Handle error, maybe return an error response or log it
                        }
                        return done(null, newUser);
                    });
                }
            );
        }
    });
}));
