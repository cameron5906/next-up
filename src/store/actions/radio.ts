export const RadioActions = {
    ADD_ARTIST_SEED: "ADD_ARTIST_SEED",
    ADD_TRACK_SEED: "ADD_TRACK_SEED",
    STOP_RADIO: "STOP_RADIO",
    PLAY_NEXT_RADIO_SONG: "PLAY_NEXT_RADIO_SONG",
};

export interface AddArtistSeedAction {
    type: string;
    id: string;
}

export const addRadioArtistSeed = (id: string): AddArtistSeedAction => ({
    type: RadioActions.ADD_ARTIST_SEED,
    id,
});

export interface AddTrackSeedAction {
    type: string;
    id: string;
}

export const addRadioTrackSeed = (id: string): AddTrackSeedAction => ({
    type: RadioActions.ADD_TRACK_SEED,
    id,
});

export const stopRadio = () => ({
    type: RadioActions.STOP_RADIO,
});

export const playNextRadioSong = () => ({
    type: RadioActions.PLAY_NEXT_RADIO_SONG,
});
