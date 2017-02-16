require('dotenv').config();

const path = require('path');
const express = require('express');
const s = require('./expressAppInstance.js');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-middleware');
const passport = require('passport');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const FacebookStrategy = require('passport-facebook').Strategy;
const Models = require('./server/Models.js');
const config = require('./webpackconfig.js');
const routes = require('./server/routes.js');

const User = Models.User;
const compiler = webpack(config);

s.app.use(webpackMiddleware(compiler));
s.app.use(cookieParser());
s.app.use(bodyParser.urlencoded({
    extended: true
}));
s.app.use(passport.initialize());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.find({
    where: {
      id: id
    }
  }).then(function(user) {
    done(err, user);
  });
});

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: '/auth/facebook/callback',
  },
  function(accessToken, refreshToken, profile, done) {
    User.find({
      where: {
        authId: profile.id,
      }
    }).then(function(user) {
      if (user) {
        return done(null, user);
      } else {
        //create user
        User.create({
          authId: profile.id,
          username: profile.displayName,
          money: 100,
          latitude: 0,
          longitude: 0,
        }).then(function(user) {
          if (user) {
            return done(null, user);
          }
          return done("there was an error while creating user", user);
        });
      }
    });
  }
));

s.app.use(express.static('dist'));
s.app.use("/routes", routes);

s.server.listen(3000, function() {
  console.log('listening to port 3000');
});

s.app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

s.app.get('/auth/facebook',
  passport.authenticate('facebook', { failureRedirect: '/login' }));

s.app.get('/auth/facebook',
  passport.authenticate('facebook')
);

// handle the callback after facebook has authenticated the user
s.app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect : '/login'
  }),
  function(req, res) {
    res.redirect(`/${req.user.dataValues.id}`);
  }
);

s.app.get('/login', function(req, res) {
  res.sendFile(path.join(__dirname, 'dist/login.html'));
});

s.app.get('/socket.io', function response(req, res) {
  res.sendFile(path.join(__dirname, 'node_modules/socket.io-client/dist/socket.io.js'));
});

s.app.get('^/[0-9]+$', function response(req, res) {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});
