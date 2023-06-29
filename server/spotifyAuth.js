import passport from 'passport';
import { Strategy as SpotifyStrategy } from 'passport-spotify';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
  new SpotifyStrategy(
    {
      clientID: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      callbackURL: 'http://localhost:8888/callback'
    },
    function (accessToken, refreshToken, expires_in, profile, done) {
      // Save the accessToken here to use in your API requests later+
      console.log('done', accessToken)
      
      done(null, accessToken);
    }
  )
);

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});


export const spotifyAuth = passport.authenticate('spotify', {
  scope: ['user-read-email', 'user-read-private', 'playlist-modify-public', 'playlist-modify-private'],
  showDialog: true
});

export const spotifyCallback = function (req, res, next) {
  passport.authenticate('spotify', function(err, user, info) {
    if (err) { 
      console.error(err);
      return next(err); 
    }
    if (!user) { 
      console.error('No user');
      return res.redirect('/login'); 
    }
    req.logIn(user, function(err) {
      if (err) { 
        console.error(err);
        return next(err); 
      }
      console.log("Authentication successful");
      return res.redirect('/');
    });
  })(req, res, next);
};