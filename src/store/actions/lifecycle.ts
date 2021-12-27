/**
 * All actions relating to lifecycle events
 */

export const LifecycleActions = {
    SONG_ENDED: "SONG_ENDED",
};

export interface SongAction {
    type: string;
}

export const songEnded = (): SongAction => ({
    type: LifecycleActions.SONG_ENDED,
});
