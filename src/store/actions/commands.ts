/**
 * All actions relating to text commands that can be provided to the bot
 */

import { TextChannel } from "discord.js";

export const CommandActions = {
    STOP_PLAYING: "STOP_PLAYING",
    SKIP_SONG: "SKIP_SONG",
    LIST_QUEUE: "LIST_QUEUE",
    CLEAR_QUEUE: "CLEAR_QUEUE",
    SHUFFLE_QUEUE: "SHUFFLE_QUEUE",
    LIST_COMMANDS: "LIST_COMMANDS",
};

export interface TextCommandAction {
    type: string;
    channel: TextChannel;
}

export const stopPlaying = (channel: TextChannel): TextCommandAction => ({
    type: CommandActions.STOP_PLAYING,
    channel,
});

export const skipSong = (channel: TextChannel): TextCommandAction => ({
    type: CommandActions.SKIP_SONG,
    channel,
});

export const listQueue = (channel: TextChannel): TextCommandAction => ({
    type: CommandActions.LIST_QUEUE,
    channel,
});

export const clearQueue = (channel: TextChannel): TextCommandAction => ({
    type: CommandActions.CLEAR_QUEUE,
    channel,
});

export const shuffleQueue = (channel: TextChannel): TextCommandAction => ({
    type: CommandActions.SHUFFLE_QUEUE,
    channel,
});

export const listCommands = (channel: TextChannel): TextCommandAction => ({
    type: CommandActions.LIST_COMMANDS,
    channel,
});
