const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const SECRET = process.env.JWT_SECRET;

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
    db.get("SELECT * FROM Users WHERE GoogleID = ?", [profile.id], async (err, user) => {
        if (err) return done(err);

        const generateJWT = async (userID) => {
            // Fetch user roles
            const roles = await new Promise((resolve, reject) => {
                db.all("SELECT RoleName FROM UserRoles JOIN Roles ON UserRoles.RoleID = Roles.RoleID WHERE UserID = ?", [userID], (err, rows) => {
                    if (err) reject(err);
                    resolve(rows.map(row => row.RoleName));
                });
            });

            // Fetch leagues the user is an admin for
            const leaguesAdmin = await new Promise((resolve, reject) => {
                db.all("SELECT LeagueID FROM LeagueAdmins WHERE UserID = ?", [userID], (err, rows) => {
                    if (err) reject(err);
                    resolve(rows.map(row => row.LeagueID));
                });
            });

            // Generate JWT with roles and leagues
            return jwt.sign({ id: userID, roles, leaguesAdmin }, SECRET, { expiresIn: '7d' });
        };

        if (user) {
            const userToken = await generateJWT(user.ID);

            // Insert a new session record for the existing user with the JWT
            db.run("INSERT INTO UserSessions (UserID, Token) VALUES (?, ?)", [user.ID, userToken], (err) => {
                if (err) console.error(err.message);
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
                async function(err) {
                    if (err) return done(err);
                    newUser.ID = this.lastID;

                    const userToken = await generateJWT(newUser.ID);

                    // Insert a new session record for the new user with the JWT
                    db.run("INSERT INTO UserSessions (UserID, Token) VALUES (?, ?)", [newUser.ID, userToken], (err) => {
                        if (err) console.error(err.message);
                        return done(null, newUser);
                    });
                }
            );
        }
    });
}));
