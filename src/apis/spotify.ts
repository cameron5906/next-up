import SpotifyWebApi from "spotify-web-api-node";

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;
console.log(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET);
const api = new SpotifyWebApi({
    clientId: SPOTIFY_CLIENT_ID,
    clientSecret: SPOTIFY_CLIENT_SECRET,
});

export function setupSpotify() {
    api.clientCredentialsGrant()
        .then((data) => {
            console.log(`Setting Spotify token: ${data.body.access_token}`);
            api.setAccessToken(data.body.access_token);

            // On expiration of token, automatically re-do token setup
            setTimeout(() => {
                setupSpotify();
            }, data.body.expires_in * 1000);
        })
        .catch((ex) => {});
}

export async function getPlaylist(
    id: string
): Promise<SpotifyApi.SinglePlaylistResponse | null> {
    console.log(`Retrieving Spotify playlist: ${id}`);

    const response = await api.getPlaylist(id);

    if (response.statusCode !== 200) return null;

    return response.body;
}

export async function getTrack(
    id: string
): Promise<SpotifyApi.SingleTrackResponse | null> {
    console.log(`Retrieving track from Spotify: ${id}`);

    const response = await api.getTrack(id);

    if (response.statusCode !== 200) return null;

    return response.body;
}

export async function getRecommendedSong(
    artists: string[],
    tracks: string[]
): Promise<SpotifyApi.TrackObjectSimplified | null> {
    console.log(`Retrieving recommended song from Spotify`);

    const response = await api.getRecommendations({
        seed_artists: artists,
        seed_tracks: tracks,
        limit: 5,
    });

    if (response.statusCode !== 200) return null;
    if (response.body.tracks.length === 0) return null;

    const randomTrack =
        response.body.tracks[
            Math.floor(Math.random() * response.body.tracks.length)
        ];
    return randomTrack;
}

export async function searchSpotifyTrack(
    query: string
): Promise<SpotifyApi.TrackObjectFull | null> {
    console.log(`Searching for Spotify track: ${query}`);

    const response = await api.searchTracks(query, { limit: 1 });

    if (response.statusCode !== 200) return null;
    if (!response.body.tracks || response.body.tracks?.items.length === 0)
        return null;

    return response.body.tracks.items[0];
}
