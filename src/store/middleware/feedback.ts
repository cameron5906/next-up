import { MessageEmbed } from "discord.js";
import { sendDiscordEmbed } from "../../apis/discord";
import { QueueActions, AddToQueueAction, PlayNextSongAction } from "../actions";
import { ActiveSongState } from "../reducers";
import { Store } from "../store";

export const feedback =
    (store: Store) => (next: (action: any) => void) => (action: any) => {
        if (action.type === QueueActions.ADD_TO_QUEUE) {
            const {
                activeSong: { song: currentSong },
            } = store.getState() as { activeSong: ActiveSongState };

            if (currentSong !== null) {
                const {
                    title,
                    artists,
                    thumbnail,
                    requestorChannel,
                    position,
                } = action as AddToQueueAction;

                sendDiscordEmbed(
                    {
                        author: { name: artists },
                        title,
                        description: "Added to queue",
                        thumbnail: { url: thumbnail },
                        footer: { text: `Position #${(position || 0) + 1}` },
                    } as MessageEmbed,
                    requestorChannel
                );
            }
        }

        if (action.type === QueueActions.PLAY_NEXT_SONG) {
            const { song } = action as PlayNextSongAction;
            if (!song) return next(action);

            sendDiscordEmbed(
                {
                    author: { name: song.artists },
                    title: song.title,
                    description: "Now playing",
                    thumbnail: { url: song.thumbnail },
                    footer: { text: `Requested by ${song.requestor.username}` },
                } as MessageEmbed,
                song.requestorChannel
            );
        }

        next(action);
    };
