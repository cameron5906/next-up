import { MessageEmbed } from "discord.js";
import {
    sendDiscordEmbed,
    sendDiscordMessage,
    setDiscordStatus,
} from "../../apis/discord";
import {
    QueueActions,
    AddToQueueAction,
    PlayNextSongAction,
    CommandActions,
    TextCommandAction,
} from "../actions";
import { ActiveSongState } from "../reducers";
import { Store } from "../store";

/**
 * Middleware for providing text channel feedback for various lifecycle events
 */
export const feedback =
    (store: Store) => (next: (action: any) => void) => async (action: any) => {
        // Handle feedback for when a song is queued
        if (action.type === QueueActions.ADD_TO_QUEUE) {
            const {
                activeSong: { song: currentSong },
            } = store.getState() as { activeSong: ActiveSongState };

            // If a song is currently playing, send an embedding that states it was added to the queue
            if (currentSong !== null) {
                const {
                    title,
                    artists,
                    thumbnail,
                    requestorChannel,
                    position,
                    isBulk,
                } = action as AddToQueueAction;

                // If its a bulk add operation, don't send an embedding (spam)
                if (!isBulk) {
                    sendDiscordEmbed(
                        {
                            author: { name: artists },
                            title,
                            description: "Added to queue",
                            thumbnail: { url: thumbnail },
                            footer: {
                                text: `Position #${(position || 0) + 1}`,
                            }, // Offset position by one to avoid 0-based index
                        } as MessageEmbed,
                        requestorChannel
                    );
                }
            }
        }

        // Handle feedback for when a new song begins to play
        if (action.type === QueueActions.PLAY_NEXT_SONG) {
            const { song } = action as PlayNextSongAction;
            if (!song) return next(action);

            const message = await sendDiscordEmbed(
                {
                    author: { name: song.artists },
                    title: song.title,
                    description: "Now playing",
                    thumbnail: { url: song.thumbnail },
                    footer: { text: `Requested by ${song.requestor.username}` },
                } as MessageEmbed,
                song.requestorChannel
            );

            await setDiscordStatus(`${song.title} - ${song.artists}`);

            return next({ ...action, message });
        }

        // Handle feedback for when the queue is cleared
        if (action.type === CommandActions.CLEAR_QUEUE) {
            const { channel } = action as TextCommandAction;
            sendDiscordMessage("Queue cleared", channel);
        }

        // Handle feedback for when the queue is shuffled
        if (action.type === CommandActions.SHUFFLE_QUEUE) {
            const { channel } = action as TextCommandAction;
            sendDiscordMessage("Queue has been shuffled randomly", channel);
        }

        // Handle feedback for radio
        if (action.type === CommandActions.START_RADIO) {
            const { channel } = action as TextCommandAction;
            sendDiscordMessage(
                "Okay, starting the radio. Use `@NextUp stop` to go back to playing songs from the queue.",
                channel
            );
        }

        next(action);
    };
