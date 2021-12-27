import { QueuedSong } from "../../types/QueuedSong";
import { AddToHistoryAction, LifecycleActions } from "../actions";

export const historyReducer = (
    state: QueuedSong[] = [],
    action: any
): QueuedSong[] => {
    switch (action.type) {
        case LifecycleActions.ADD_TO_HISTORY: {
            const { song } = action as AddToHistoryAction;
            return [song, ...state];
        }
    }

    return state;
};
