import { Store } from "../store";

export const logging =
    (store: Store) => (next: (action: any) => void) => (action: any) => {
        console.log(action);

        next(action);
    };
