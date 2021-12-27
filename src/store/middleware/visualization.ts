import { ColorResolvable, MessageEmbed } from "discord.js";
import { rgbToHex } from "../../util";
import { LifecycleActions, PlayNextSongAction, QueueActions } from "../actions";
import { ActiveSongState } from "../reducers";
import { Store } from "../store";

let vizInterval: number = -1;
let songStartAt: number = -1;

/**
 * Handles real-time visualization logic while a song is playing (i.e elapsed time, colors)
 */
export const visualization =
    (store: Store) => (next: (action: any) => void) => (action: any) => {
        next(action);

        if (action.type === QueueActions.PLAY_NEXT_SONG) {
            const playNextSong = action as PlayNextSongAction;
            songStartAt = Date.now();

            clearInterval(vizInterval);
            vizInterval = (<unknown>setInterval(() => {
                const {
                    activeSong: { nowPlayingMessage, song },
                } = store.getState() as {
                    activeSong: ActiveSongState;
                };

                if (!nowPlayingMessage) return;

                const [r, g, b] = getRandomRgb();
                const hexColor: string = rgbToHex(r, g, b);

                nowPlayingMessage.edit({
                    embeds: [
                        {
                            author: { name: song?.artists },
                            title: song?.title,
                            description: `Now playing (${getElapsedString(
                                Date.now() - songStartAt
                            )})`,
                            thumbnail: { url: song?.thumbnail },
                            color: hexColor as any,
                            footer: {
                                text: `Requested by ${song?.requestor.username}`,
                            },
                        },
                    ],
                });
            }, 2500)) as number;
        }

        if (action.type === LifecycleActions.SONG_ENDED) {
            clearInterval(vizInterval);
        }
    };

function getRandomRgb() {
    var num = Math.round(0xffffff * Math.random());
    var r = num >> 16;
    var g = (num >> 8) & 255;
    var b = num & 255;
    return [r, g, b];
}

function getElapsedString(time: number) {
    if (time < 1000) return "00:00";

    const seconds = Math.floor(time / 1000);

    if (seconds > 59) {
        const mins = Math.floor(seconds / 60);
        return `${mins.toString().padStart(2, "0")}:${(seconds % 60)
            .toString()
            .padStart(2, "0")}`;
    } else {
        return `00:${seconds.toString().padStart(2, "0")}`;
    }
}
