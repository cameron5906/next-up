import {
    AudioPlayerStatus,
    createAudioPlayer,
    NoSubscriberBehavior,
} from "@discordjs/voice";
import { onSongEnded } from "./playlist";

export const audioPlayer = createAudioPlayer({
    behaviors: {
        noSubscriber: NoSubscriberBehavior.Play, // Keep playing even if no one is listening / not on a voice channel
    },
});

export function stopPlaying() {
    console.log(`AudioManager.stopPlaying()`);

    if (audioPlayer.state.status === AudioPlayerStatus.Playing) {
        audioPlayer.stop();
    }
}

audioPlayer.on("stateChange", (oldState, newState) => {
    if (
        oldState.status === AudioPlayerStatus.Playing &&
        newState.status === AudioPlayerStatus.Idle
    ) {
        onSongEnded();
    }
});
