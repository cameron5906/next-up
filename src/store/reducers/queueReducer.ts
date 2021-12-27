import { QueuedSong } from "../../types/QueuedSong";
import { shuffle } from "../../util";
import { CommandActions } from "../actions/commands";
import { AddToQueueAction, QueueActions } from "../actions/queue";

export const queueReducer = (
    state: QueuedSong[] = [],
    action: any
): QueuedSong[] => {
    switch (action.type) {
        case QueueActions.ADD_TO_QUEUE: {
            const {
                query,
                title,
                artists,
                thumbnail,
                requestor,
                requestorChannel,
                videoId,
            } = action as AddToQueueAction;

            if (
                !title ||
                !artists ||
                !thumbnail ||
                typeof videoId === "undefined"
            )
                return state;

            return [
                ...state,
                {
                    query,
                    title,
                    artists,
                    thumbnail,
                    requestor,
                    requestorChannel,
                    videoId,
                },
            ];
        }

        case QueueActions.PLAY_NEXT_SONG: {
            return state.slice(1);
        }

        case CommandActions.CLEAR_QUEUE: {
            return [];
        }

        case CommandActions.SHUFFLE_QUEUE: {
            return shuffle(state);
        }
    }

    return state;
};
