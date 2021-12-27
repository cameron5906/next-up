import { leaveDiscordVoiceChannel } from "../../apis/discord";
import { QueuedSong } from "../../types";
import { SongActions, playNextSong } from "../actions";
import { Store } from "../store";

export const lifecycle =
    (store: Store) => (next: (action: any) => void) => (action: any) => {
        next(action);

        if (action.type === SongActions.SONG_ENDED) {
            const { queue } = store.getState() as { queue: QueuedSong[] };

            if (queue.length > 0) {
                store.dispatch(playNextSong());
            } else {
                leaveDiscordVoiceChannel();
            }

            return;
        }
    };
