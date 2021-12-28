import {
    lifecycle,
    textProcessing,
    commandProcessing,
    songResolution,
    queueing,
    logging,
    feedback,
} from "./middleware";
import { visualization } from "./middleware/visualization";
import { queueReducer, activeSongReducer } from "./reducers";
import { historyReducer } from "./reducers/historyReducer";
import { createStore } from "./store";

export const store = createStore(
    {
        queue: queueReducer,
        activeSong: activeSongReducer,
        history: historyReducer,
    },
    [
        textProcessing,
        commandProcessing,
        songResolution,
        queueing,
        logging,
        lifecycle,
        feedback,
        visualization,
    ]
);
