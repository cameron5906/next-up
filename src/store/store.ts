export type ReducerKeys = { [name: string]: (state: any, action: any) => any };
export type Middleware = (
    store: Store
) => (next: (action: any) => void) => (action: any) => void;
export type AnyAction = { type: string } & any;

export function createStore(keys: ReducerKeys, middleware: Middleware[] = []) {
    return new Store(keys, middleware);
}

export class Store {
    keys: ReducerKeys = {};
    middleware: Middleware[] = [];
    state: { [key: string]: any } = {};

    constructor(keys: ReducerKeys, middleware: Middleware[] = []) {
        this.keys = keys;
        this.middleware = middleware;

        this.hydrateInitial();
    }

    getState() {
        return this.state;
    }

    async dispatch(action: any) {
        if (this.middleware.length > 0) {
            await this.setupMiddlewareFunction(action, 0)();
        } else {
            this.processReducers(action);
        }
    }

    private hydrateInitial() {
        this.dispatch({ type: "_HYDRATE" });
    }

    private setupMiddlewareFunction(
        action: any,
        index: number
    ): () => Promise<any> {
        console.log(
            `Setup middleware #${index}: ${JSON.stringify({
                ...action,
                requestor: undefined,
                requestorChannel: undefined,
                sender: undefined,
                channel: undefined,
            })}`
        );

        const currentFunc = this.middleware[index];

        return async () => {
            const nextFunc = async (nextAction: any) => {
                if (index === this.middleware.length - 1) {
                    // End
                    this.processReducers(nextAction);
                } else {
                    await this.setupMiddlewareFunction(nextAction, index + 1)();
                }
            };

            await currentFunc(this)(nextFunc)(action);
        };
    }

    private processReducers(action: any) {
        for (const key of Object.keys(this.keys)) {
            this.state[key] = this.keys[key](this.state[key], action);
        }
    }
}
