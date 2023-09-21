const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../idgc.db');

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
            return done(null, user);
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
                    return done(null, newUser);
                }
            );
        }
    });
}));
