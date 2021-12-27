export type ReducerKeys = { [name: string]: (state: any, action: any) => any };
export type Middleware = (
    store: Store
) => (next: (action: any) => void) => (action: any) => void;
export type AnyAction = { type: string } & any;

export function createStore(keys: ReducerKeys, middleware: Middleware[] = []) {
    return new Store(keys, middleware);
}

/**
 * Mimics implementation of Redux store
 */
export class Store {
    private keys: ReducerKeys = {};
    private middleware: Middleware[] = [];
    private state: { [key: string]: any } = {};

    constructor(keys: ReducerKeys, middleware: Middleware[] = []) {
        this.keys = keys;
        this.middleware = middleware;

        // Run a hydration action through all reducers to set initial states
        this.hydrateInitial();
    }

    /**
     * Used to get the current state object
     * @returns The current application state
     */
    getState() {
        return this.state;
    }

    /**
     * Sends an action through the middleware pipeline and then to each reducer
     * @param action An application action to process
     */
    async dispatch(action: any) {
        if (this.middleware.length > 0) {
            // If there is middleware, run it through the pipeline
            await this.setupMiddlewareFunction(action, 0)();
        } else {
            // If no middleware, run it through the reducers
            this.processReducers(action);
        }
    }

    /**
     * Internal action to hydrate reducer states on start
     */
    private hydrateInitial() {
        this.dispatch({ type: "_HYDRATE" });
    }

    /**
     * Recursive function to process through middleware pipeline
     * @param action The action to process
     * @param index Which middleware index is being set up
     * @returns The root middleware function
     */
    private setupMiddlewareFunction(
        action: any,
        index: number
    ): () => Promise<any> {
        const currentFunc = this.middleware[index];

        return async () => {
            // Set up the "next" function for the current middleware, determining either the next middleware to call, or reducer processing
            const nextFunc = async (nextAction: any) => {
                if (index === this.middleware.length - 1) {
                    // End
                    this.processReducers(nextAction);
                } else {
                    await this.setupMiddlewareFunction(nextAction, index + 1)();
                }
            };

            // Call the middleware function
            await currentFunc(this)(nextFunc)(action);
        };
    }

    /**
     * Sends an application action through each reducer to mutate state
     * @param action The action to reduce
     */
    private processReducers(action: any) {
        for (const key of Object.keys(this.keys)) {
            this.state[key] = this.keys[key](this.state[key], action);
        }
    }
}
