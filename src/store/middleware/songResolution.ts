import { MessageEmbed } from "discord.js";
import { sendDiscordEmbed } from "../../apis/discord";
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

/**
 * Middleware for retrieving song metadata from source search query or Spotify URL
 */
export const songResolution =
    (store: Store) => (next: (action: any) => void) => async (action: any) => {
        // Handle adding of Spotify songs by URL
        if (action.type === SpotifyActions.ADD_SPOTIFY_SONG) {
            const addSpotifySong = action as AddSpotifySongAction;
            const song = await getTrack(addSpotifySong.id);

            if (!song) return next(action);

            // Fill in the missing metadata for down-stream processors
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

        // Handle the adding of multiple Spotify songs via playlist
        if (action.type === SpotifyActions.ADD_SPOTIFY_PLAYLIST) {
            const addSpotifyPlaylist = action as AddSpotifyPlaylistAction;
            const playlist = await getPlaylist(addSpotifyPlaylist.id);

            if (!playlist) return next(action);

            // Cap the songs that may be added to 10
            const trackCount = Math.min(playlist.tracks.items.length, 10);

            // Fill in the missing metadata for down-stream processors
            addSpotifyPlaylist.resolvedName = playlist.name;
            addSpotifyPlaylist.resolvedTrackCount = trackCount;

            // Loop through the first 10 songs and dispatch an action for adding each to the queue
            playlist.tracks.items.slice(0, trackCount).forEach(({ track }) => {
                store.dispatch(
                    addToQueue(
                        {
                            title: track.name,
                            artists: track.artists
                                .map((a) => a.name)
                                .join(", "),
                            thumbnail: track.album.images[0].url,
                            videoId: "",
                            requestor: addSpotifyPlaylist.requestor,
                            requestorChannel:
                                addSpotifyPlaylist.requestorChannel,
                        },
                        true // Bulk add operation flag
                    )
                );
            });

            // Send an embedding to show how many songs were added
            sendDiscordEmbed(
                {
                    title: playlist.name,
                    description: `${trackCount} songs added to the queue`,
                    thumbnail:
                        playlist.images.length > 0
                            ? { url: playlist.images[0].url }
                            : undefined,
                } as MessageEmbed,
                addSpotifyPlaylist.requestorChannel
            );

            return next(addSpotifyPlaylist);
        }

        // Handle adding of songs to the queue by search term (direct to Youtube)
        if (action.type === YoutubeActions.ADD_YOUTUBE_SONG) {
            const addYoutubeSong = action as AddYoutubeSongAction;
            const results = await getYoutubeResults(addYoutubeSong.query);

            // Make sure we got results back
            // TODO: Feedback for no results
            if (results.length > 0) {
                // Take the first result (TODO: more logic here?)
                const result = results[0];

                // Fill in missing metadata for down-stream processors
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
