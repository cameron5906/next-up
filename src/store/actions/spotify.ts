/**
 * All actions relating to Spotify
 */

import { TextChannel, User } from "discord.js";

export const SpotifyActions = {
    ADD_SPOTIFY_SONG: "ADD_SPOTIFY_SONG",
    ADD_SPOTIFY_PLAYLIST: "ADD_SPOTIFY_PLAYLIST",
};

export interface AddSpotifySongAction {
    type: string;
    id: string;
    requestor: User;
    requestorChannel: TextChannel;
    resolvedTitle?: string;
    resolvedArtists?: string;
    resolvedThumbnail?: string;
}

export const addSpotifySong = (
    id: string,
    requestor: User,
    requestorChannel: TextChannel
): AddSpotifySongAction => ({
    type: SpotifyActions.ADD_SPOTIFY_SONG,
    id,
    requestor,
    requestorChannel,
});

export interface AddSpotifyPlaylistAction {
    type: string;
    id: string;
    requestor: User;
    requestorChannel: TextChannel;
    resolvedName?: string;
    resolvedTrackCount?: number;
}

export const addSpotifyPlaylist = (
    id: string,
    requestor: User,
    requestorChannel: TextChannel
): AddSpotifyPlaylistAction => ({
    type: SpotifyActions.ADD_SPOTIFY_PLAYLIST,
    id,
    requestor,
    requestorChannel,
});
