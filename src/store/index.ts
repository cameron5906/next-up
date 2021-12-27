import {
    lifecycle,
    textProcessing,
    commandProcessing,
    songResolution,
    queueing,
    logging,
    feedback,
} from "./middleware";
import { queueReducer, activeSongReducer } from "./reducers";
import { createStore } from "./store";

export const store = createStore(
    {
        queue: queueReducer,
        activeSong: activeSongReducer,
    },
    [
        lifecycle,
        textProcessing,
        commandProcessing,
        songResolution,
        queueing,
        logging,
        feedback,
    ]
);
