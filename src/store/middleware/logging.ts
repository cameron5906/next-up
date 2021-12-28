import { Store } from "../store";

/**
 * Simple logging middleware for debugging
 */
export const logging =
    (store: Store) => (next: (action: any) => void) => (action: any) => {
        console.log(
            JSON.stringify(
                {
                    ...action,
                    user: action.user
                        ? `[USER: ${action.user.username}]`
                        : undefined,
                    channel: action.channel
                        ? `[CHANNEL: ${action.channel.name}]`
                        : undefined,
                    sender: action.sender
                        ? `[USER: ${action.sender.username}]`
                        : undefined,
                    requestorChannel: action.requestorChannel
                        ? `[CHANNEL: ${action.requestorChannel.name}]`
                        : undefined,
                    requestor: action.requestor
                        ? `[USER: ${action.requestor.username}]`
                        : undefined,
                    song: action.song
                        ? `[SONG: ${action.song.title} by ${action.song.artists}]`
                        : undefined,
                },
                null,
                4
            )
        );

        next(action);
    };
