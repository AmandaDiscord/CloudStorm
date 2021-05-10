"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const events_1 = require("events");
const zlib_sync_1 = __importDefault(require("zlib-sync"));
let Erlpack;
try {
    Erlpack = require("erlpack");
}
catch (e) {
    Erlpack = null;
}
const Constants_1 = require("../Constants");
const ws_1 = __importDefault(require("ws"));
const RatelimitBucket_1 = __importDefault(require("./RatelimitBucket"));
/**
 * Helper Class for simplifying the websocket connection to Discord.
 */
class BetterWs extends events_1.EventEmitter {
    /**
     * Create a new BetterWs instance.
     */
    constructor(address, options = {}) {
        super();
        this.ws = new ws_1.default(address, options);
        this.bindWs(this.ws);
        this.wsBucket = new RatelimitBucket_1.default(120, 60000);
        this.presenceBucket = new RatelimitBucket_1.default(5, 20000);
        this.zlibInflate = new zlib_sync_1.default.Inflate({ chunkSize: 65535 });
    }
    /**
     * Get the raw websocket connection currently used.
     */
    get rawWs() {
        return this.ws;
    }
    /**
     * Add eventlisteners to a passed websocket connection.
     * @param ws Websocket.
     */
    bindWs(ws) {
        ws.on("message", (msg) => {
            this.onMessage(msg);
        });
        ws.on("close", (code, reason) => this.onClose(code, reason));
        ws.on("error", (err) => {
            this.emit("error", err);
        });
        ws.on("open", () => this.onOpen());
    }
    /**
     * Create a new websocket connection if the old one was closed/destroyed.
     * @param address Address to connect to.
     * @param options Options used by the websocket connection.
     */
    recreateWs(address, options = {}) {
        this.ws.removeAllListeners();
        this.zlibInflate = new zlib_sync_1.default.Inflate({ chunkSize: 65535 });
        this.ws = new ws_1.default(address, options);
        this.options = options;
        this.wsBucket.dropQueue();
        this.wsBucket = new RatelimitBucket_1.default(120, 60000);
        this.presenceBucket = new RatelimitBucket_1.default(5, 60000);
        this.bindWs(this.ws);
    }
    /**
     * Called upon opening of the websocket connection.
     */
    onOpen() {
        this.emit("ws_open");
    }
    /**
     * Called once a websocket message is received,
     * uncompresses the message using zlib and parses it via Erlpack or JSON.parse.
     * @param message Message received by websocket.
     */
    onMessage(message) {
        let parsed;
        try {
            const length = message.length;
            const flush = length >= 4 &&
                message[length - 4] === 0x00 &&
                message[length - 3] === 0x00 &&
                message[length - 2] === 0xFF &&
                message[length - 1] === 0xFF;
            this.zlibInflate.push(message, flush ? zlib_sync_1.default.Z_SYNC_FLUSH : false);
            if (!flush)
                return;
            if (Erlpack) {
                parsed = Erlpack.unpack(this.zlibInflate.result);
            }
            else {
                parsed = JSON.parse(String(this.zlibInflate.result));
            }
        }
        catch (e) {
            this.emit("error", `Message: ${message} was not parseable`);
            return;
        }
        this.emit("ws_message", parsed);
    }
    /**
     * Called when the websocket connection closes for some reason.
     * @param code Websocket close code.
     * @param reason Reason of the close if any.
     */
    onClose(code, reason) {
        this.emit("ws_close", code, reason);
    }
    /**
     * Send a message to the Discord gateway.
     * @param data Data to send.
     */
    sendMessage(data) {
        this.emit("debug_send", data);
        return new Promise((res, rej) => {
            const presence = data.op === Constants_1.GATEWAY_OP_CODES.PRESENCE_UPDATE;
            try {
                if (Erlpack) {
                    data = Erlpack.pack(data);
                }
                else {
                    data = JSON.stringify(data);
                }
            }
            catch (e) {
                return rej(e);
            }
            const sendMsg = () => {
                // The promise from wsBucket is ignored, since the method passed to it does not return a promise
                this.wsBucket.queue(() => {
                    this.ws.send(data, {}, (e) => {
                        if (e) {
                            return rej(e);
                        }
                        res();
                    });
                });
            };
            if (presence) {
                // same here
                this.presenceBucket.queue(sendMsg);
            }
            else {
                sendMsg();
            }
        });
    }
    /**
     * Close the current websocket connection.
     * @param code Websocket close code to use.
     * @param reason Reason of the disconnect.
     */
    close(code = 1000, reason = "Unknown") {
        return new Promise((res, rej) => {
            const timeout = setTimeout(() => {
                return rej("Websocket not closed within 5 seconds");
            }, 5 * 1000);
            this.ws.once("close", () => {
                clearTimeout(timeout);
                return res();
            });
            this.ws.close(code, reason);
        });
    }
}
module.exports = BetterWs;
