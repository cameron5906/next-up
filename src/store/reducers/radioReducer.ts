import { TextChannel, User } from "discord.js";
import {
    CommandActions,
    LifecycleActions,
    TextCommandAction,
} from "../actions";
import {
    AddArtistSeedAction,
    AddTrackSeedAction,
    RadioActions,
} from "../actions/radio";

export type RadioSeed = {
    type: "artist" | "track";
    id: string;
};

export type RadioState = {
    isPlaying: boolean;
    requestor: User | null;
    requestorChannel: TextChannel | null;
    seeds: RadioSeed[];
};

const defaultState: RadioState = {
    isPlaying: false,
    requestor: null,
    requestorChannel: null,
    seeds: [],
};

export const radioReducer = (
    state: RadioState = defaultState,
    action: any
): RadioState => {
    switch (action.type) {
        case CommandActions.START_RADIO: {
            const { user, channel } = action as TextCommandAction;
            return {
                ...state,
                isPlaying: true,
                requestor: user,
                requestorChannel: channel,
            };
        }

        case RadioActions.STOP_RADIO: {
            return {
                ...state,
                isPlaying: false,
                requestor: null,
                requestorChannel: null,
            };
        }

        case RadioActions.ADD_ARTIST_SEED: {
            const { id } = action as AddArtistSeedAction;
            return {
                ...state,
                seeds: [{ type: "artist", id }, ...state.seeds.slice(0, 4)],
            };
        }

        case RadioActions.ADD_TRACK_SEED: {
            const { id } = action as AddTrackSeedAction;
            return {
                ...state,
                seeds: [{ type: "track", id }, ...state.seeds.slice(0, 4)],
            };
        }

        case CommandActions.CLEAR_QUEUE: {
            return {
                ...state,
                isPlaying: false,
                seeds: [],
            };
        }
    }

    return state;
};
