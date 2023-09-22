const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { findUserByGoogleID, createUser, findUserByID } = require('../../database/queries/userQueries');
module.exports = function(passport) {
  passport.serializeUser((user, done) => {
    done(null, user.ID);
  });
  
  passport.deserializeUser((id, done) => {
    findUserByID(id, (err, user) => {
        done(err, user);
    });
});
  
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.API_BASE_URL}/auth/google/callback`,
      },
      (token, tokenSecret, profile, done) => {
        findUserByGoogleID(profile.id, (err, user) => {
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
              ProfilePhotoURL: profile.photos[0].value,
            };
  
            createUser(newUser, function(err) {
              if (err) return done(err);
              newUser.ID = this.lastID;
              return done(null, newUser);
            });
          }
        });
      }
    )
  );
}
