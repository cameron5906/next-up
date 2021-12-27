import { QueuedSong } from "../../types/QueuedSong";
import { PlayNextSongAction, QueueActions } from "../actions/queue";
import { LifecycleActions } from "../actions/lifecycle";
import { Message } from "discord.js";

export type ActiveSongState = {
    song: QueuedSong | null;
    nowPlayingMessage: Message | null;
};

const defaultState: ActiveSongState = {
    song: null,
    nowPlayingMessage: null,
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
            const { song, message } = action as PlayNextSongAction;
            if (!song || !message) return state;

            return { ...state, song, nowPlayingMessage: message };
        }
    }

    return state;
};
