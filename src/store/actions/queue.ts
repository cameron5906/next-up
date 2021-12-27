import { QueuedSong } from "../../types/QueuedSong";

export const QueueActions = {
    ADD_TO_QUEUE: "ADD_TO_QUEUE",
    PLAY_NEXT_SONG: "PLAY_NEXT_SONG",
};

export type AddToQueueAction = {
    type: string;
    position?: number;
} & QueuedSong;

export const addToQueue = (song: QueuedSong): AddToQueueAction => ({
    type: QueueActions.ADD_TO_QUEUE,
    ...song,
});

export interface PlayNextSongAction {
    type: string;
    song?: QueuedSong;
}

export const playNextSong = (): PlayNextSongAction => ({
    type: QueueActions.PLAY_NEXT_SONG,
});
