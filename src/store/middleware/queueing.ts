import { createAudioResource } from "@discordjs/voice";
import {
    getDiscordUserVoiceChannel,
    activeVoiceChannel,
    leaveDiscordVoiceChannel,
    setActiveDiscordVoiceChannel,
} from "../../apis/discord";
import { getYoutubeResults } from "../../apis/youtube";
import { audioPlayer } from "../../audio-manager";
import { getDownloadUrl, getAudioStream } from "../../download-manager";
import { QueuedSong, QueueSongOperation } from "../../types";
import {
    QueueActions,
    playNextSong,
    PlaySongImmediateAction,
} from "../actions";
import { ActiveSongState } from "../reducers";
import { Store } from "../store";

/**
 * Middleware for queue management
 */
export const queueing =
    (store: Store) => (next: (action: any) => void) => async (action: any) => {
        // A song is being added to the queue
        if (action.type === QueueActions.ADD_TO_QUEUE) {
            const state = store.getState();

            // Re-write the action for down-stream processors to know about the position of the song in queue
            next({
                ...action,
                position: state.queue.length,
            });

            // Retrieve the current queue and active song states
            const {
                queue: newQueue,
                activeSong: { song: currentSong },
            } = store.getState() as {
                queue: QueuedSong[];
                activeSong: ActiveSongState;
            };

            // If only the added song is in queue and there is no active song, play it immediately
            if (newQueue.length === 1 && currentSong === null) {
                store.dispatch(playNextSong());
            }

            return;
        }

        // Begin playing the next song in queue
        if (action.type === QueueActions.PLAY_NEXT_SONG) {
            const { queue } = store.getState() as { queue: QueuedSong[] };
            if (queue.length === 0) return next(action);

            // Include which song is now playing for down-stream processors
            next({ ...action, song: queue[0] });

            const song = queue[0];
            await play(song);

            return;
        }

        if (action.type === QueueActions.PLAY_SONG_IMMEDIATE) {
            const { song } = action as PlaySongImmediateAction;

            // Override this action making it look like PLAY_NEXT_SONG for down-stream event processing
            next({ type: QueueActions.PLAY_NEXT_SONG, song });

            await play(song);

            return;
        }

        next(action);
    };

async function play(song: QueuedSong) {
    console.log("Playing next song");

    let videoId = song.videoId || "";

    // If no videoId was already found for this request, find and assign it now
    if (videoId === "") {
        console.log(`Resolving Youtube video ID for ${song.title}`);
        const results = await getYoutubeResults(
            `${song.title} by ${song.artists} lyrics`
        );
        videoId = results[0].id.videoId;
    }

    if (videoId === "") {
        console.log("Failed to find video ID");
        return;
    }

    // Retrieve the download URL from Google's servers
    const downloadUrl = await getDownloadUrl(videoId);

    // If it wasn't found, return
    // TODO: will want to progress to next song
    if (!downloadUrl) {
        console.log("Could not retrieve download URL");
        return QueueSongOperation.FAILED;
    }

    // Find the voice channel of the person who requested the song
    const requestorVoiceChannel = await getDiscordUserVoiceChannel(
        song.requestorChannel,
        song.requestor
    );

    // If we're not already connected to that voice channel, go to it
    if (
        requestorVoiceChannel !== null &&
        activeVoiceChannel?.id !== requestorVoiceChannel?.id
    ) {
        leaveDiscordVoiceChannel();
        setActiveDiscordVoiceChannel(requestorVoiceChannel);
    }

    // Begin playing the song
    audioPlayer.play(createAudioResource(await getAudioStream(downloadUrl)));
}
