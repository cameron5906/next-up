import { leaveDiscordVoiceChannel, setDiscordStatus } from "../../apis/discord";
import { QueuedSong } from "../../types";
import {
    addToHistory,
    CommandActions,
    LifecycleActions,
    playNextSong,
    PlayNextSongAction,
    QueueActions,
} from "../actions";
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

            if (queue.length > 0) {
                store.dispatch(playNextSong());
            } else {
                setDiscordStatus("");
                leaveDiscordVoiceChannel();
            }

            return;
        }

        // When a new song begins playing, add it to history
        if (action.type === QueueActions.PLAY_NEXT_SONG) {
            const { song } = action as PlayNextSongAction;
            if (!song) return;

            store.dispatch(addToHistory(song));
            return;
        }
    };
