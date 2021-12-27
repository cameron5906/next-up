import SpotifyWebApi from "spotify-web-api-node";

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;
const api = new SpotifyWebApi({
    clientId: SPOTIFY_CLIENT_ID,
    clientSecret: SPOTIFY_CLIENT_SECRET,
});

function setupToken() {
    api.clientCredentialsGrant()
        .then((data) => {
            api.setAccessToken(data.body.access_token);

            // On expiration of token, automatically re-do token setup
            setTimeout(() => {
                setupToken();
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

// Get the token immediately at runtime
setupToken();
