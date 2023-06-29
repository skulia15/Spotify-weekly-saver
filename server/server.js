import express from 'express';
import passport from 'passport';
import { spotifyAuth, spotifyCallback } from './spotifyAuth.js';
import dotenv from 'dotenv';
import { copyDiscoverWeekly, removeAllDuplicatesFromPlaylist } from './spotifyActions.js';
import session from 'express-session';

dotenv.config();

if(!process.env.SPOTIFY_CLIENT_ID) 
  throw new Error('SPOTIFY_CLIENT_ID not found in environment variables.');
if (!process.env.SPOTIFY_CLIENT_SECRET)
  throw new Error('SPOTIFY_CLIENT_SECRET not found in environment variables.');

const clientID = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const targetPlaylistId = process.env.TARGET_PLAYLIST_ID;



const app = express();
const port = process.env.PORT || 8888;

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'my_secret', // this should be a random string for security
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/spotify', spotifyAuth);
app.get('/callback', spotifyCallback);

app.get('/', (req, res) => {
  let accessToken = req.user;
  if (!accessToken) {
    return res.redirect('/auth/spotify');
  }
  // removeAllDuplicatesFromPlaylist(targetPlaylistId, accessToken)
  copyDiscoverWeekly(targetPlaylistId, accessToken)
  res.send('copyDiscoverWeekly Done');
});
app.get('/remove-duplicates', spotifyCallback);


app.listen(port, () => console.log(`Server started on http://localhost:${port}`));
