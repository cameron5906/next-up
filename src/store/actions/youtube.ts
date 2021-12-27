/**
 * All actions relating to Youtube
 */

import { TextChannel, User } from "discord.js";

export const YoutubeActions = {
    ADD_YOUTUBE_SONG: "ADD_YOUTUBE_SONG",
};

export interface AddYoutubeSongAction {
    type: string;
    query: string;
    resolvedTitle?: string;
    resolvedArtists?: string;
    resolvedThumbnail?: string;
    resolvedVideoId?: string;
    requestor: User;
    requestorChannel: TextChannel;
}

export const addYoutubeSong = (
    query: string,
    requestor: User,
    requestorChannel: TextChannel
): AddYoutubeSongAction => ({
    type: YoutubeActions.ADD_YOUTUBE_SONG,
    query,
    requestor,
    requestorChannel,
});
