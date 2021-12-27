import { QueuedSong } from "../../types/QueuedSong";
import { PlayNextSongAction, QueueActions } from "../actions/queue";
import { LifecycleActions } from "../actions/lifecycle";

export type ActiveSongState = {
    song: QueuedSong | null;
};

const defaultState: ActiveSongState = {
    song: null,
};

export const activeSongReducer = (
    state: ActiveSongState = defaultState,
    action: any
): ActiveSongState => {
    switch (action.type) {
        case LifecycleActions.SONG_ENDED: {
            return { ...state, song: null };
        }

        case QueueActions.PLAY_NEXT_SONG: {
            const { song } = action as PlayNextSongAction;
            if (!song) return state;

            return { ...state, song };
        }
    }

    return state;
};
