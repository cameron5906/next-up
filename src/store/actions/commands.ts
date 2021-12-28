/**
 * All actions relating to text commands that can be provided to the bot
 */

import { TextChannel, User } from "discord.js";

export const CommandActions = {
    STOP_PLAYING: "STOP_PLAYING",
    SKIP_SONG: "SKIP_SONG",
    LIST_QUEUE: "LIST_QUEUE",
    CLEAR_QUEUE: "CLEAR_QUEUE",
    SHUFFLE_QUEUE: "SHUFFLE_QUEUE",
    LIST_COMMANDS: "LIST_COMMANDS",
    START_RADIO: "START_RADIO",
};

export interface TextCommandAction {
    type: string;
    user: User;
    channel: TextChannel;
}

export const stopPlaying = (
    user: User,
    channel: TextChannel
): TextCommandAction => ({
    type: CommandActions.STOP_PLAYING,
    user,
    channel,
});

export const skipSong = (
    user: User,
    channel: TextChannel
): TextCommandAction => ({
    type: CommandActions.SKIP_SONG,
    user,
    channel,
});

export const listQueue = (
    user: User,
    channel: TextChannel
): TextCommandAction => ({
    type: CommandActions.LIST_QUEUE,
    user,
    channel,
});

export const clearQueue = (
    user: User,
    channel: TextChannel
): TextCommandAction => ({
    type: CommandActions.CLEAR_QUEUE,
    user,
    channel,
});

export const shuffleQueue = (
    user: User,
    channel: TextChannel
): TextCommandAction => ({
    type: CommandActions.SHUFFLE_QUEUE,
    user,
    channel,
});

export const listCommands = (
    user: User,
    channel: TextChannel
): TextCommandAction => ({
    type: CommandActions.LIST_COMMANDS,
    user,
    channel,
});

export const startRadio = (
    user: User,
    channel: TextChannel
): TextCommandAction => ({
    type: CommandActions.START_RADIO,
    user,
    channel,
});
