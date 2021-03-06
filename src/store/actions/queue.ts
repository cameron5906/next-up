/**
 * All actions relating to queue control
 */

import { Message } from "discord.js";
import { QueuedSong } from "../../types/QueuedSong";

export const QueueActions = {
    ADD_TO_QUEUE: "ADD_TO_QUEUE",
    PLAY_NEXT_SONG: "PLAY_NEXT_SONG",
    PLAY_SONG_IMMEDIATE: "PLAY_SONG_IMMEDIATE",
};

export type AddToQueueAction = {
    type: string;
    position?: number;
    isBulk: boolean;
} & QueuedSong;

export const addToQueue = (
    song: QueuedSong,
    isBulk: boolean = false
): AddToQueueAction => ({
    type: QueueActions.ADD_TO_QUEUE,
    ...song,
    isBulk,
});

export interface PlayNextSongAction {
    type: string;
    song?: QueuedSong;
    message?: Message;
}

export const playNextSong = (): PlayNextSongAction => ({
    type: QueueActions.PLAY_NEXT_SONG,
});

export interface PlaySongImmediateAction {
    type: string;
    song: QueuedSong;
}

export const playSongImmediately = (song: QueuedSong) => ({
    type: QueueActions.PLAY_SONG_IMMEDIATE,
    song,
});
