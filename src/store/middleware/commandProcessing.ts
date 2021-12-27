import { sendDiscordEmbed, sendDiscordMessage } from "../../apis/discord";
import { QueuedSong } from "../../types";
import { CommandActions, TextCommandAction, songEnded } from "../actions";
import { ActiveSongState } from "../reducers";
import { Store } from "../store";
import { stopPlaying } from "../../audio-manager";
import { MessageEmbed } from "discord.js";

export const commandProcessing =
    (store: Store) => (next: (action: any) => void) => (action: any) => {
        if (
            ![
                CommandActions.CLEAR_QUEUE,
                CommandActions.LIST_COMMANDS,
                CommandActions.LIST_QUEUE,
                CommandActions.SHUFFLE_QUEUE,
                CommandActions.SKIP_SONG,
                CommandActions.STOP_PLAYING,
            ].some((t) => action.type === t)
        )
            return next(action);

        const commandAction = action as TextCommandAction;

        switch (action.type) {
            case CommandActions.CLEAR_QUEUE: {
                sendDiscordMessage("Queue cleared", commandAction.channel);
                break;
            }

            case CommandActions.LIST_COMMANDS: {
                sendDiscordMessage(
                    [
                        "Valid commands:",
                        "`@NextUp [song name]` - Add a song",
                        "`@NextUp [spotify song url]` - Add a song from Spotify",
                        "`@NextUp [spotify playlist url]` - Add an entire playlist of songs from Spotify (limit 10)",
                        "`@NextUp queue` - List queued songs",
                        "`@NextUp clear` - Clears the song queue",
                        "`@NextUp stop` - Stops the current song",
                        "`@NextUp shuffle` - Shuffles the current queue of songs randomly",
                        "`@NextUp` - Moves to the next song in queue",
                    ].join("\n"),
                    commandAction.channel
                );
                break;
            }

            case CommandActions.LIST_QUEUE: {
                const {
                    queue,
                    activeSong: { song: activeSong },
                } = store.getState() as {
                    queue: QueuedSong[];
                    activeSong: ActiveSongState;
                };

                const embedding: MessageEmbed = {} as MessageEmbed;

                if (activeSong !== null) {
                    embedding.title = `Now playing: ${activeSong.title}`;
                }

                if (queue.length > 0) {
                    embedding.description = [
                        "Next up:",
                        ...queue.map(
                            (s, idx) =>
                                `#${idx + 1} ${s.title} [${
                                    s.requestor.username
                                }]`
                        ),
                    ].join("\n");
                }

                if (!embedding.title) {
                    embedding.title = "No active tracks";
                    embedding.description =
                        "Try saying @NextUp [your song here]";
                }

                sendDiscordEmbed(embedding, commandAction.channel);
                break;
            }

            case CommandActions.SHUFFLE_QUEUE: {
                sendDiscordMessage(
                    "Queue has been shuffled randomly",
                    commandAction.channel
                );
                break;
            }

            case CommandActions.SKIP_SONG: {
                stopPlaying();
                store.dispatch(songEnded());
                break;
            }

            case CommandActions.STOP_PLAYING: {
                stopPlaying();
                break;
            }
        }

        next(action);
    };
