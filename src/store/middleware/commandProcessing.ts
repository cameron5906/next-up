import {
    leaveDiscordVoiceChannel,
    sendDiscordEmbed,
    sendDiscordMessage,
} from "../../apis/discord";
import { QueuedSong } from "../../types";
import { CommandActions, TextCommandAction, songEnded } from "../actions";
import { ActiveSongState } from "../reducers";
import { Store } from "../store";
import { stopPlaying } from "../../audio-manager";
import { MessageEmbed } from "discord.js";
import { RadioState } from "../reducers/radioReducer";
import { stopRadio } from "../actions/radio";

/**
 * Middleware for processing of commands that can control the bot
 */
export const commandProcessing =
    (store: Store) => (next: (action: any) => void) => (action: any) => {
        // First verify there is a valid command here, otherwise break out
        if (!Object.values(CommandActions).includes(action.type))
            return next(action);

        const commandAction = action as TextCommandAction;

        switch (action.type) {
            // Help command
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

            // Listing current queue contents
            case CommandActions.LIST_QUEUE: {
                const {
                    queue,
                    activeSong: { song: activeSong },
                } = store.getState() as {
                    queue: QueuedSong[];
                    activeSong: ActiveSongState;
                };

                // Initialize the embedding that will be used
                const embedding: MessageEmbed = {} as MessageEmbed;

                // If there is an active song, set it as the title of the embedding
                if (activeSong !== null) {
                    embedding.title = `Now playing: ${activeSong.title}`;
                }

                // If there are songs in queue, include them in the description in numbered order
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

                // If no title has been set (no active song), set up a no active tracks embedding
                if (!embedding.title) {
                    embedding.title = "No active tracks";
                    embedding.description =
                        "Try saying @NextUp [your song here]";
                }

                // Send the embedding as a response
                sendDiscordEmbed(embedding, commandAction.channel);
                break;
            }

            // Skip the current song and dispatch an action
            case CommandActions.SKIP_SONG: {
                stopPlaying();
                store.dispatch(songEnded());
                break;
            }

            // Stop playing the active song
            case CommandActions.STOP_PLAYING: {
                const {
                    activeSong: { song: currentSong },
                    radio: { isPlaying: isRadioPlaying },
                } = store.getState() as {
                    activeSong: ActiveSongState;
                    radio: RadioState;
                };

                if (isRadioPlaying) {
                    store.dispatch(stopRadio());
                    return;
                } else if (currentSong !== null) {
                    stopPlaying();
                    leaveDiscordVoiceChannel();
                }

                break;
            }

            case CommandActions.START_RADIO: {
                const { channel } = action as TextCommandAction;
                const { radio } = store.getState() as {
                    radio: RadioState;
                };

                // Check to see if the radio has seeds from previously played songs
                if (radio.seeds.length === 0) {
                    sendDiscordMessage(
                        `Before you can use radio, you need to play a few songs first.`,
                        channel
                    );
                    return;
                }
            }
        }

        next(action);
    };
