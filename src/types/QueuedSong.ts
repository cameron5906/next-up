import { TextChannel, User } from "discord.js";

export interface QueuedSong {
    query?: string;
    title: string;
    artists: string;
    thumbnail: string;
    requestor: User;
    requestorChannel: TextChannel;
    videoId: string;
    spotifyArtistId?: string;
    spotifyTrackId?: string;
}
