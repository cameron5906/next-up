import { leaveDiscordVoiceChannel, setDiscordStatus } from "../../apis/discord";
import { QueuedSong } from "../../types";
import {
    addToHistory,
    LifecycleActions,
    playNextSong,
    PlayNextSongAction,
    QueueActions,
} from "../actions";
import {
    addRadioArtistSeed,
    addRadioTrackSeed,
    playNextRadioSong,
    RadioActions,
} from "../actions/radio";
import { ActiveSongState } from "../reducers";
import { RadioState } from "../reducers/radioReducer";
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
                radio,
            } = store.getState() as {
                queue: QueuedSong[];
                activeSong: ActiveSongState;
                radio: RadioState;
            };

            if (radio.isPlaying) {
                store.dispatch(playNextRadioSong());
            } else {
                if (queue.length > 0) {
                    store.dispatch(playNextSong());
                } else {
                    setDiscordStatus("");
                    leaveDiscordVoiceChannel();
                }
            }

            return;
        }

        // When a new song begins playing, add it to history
        if (action.type === QueueActions.PLAY_NEXT_SONG) {
            const { song } = action as PlayNextSongAction;
            if (!song) return;

            if (song.spotifyArtistId) {
                store.dispatch(addRadioArtistSeed(song.spotifyArtistId));
            }

            if (song.spotifyTrackId) {
                store.dispatch(addRadioTrackSeed(song.spotifyTrackId));
            }

            store.dispatch(addToHistory(song));
            return;
        }

        // If the radio is stopped, try to continue playing from the queue
        if (action.type === RadioActions.STOP_RADIO) {
            const { queue } = store.getState() as { queue: QueuedSong[] };

            if (queue.length > 0) {
                store.dispatch(playNextSong());
            }

            return;
        }
    };
