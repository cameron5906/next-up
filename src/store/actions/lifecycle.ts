/**
 * All actions relating to lifecycle events
 */

import { QueuedSong } from "../../types";

export const LifecycleActions = {
    SONG_ENDED: "SONG_ENDED",
    ADD_TO_HISTORY: "ADD_TO_HISTORY",
};

export interface SongAction {
    type: string;
}

export const songEnded = (): SongAction => ({
    type: LifecycleActions.SONG_ENDED,
});

export interface AddToHistoryAction {
    type: string;
    song: QueuedSong;
}

export const addToHistory = (song: QueuedSong) => ({
    type: LifecycleActions.ADD_TO_HISTORY,
    song,
});
