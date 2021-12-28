import {
    lifecycle,
    textProcessing,
    commandProcessing,
    songResolution,
    queueing,
    logging,
    feedback,
} from "./middleware";
import { radio } from "./middleware/radio";
import { visualization } from "./middleware/visualization";
import { queueReducer, activeSongReducer } from "./reducers";
import { historyReducer } from "./reducers/historyReducer";
import { radioReducer } from "./reducers/radioReducer";
import { createStore } from "./store";

export const store = createStore(
    {
        queue: queueReducer,
        activeSong: activeSongReducer,
        history: historyReducer,
        radio: radioReducer,
    },
    [
        textProcessing,
        commandProcessing,
        songResolution,
        queueing,
        logging,
        lifecycle,
        radio,
        feedback,
        visualization,
    ]
);
