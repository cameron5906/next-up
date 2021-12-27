/**
 * All actions relating to lifecycle events
 */

export const SongActions = {
    SONG_ENDED: "SONG_ENDED",
};

export interface SongAction {
    type: string;
}

export const songEnded = (): SongAction => ({
    type: SongActions.SONG_ENDED,
});
