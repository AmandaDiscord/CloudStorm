/// <reference types="node" />
/**
 * RatelimitBucket, used for ratelimiting the execution of functions.
 */
declare class RatelimitBucket {
    fnQueue: Array<{
        fn: (...args: Array<any>) => any;
        callback: () => any;
    }>;
    limit: number;
    remaining: number;
    limitReset: number;
    resetTimeout: NodeJS.Timeout | null;
    /**
     * Create a new Bucket.
     * @param limit Number of functions that may be executed during the timeframe set in limitReset.
     * @param limitReset Timeframe in milliseconds until the ratelimit resets.
     */
    constructor(limit?: number, limitReset?: number);
    /**
     * Queue a function to be executed.
     * @param fn Function to be executed.
     * @returns Result of the function if any.
     */
    queue(fn: (...args: Array<any>) => any): Promise<any>;
    /**
     * Check if there are any functions in the queue that haven't been executed yet.
     */
    private checkQueue;
    /**
     * Reset the remaining tokens to the base limit.
     */
    private resetRemaining;
    /**
     * Clear the current queue of events to be sent.
     */
    dropQueue(): void;
}
export = RatelimitBucket;
