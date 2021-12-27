import { leaveDiscordVoiceChannel } from "../../apis/discord";
import { QueuedSong } from "../../types";
import { addToHistory, LifecycleActions, playNextSong } from "../actions";
import { ActiveSongState } from "../reducers";
import { Store } from "../store";

/**
 * Middleware for managing song lifecycles
 */
export const lifecycle =
    (store: Store) => (next: (action: any) => void) => (action: any) => {
        next(action);

        // If a song ends, check to see if a new one can be played from the queue
        // Otherwise, leave the current voice channel
        if (action.type === LifecycleActions.SONG_ENDED) {
            const {
                queue,
                activeSong: { song },
            } = store.getState() as {
                queue: QueuedSong[];
                activeSong: ActiveSongState;
            };

            // Add the song that just finished to the history state
            if (song) {
                store.dispatch(addToHistory(song));
            }

            if (queue.length > 0) {
                store.dispatch(playNextSong());
            } else {
                leaveDiscordVoiceChannel();
            }

            return;
        }
    };
