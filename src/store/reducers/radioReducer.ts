import { TextChannel, User } from "discord.js";

export type RadioState = {
    isPlaying: boolean;
    requestor: User | null;
    requestorChannel: TextChannel | null;
};

const defaultState: RadioState = {
    isPlaying: false,
    requestor: null,
    requestorChannel: null,
};

export const radioReducer = (
    state: RadioState = defaultState,
    action: any
): RadioState => {
    switch (action.type) {
    }

    return state;
};
