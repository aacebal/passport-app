const passport = require('passport');
const bcrypt = require('bcrypt');
const FbStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const User = require('../models/user-model.js');
// The same as:
// const passportLocal = require('passport-local');
// const LocalStrategy = passportLocal.Strategy;

// Determines WHAT TO SAVE in the session (what to put in the box)
// (called when you log in)
passport.serializeUser((user, cb) => {
  // "cb" is short for "callback"
  cb(null, user._id);
});


// Where to get the rest of the user's information (given what's in the box)
// (called on EVERY request AFTER you log in)
passport.deserializeUser((userId, cb) => {
  // "cb" is short for "callback"

  // query the database with the ID from the box
  User.findById(userId, (err, theUser) => {
    if (err) {
      cb(err);
      return;
    }

    // sending the user's info to passport
    cb(null, theUser);
  });
});

passport.use(new FbStrategy(
  {
    clientID: process.env.FB_APP_ID,
    clientSecret: process.env.FB_APP_SECRET,
    callbackURL: '/auth/facebook/callback'
  },              //            |
  (accessToken, refreshToken, profile, done) => {         //address for a route in our app
    console.log('FACEBOOK PROFILE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    console.log(profile);

    User.findOne(
      { facebookID: profile.id },
      { name: profile.displayName},

      (err, foundUser) => {
        if(err) {
          done(err);
          return;
        }
        //if user is already registered, just log them in!
        if(foundUser) {
          done(null, foundUser);
          return;
        }

        const theUser = new User({
          facebookID: profile.id,
          name: profile.displayName
        });

        theUser.save((err) => {
          if (err) {
            done(err);
            return;
          }
          done(null, theUser);
        });
      }
    );
  }
));

passport.use( new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  },
  (accessToke, refreshToken, profile, done) => {
    console.log('GOOGLE PROFILE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    console.log(profile);
    User.findOne(
      { googleID: profile.id },
      (err, foundUser) => {
        if (err) {
          done(err);
          return;
        }
        if (foundUser) {
          done(null, foundUser);
          return;
        }
        const theUser = new User ({
          googleID: profile.id,
          name: profile.displayName
        });

        if(!theUser.name) {
          theUser.name = profile.emails[0].value;
        }

        theUser.save((err) => {
          if (err) {
            done(err);
            return;
          }
          done(null, theUser);
        });
      });
    }
  ));


passport.use( new LocalStrategy(
  // 1st arg -> options to customize LocalStrategy
  {
      // <input name="loginUsername">
    usernameField: 'loginUsername',
      // <input name="loginPassword">
    passwordField: 'loginPassword'
  },

  // 2nd arg -> callback for the logic that validates the login
  (loginUsername, loginPassword, next) => {
    User.findOne(
      { username: loginUsername },

      (err, theUser) => {
        // Tell Passport if there was an error (nothing we can do)
        if (err) {
          next(err);
          return;
        }

        // Tell Passport if there is no user with given username
        if (!theUser) {
            //       false in 2nd arg means "Log in failed!"
            //         |
          next(null, false, { message: 'Wrong username, buddy. 😓' });
          return;  //   |
        }          //   v
                   // message -> req.flash('error')

        // Tell Passport if the passwords don't match
        if (!bcrypt.compareSync(loginPassword, theUser.encryptedPassword)) {
            //       false in 2nd arg means "Log in failed!"
            //         |
          next(null, false, { message: 'Wrong password, friend. 😓' });
          return;  //   |
        }          //   v
                   // message -> req.flash('error')

        // Give Passport the user's details (SUCCESS!)
        next(null, theUser, {
          // message -> req.flash('success')
          message: `Login for ${theUser.username} successful. 🤣`
        });
          // -> this user goes to passport.serializeUser()
      }
    );
  }
) );
