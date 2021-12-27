import { TextChannel, User } from "discord.js";

export const MessageActions = {
    PROCESS_MESSAGE: "PROCESS_MESSAGE",
};

export interface ProcessMessageAction {
    type: string;
    text: string;
    sender: User;
    channel: TextChannel;
}

export const processMessage = (
    text: string,
    sender: User,
    channel: TextChannel
): ProcessMessageAction => ({
    type: MessageActions.PROCESS_MESSAGE,
    text,
    sender,
    channel,
});
