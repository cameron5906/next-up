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
