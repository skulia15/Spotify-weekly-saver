import cron from 'node-cron';
import { copyDiscoverWeekly } from './spotifyActions.js';

// You can choose to hard-code the playlist ID or fetch it from an environment variable
const targetPlaylistId = 'YOUR_PLAYLIST_ID'; 

cron.schedule('0 0 * * MON', () => {
  copyDiscoverWeekly(targetPlaylistId);
});
