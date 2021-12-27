import dotenv from "dotenv";

// Setup env vars
dotenv.config();

import { EmbedField, Message, TextChannel } from "discord.js";
import {
    activeVoiceChannel,
    discordClient,
    setDiscordStatus,
} from "./apis/discord";
import {
    addToPlaylist,
    clearQueue,
    getActiveSong,
    getQueue,
    onSongEnded,
    shuffleQueue,
} from "./song-queue";
import { QueueSongOperation } from "./types/QueueSongOperation";
import { QueuedSong } from "./types/QueuedSong";
import { getPlaylist, getTrack, setupSpotify } from "./apis/spotify";
import { audioPlayer, stopPlaying } from "./audio-manager";
import { AudioPlayerStatus } from "@discordjs/voice";

const { DISCORD_BOT_TOKEN } = process.env;

export async function onMessage(message: Message, localId: string) {
    // Clean the @NextUp tag out of the message
    const query = message.content.split(`<@!${localId}>`)[1].trim();

    // If no command given and message is just a mention, try to go to next song if applicable
    if (query.length === 0) {
        const queue = getQueue();
        if (audioPlayer.state.status === AudioPlayerStatus.Playing) {
            message.channel.send({
                content: `Okay, moving on...`,
            });
            stopPlaying();
            onSongEnded();
        }

        return;
    }

    // Help command
    if (query === "help") {
        message.channel.send({
            content: `Valid commands:
\`@NextUp [song name]\` - Add a song
\`@NextUp [spotify song url]\` - Add a song from Spotify
\`@NextUp [spotify playlist url]\` - Add an entire playlist of songs from Spotify (limit 10)
\`@NextUp queue\` - List queued songs
\`@NextUp clear\` - Clears the song queue
\`@NextUp stop\` - Stops the current song
\`@NextUp shuffle\` - Shuffles the current queue of songs randomly
\`@NextUp\` - Moves to the next song in queue
`,
        });
        return;
    }

    // Queue list command
    if (query === "queue") {
        const queue = getQueue();

        let messageLines: string[] = [];
        if (getActiveSong() !== null) {
            messageLines.push(
                `Playing - ${getActiveSong()?.title} (requested by ${
                    getActiveSong()?.requestor.username
                })`
            );
        }

        if (queue.length > 0) {
            messageLines = [
                ...messageLines,
                "In Queue:",
                ...queue.map(
                    (s, idx) =>
                        `#${idx + 1} ${s.title} (requested by ${
                            s.requestor.username
                        })`
                ),
            ];
        }

        if (messageLines.length === 0) {
            message.channel.send({ content: "Nothing is queued up" });
            return;
        }

        message.channel.send({
            content: messageLines.join("\n"),
        });

        return;
    }

    // Clear command
    if (query === "clear") {
        clearQueue();
        message.channel.send({ content: "Queue has been cleared" });
        return;
    }

    // Stop command
    if (query === "stop") {
        stopPlaying();
        return;
    }

    if (query === "shuffle" && getQueue().length > 0) {
        message.channel.send({ content: "Queue has been shuffled" });
        shuffleQueue();
        return;
    }

    // Spotify playlist command
    if (
        query.indexOf("spotify:") === 0 ||
        query.indexOf("open.spotify.com/playlist/") !== -1
    ) {
        let playlistId = "";

        if (query.indexOf("spotify:") !== -1) {
            const parts = query.split(":");
            if (parts.length !== 3 || parts[1] !== "playlist") {
                message.channel.send({
                    content: `I can only do Spotify playlists right now`,
                });
            }

            playlistId = parts[2];
        } else {
            playlistId = query.split("spotify.com/playlist/")[1].split("?")[0];
        }

        const playlist = await getPlaylist(playlistId);

        if (playlist) {
            const trackCount = Math.min(playlist.tracks.items.length, 10);

            playlist.tracks.items.slice(0, trackCount).forEach(({ track }) =>
                addToPlaylist(
                    false,
                    `${track.name} - ${track.artists
                        .slice(0, 2)
                        .map((a) => a.name)
                        .join(", ")}`,
                    message.author,
                    message.channel as TextChannel
                )
            );

            message.channel.send({
                content: `Adding ${trackCount} songs from "${playlist?.name}" from Spotify`,
            });
        }

        return;
    }

    if (query.indexOf("open.spotify.com/track/") !== -1) {
        const track = await getTrack(
            query.split("spotify.com/track/")[1].split("?")[0]
        );

        if (track) {
            addToPlaylist(
                false,
                `${track.name} - ${track.artists.map((a) => a.name)}`,
                message.author,
                message.channel as TextChannel,
                track.artists.map((a) => a.name).join(", "),
                track.album.images[0].url
            );

            message.channel.send({
                embeds: [
                    {
                        title: track.name,
                        description: "Added to queue",
                        thumbnail: {
                            url: track.album.images[0].url,
                            width: 32,
                            height: 32,
                        },
                        author: { name: track.artists[0].name },
                        footer: { text: `Position #${getQueue().length}` },
                    },
                ],
            });
        }

        return;
    }

    // Attempt to add to the playlist
    const result = await addToPlaylist(
        true,
        query,
        message.author,
        message.channel as TextChannel
    );

    if (result.status === QueueSongOperation.ADDED && getQueue().length === 0)
        return;

    // Send feedback response
    message.channel.send({
        content: (() => {
            switch (result.status) {
                case QueueSongOperation.ADDED:
                    return `Added to queue (${
                        result.position === 0
                            ? "next up"
                            : `#${result.position}`
                    })`;
                case QueueSongOperation.ALREADY_ADDED:
                    return `Already in queue`;
                case QueueSongOperation.FAILED:
                    return `An error occurred while adding to queue`;
                case QueueSongOperation.NOT_FOUND:
                    return `I wasn't able to find that one`;
            }
        })(),
    });
}

export async function onNewSongPlaying(song: QueuedSong) {
    const queue = getQueue();
    let fields: EmbedField[] = [];

    if (queue.length > 0) {
        fields.push({ name: "Next up", value: queue[0].title, inline: true });
    }

    // Notify song playing in channel it was requested
    song.requestorChannel.send({
        embeds: [
            {
                author: { name: song.artists || undefined },
                title: song.title,
                description: "Now playing",
                fields,
                footer: { text: `Requested by ${song.requestor.username}` },
            },
        ],
    });

    setDiscordStatus(`${song.title} in ${activeVoiceChannel?.name}`);
}

discordClient.login(DISCORD_BOT_TOKEN);
setupSpotify();

process.on("uncaughtException", (e) => console.log(e));
