'use strict';

class RatelimitBucket {
    constructor(limit = 5, limitReset = 5000) {
        this.fnQueue = [];
        this.limit = limit;
        this.remaining = limit;
        this.limitReset = limitReset;
        this.resetTimeout = null;
    }

    queue(fn) {
        return new Promise((res, rej) => {
            let wrapFn = () => {
                this.remaining--;
                if (!this.resetTimeout) {
                    this.resetTimeout = setTimeout(() => this.resetRemaining(), this.limitReset);
                }
                if (this.remaining !== 0) {
                    this.checkQueue();
                }
                if (typeof fn.then === 'function') {
                    return fn().then(res).catch(rej);
                }
                return res(fn());
            };
            if (this.remaining === 0) {
                this.fnQueue.push({
                    fn, callback: wrapFn
                });
                this.checkQueue();
            } else {
                wrapFn();
            }
        });
    }

    checkQueue() {
        if (this.fnQueue.length > 0 && this.remaining !== 0) {
            let queuedFunc = this.fnQueue.splice(0, 1)[0];
            queuedFunc.callback();
        }
    }

    resetRemaining() {
        this.remaining = this.limit;
        clearTimeout(this.resetTimeout);
        this.checkQueue();
    }

    dropQueue() {
        this.fnQueue = [];
    }
}

module.exports = RatelimitBucket;
