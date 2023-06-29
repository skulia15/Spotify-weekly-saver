import SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi();

export async function setAccessToken(accessToken) {
  spotifyApi.setAccessToken(accessToken);
}

// Function to get all tracks of a playlist
async function getAllTracksOfPlaylist(playlistId) {
  let response = await spotifyApi.getPlaylistTracks(playlistId);
  let tracks = response.body.items.map(item => item.track.id);
  return tracks;
}


export async function removeAllDuplicatesFromPlaylist(playlistId, accessToken) {
  setAccessToken(accessToken);
  let response = await spotifyApi.getPlaylistTracks(playlistId, { fields: 'items.track.id,items.track.uri,items.is_local,snapshot_id' });
  let trackItems = response.body.items;
  // Filter out local tracks (we can't remove these by track URI)
  let nonLocalItems = trackItems.filter(item => !item.is_local);

  // Make a map to count duplicates
  let trackCounts = new Map();
  nonLocalItems.forEach((item, index) => {
    let trackId = item.track.id;
    if (!trackCounts.has(trackId)) {
      trackCounts.set(trackId, { count: 1, uri: item.track.uri });
    } else {
      let trackInfo = trackCounts.get(trackId);
      trackInfo.count++;
      trackCounts.set(trackId, trackInfo);
    }
  });

  // Find duplicates and prepare their URIs for removal
  let duplicatesUris = [];
  for (let [trackId, trackInfo] of trackCounts.entries()) {
    if (trackInfo.count > 1) {
      // We keep the first occurrence and remove the others
      for (let i = 1; i < trackInfo.count; i++) {
        duplicatesUris.push({ uri: trackInfo.uri });
      }
    }
  }

  // Remove duplicates from the playlist
  await spotifyApi.removeTracksFromPlaylist(playlistId, duplicatesUris);

  console.log('Duplicates removed successfully');
}

export async function copyDiscoverWeekly(targetPlaylistId, accessToken) {
  try {
    setAccessToken(accessToken);

    const playlists = await spotifyApi.getUserPlaylists();

    const discoverWeekly = playlists.body.items.find(
      (playlist) => playlist.name === 'Discover Weekly'
    );

    if (!discoverWeekly) {
      console.log("Discover Weekly not found.");
      return;
    }

    // Get all tracks in source and target playlists
    let sourceTracks = await getAllTracksOfPlaylist(discoverWeekly.id);
    let targetTracks = await getAllTracksOfPlaylist(targetPlaylistId);

    // Filter out tracks that are already in target playlist
    let uniqueTracks = sourceTracks.filter(track => !targetTracks.includes(track));

    if (uniqueTracks.length > 0) {
      // Convert track IDs to URIs
      let trackURIs = uniqueTracks.map(id => `spotify:track:${id}`);

      // Add unique tracks to the target playlist
      await spotifyApi.addTracksToPlaylist(targetPlaylistId, trackURIs);
    } else {
      console.log('No unique tracks to add');
    }

  } catch (err) {
    console.log(err);
  }
}
