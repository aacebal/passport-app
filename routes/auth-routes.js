const express    = require('express');
const bcrypt     = require('bcrypt');

const User       = require('../models/user-model.js');

const authRoutes = express.Router();

authRoutes.get('/signup', (req, res, next) => {
  res.render('auth/signup-view.ejs');
});

authRoutes.post('/signup', (req, res, next) => {
  const signupUsername = req.body.signupUsername;
  const signupPassword = req.body.signupPassword;

  if ( signupUsername === "" || signupPassword === "") {
    res.render('auth/signup-view.ejs',
    { errorMessage: 'Please provide both username and password'
  });
  return;
  }
  else if (true) {
    User.findOne(
      { username: signupUsername },
      { username: 1 },
      (err, foundUser) => {
        if (err) {
          next(err);
          return;
        }
        if (foundUser) {
          res.render('auth/signup-view.ejs',
        { errorMessage: 'Username is taken'
      });
      return;
      }

      const salt = bcrypt.genSaltSync(10);
      const hashPass = bcrypt.hashSync(signupPassword, salt);

      const theUser = new User({
        name: req.body.signupName,
        username: signupUsername,
        encryptedPassword: hashPass
      });
      theUser.save((err) => {
        if (err) {
          next(err);
          return;
        }

        res.redirect('/');
      });
    });
  }
});

module.exports = authRoutes;
