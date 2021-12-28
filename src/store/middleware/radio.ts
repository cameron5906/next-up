import { TextChannel, User } from "discord.js";
import { sendDiscordMessage } from "../../apis/discord";
import { getRecommendedSong, getTrack } from "../../apis/spotify";
import { getYoutubeResults } from "../../apis/youtube";
import { playSongImmediately } from "../actions";
import { RadioActions, stopRadio } from "../actions/radio";
import { RadioState } from "../reducers/radioReducer";
import { Store } from "../store";

/**
 * Middleware for managing radio logic
 */
export const radio =
    (store: Store) => (next: (action: any) => void) => async (action: any) => {
        next(action);

        if (action.type === RadioActions.PLAY_NEXT_RADIO_SONG) {
            const { radio } = store.getState() as {
                radio: RadioState;
            };

            // Spotify has a limit of 5 seeds at once
            const seeds = radio.seeds.slice(0, 5);

            // Retrieve a recommended song based on previously played songs and artists as seeds
            const nextSong = await getRecommendedSong(
                seeds.filter((s) => s.type === "artist").map((s) => s.id),
                seeds.filter((s) => s.type === "track").map((s) => s.id)
            );

            // Retrieve the full track info with album data and Youtube results
            const trackInfo = nextSong ? await getTrack(nextSong?.id) : null;
            const youtubeResults = trackInfo
                ? await getYoutubeResults(
                      `${trackInfo.name} - ${trackInfo.artists
                          .map((a) => a.name)
                          .join(", ")} lyrics`
                  )
                : [];

            // Make sure we have everything we need
            if (trackInfo && youtubeResults.length) {
                const youtubeResult = youtubeResults[0];

                // Play the song immediately, bypassing the normal queue
                store.dispatch(
                    playSongImmediately({
                        title: trackInfo.name,
                        artists: trackInfo.artists
                            .map((a) => a.name)
                            .join(", "),
                        thumbnail: trackInfo.album.images[0].url,
                        videoId: youtubeResult.id.videoId,
                        spotifyArtistId: trackInfo.artists[0].id,
                        spotifyTrackId: trackInfo.id,
                        requestor: radio.requestor as User,
                        requestorChannel: radio.requestorChannel as TextChannel,
                    })
                );
            } else {
                // An issue happened when getting a radio song, stop the radio
                if (radio.requestorChannel) {
                    sendDiscordMessage(
                        "There was a problem retrieving the next radio song - switching back to queue",
                        radio.requestorChannel
                    );
                }
                store.dispatch(stopRadio());
            }
        }
    };
