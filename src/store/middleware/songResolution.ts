import { getTrack, getPlaylist } from "../../apis/spotify";
import { getYoutubeResults } from "../../apis/youtube";
import {
    SpotifyActions,
    AddSpotifySongAction,
    addToQueue,
    AddSpotifyPlaylistAction,
    YoutubeActions,
    AddYoutubeSongAction,
} from "../actions";
import { Store } from "../store";

export const songResolution =
    (store: Store) => (next: (action: any) => void) => async (action: any) => {
        if (action.type === SpotifyActions.ADD_SPOTIFY_SONG) {
            const addSpotifySong = action as AddSpotifySongAction;
            const song = await getTrack(addSpotifySong.id);

            if (!song) return next(action);

            addSpotifySong.resolvedArtists = song.artists
                .map((a) => a.name)
                .join(", ");
            addSpotifySong.resolvedThumbnail = song.album.images[0].url;
            addSpotifySong.resolvedTitle = song.name;

            next(addSpotifySong);
            await store.dispatch(
                addToQueue({
                    title: addSpotifySong.resolvedTitle,
                    artists: addSpotifySong.resolvedArtists,
                    thumbnail: addSpotifySong.resolvedThumbnail,
                    videoId: "",
                    requestor: addSpotifySong.requestor,
                    requestorChannel: addSpotifySong.requestorChannel,
                })
            );

            return;
        }

        if (action.type === SpotifyActions.ADD_SPOTIFY_PLAYLIST) {
            const addSpotifyPlaylist = action as AddSpotifyPlaylistAction;
            const playlist = await getPlaylist(addSpotifyPlaylist.id);

            if (!playlist) return next(action);

            const trackCount = Math.min(playlist.tracks.items.length, 10);
            addSpotifyPlaylist.resolvedName = playlist.name;
            addSpotifyPlaylist.resolvedTrackCount = trackCount;

            // TODO
            /*playlist.tracks.items.slice(0, trackCount).forEach(track => {
                await store.dispatch(
                    addToQueue({
                        title: addSpotifySong.resolvedTitle,
                        artists: addSpotifySong.resolvedArtists,
                        thumbnail: addSpotifySong.resolvedThumbnail,
                        videoId: "",
                        requestor: addSpotifySong.requestor,
                        requestorChannel: addSpotifySong.requestorChannel,
                    })
                );
            });*/

            return next(addSpotifyPlaylist);
        }

        if (action.type === YoutubeActions.ADD_YOUTUBE_SONG) {
            const addYoutubeSong = action as AddYoutubeSongAction;
            const results = await getYoutubeResults(addYoutubeSong.query);

            if (results.length > 0) {
                const result = results[0];

                addYoutubeSong.resolvedArtists = result.snippet.channelTitle;
                addYoutubeSong.resolvedThumbnail =
                    result.snippet.thumbnails.default.url;
                addYoutubeSong.resolvedTitle = result.snippet.title;
                addYoutubeSong.resolvedVideoId = result.id.videoId;

                next(action);
                await store.dispatch(
                    addToQueue({
                        title: addYoutubeSong.resolvedTitle,
                        artists: addYoutubeSong.resolvedArtists,
                        thumbnail: addYoutubeSong.resolvedThumbnail,
                        videoId: addYoutubeSong.resolvedVideoId,
                        requestor: addYoutubeSong.requestor,
                        requestorChannel: addYoutubeSong.requestorChannel,
                    })
                );
            }

            return;
        }

        next(action);
    };
