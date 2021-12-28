import {
    MessageActions,
    ProcessMessageAction,
    addSpotifySong,
    addSpotifyPlaylist,
    skipSong,
    listQueue,
    clearQueue,
    stopPlaying,
    shuffleQueue,
    listCommands,
    addYoutubeSong,
    startRadio,
} from "../actions";
import { Store } from "../store";

/**
 * Middleware for translating incoming messages into high-level actions
 */
export const textProcessing =
    (store: Store) => (next: (action: any) => void) => async (action: any) => {
        if (action.type !== MessageActions.PROCESS_MESSAGE) return next(action);

        const { text, sender, channel } = action as ProcessMessageAction;

        // Check for Spotify song URL
        if (text.indexOf("open.spotify.com/track/") !== -1) {
            const trackId = text
                .split("open.spotify.com/track/")[1]
                .split("?")[0]
                .split(" ")[0];

            next(action);
            await store.dispatch(addSpotifySong(trackId, sender, channel));
            return;
        }

        // Check for Spotify playlist URL
        if (text.indexOf("open.spotify.com/playlist/") !== -1) {
            const playlistId = text
                .split("open.spotify.com/playlist/")[1]
                .split("?")[0]
                .split(" ")[0];

            next(action);
            await store.dispatch(
                addSpotifyPlaylist(playlistId, sender, channel)
            );
            return;
        }

        // Check for empty command, treat as Skip (@NextUp)
        if (text === "") {
            // Increment queue
            next(action);
            store.dispatch(skipSong(sender, channel));
            return;
        }

        // Check for text commands
        switch (text) {
            case "queue":
                next(action);
                store.dispatch(listQueue(sender, channel));
                return;
            case "clear":
                next(action);
                store.dispatch(clearQueue(sender, channel));
                return;
            case "stop":
                next(action);
                store.dispatch(stopPlaying(sender, channel));
                return;
            case "shuffle":
                next(action);
                store.dispatch(shuffleQueue(sender, channel));
                return;
            case "help":
            case "commands":
                next(action);
                store.dispatch(listCommands(sender, channel));
                return;
            case "radio":
            case "start radio":
            case "play radio":
                next(action);
                store.dispatch(startRadio(sender, channel));
                return;
        }

        // If nothing was fulfilled above, treat it as a song search
        next(action);
        await store.dispatch(addYoutubeSong(text, sender, channel));
    };
