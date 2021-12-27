import { TextChannel, User } from "discord.js";
import { createAudioResource, AudioPlayerStatus } from "@discordjs/voice";
import { getYoutubeResults } from "./apis/youtube";
import { QueueSongOperation } from "./types/QueueSongOperation";
import { getAudioStream, getDownloadUrl } from "./download-manager";
import { QueuedSong } from "./types/QueuedSong";
import { audioPlayer } from "./audio-manager";
import {
    activeVoiceChannel,
    getActiveVoiceChannel,
    leaveVoiceChannel,
    setVoiceChannel,
} from "./apis/discord";
import { onNewSongPlaying } from ".";
import { QueueSongResult } from "./types/QueueSongResult";
import { shuffle } from "./util";

const queue: QueuedSong[] = [];
let activeSong: QueuedSong | null = null;

export async function addToPlaylist(
    isYoutube: boolean,
    query: string,
    requestor: User,
    textChannel: TextChannel,
    artists: string = "",
    thumbnail: string = ""
): Promise<QueueSongResult> {
    let videoId = "";
    let title = "";

    // If we're sourcing from YouTube, retrieve first result and set videoId and title
    if (isYoutube) {
        const results = await getYoutubeResults(query);

        if (results.length === 0)
            return { status: QueueSongOperation.NOT_FOUND };

        title = results[0].snippet.title;
        videoId = results[0].id.videoId;
        artists = results[0].snippet.channelTitle;
        thumbnail = results[0].snippet.thumbnails.default.url;

        if (queue.some((s) => s.videoId === results[0].id.videoId))
            return { status: QueueSongOperation.ALREADY_ADDED };
    } else {
        // If we are not sourcing from YouTube, set the title to the supplied (programmatic) query in this case
        // The videoId is fetched later when the song is ready to play
        title = query;
    }

    console.log(`Pushing ${title} to queue (input: ${query})`);

    // Add the song details to the queue
    queue.push({
        query,
        artists,
        thumbnail,
        title,
        requestor: requestor,
        requestorChannel: textChannel,
        videoId,
    });

    // If the song that was just added is the only one in queue, start it immediately
    if (
        queue.length === 1 &&
        audioPlayer.state.status !== AudioPlayerStatus.Playing
    ) {
        await playNext();
    }

    // Return queue information
    return {
        status: QueueSongOperation.ADDED,
        position:
            audioPlayer.state.status === AudioPlayerStatus.Playing
                ? queue.length
                : 0,
    };
}

export async function onSongEnded() {
    console.log("Active song ended");

    activeSong = null;

    if (queue.length === 0) {
        // If the queue is empty, leave the active voice channel
        leaveVoiceChannel();
    } else {
        // Otherwise, play the next song in line
        await playNext();
    }
}

export function getQueue() {
    return queue;
}

async function playNext() {
    console.log("Playing next song");

    // Pull the next song off of the queue
    const queuedSong = queue.splice(0, 1)[0];

    let videoId = "";

    // If no videoId was already found for this request, find and assign it now
    if (queuedSong.videoId === "") {
        const results = await getYoutubeResults(queuedSong.title);
        videoId = results[0].id.videoId;
    }

    // Retrieve the download URL from Google's servers
    const downloadUrl = await getDownloadUrl(videoId);

    // If it wasn't found, return
    // TODO: will want to progress to next song
    if (!downloadUrl) {
        return QueueSongOperation.FAILED;
    }

    // Find the voice channel of the person who requested the song
    const requestorVoiceChannel = await getActiveVoiceChannel(
        queuedSong.requestorChannel,
        queuedSong.requestor
    );

    // If we're not already connected to that voice channel, go to it
    if (
        requestorVoiceChannel !== null &&
        activeVoiceChannel?.id !== requestorVoiceChannel?.id
    ) {
        leaveVoiceChannel();
        setVoiceChannel(requestorVoiceChannel);
    }

    // Begin playing the song
    activeSong = queuedSong;
    audioPlayer.play(createAudioResource(await getAudioStream(downloadUrl)));

    // Notify new song info
    onNewSongPlaying(queuedSong);
}

export function getActiveSong() {
    return activeSong;
}

export function clearQueue() {
    console.log("Clearing queue");
    queue.length = 0;
}

export function shuffleQueue() {
    console.log("Shuffling queue");
    shuffle(queue);
}
