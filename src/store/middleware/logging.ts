import { Store } from "../store";

/**
 * Simple logging middleware for debugging
 */
export const logging =
    (store: Store) => (next: (action: any) => void) => (action: any) => {
        console.log(action);

        next(action);
    };
