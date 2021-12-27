import { Channel, TextChannel, User } from "discord.js";

export interface QueuedSong {
    query?: string;
    title: string;
    requestor: User;
    requestorChannel: TextChannel;
    videoId: string;
}
