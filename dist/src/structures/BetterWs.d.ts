/// <reference types="node" />
import { EventEmitter } from "events";
import zlib from "zlib-sync";
import WebSocket from "ws";
import RatelimitBucket from "./RatelimitBucket";
interface BWSEvents {
    error: [Error | string];
    ws_open: [];
    ws_close: [number, string];
    ws_message: [import("../Types").IGatewayMessage];
    debug_send: [import("../Types").IWSMessage];
    debug: [string];
}
interface BetterWs {
    addListener<E extends keyof BWSEvents>(event: E, listener: (...args: BWSEvents[E]) => any): this;
    emit<E extends keyof BWSEvents>(event: E, ...args: BWSEvents[E]): boolean;
    eventNames(): Array<keyof BWSEvents>;
    listenerCount(event: keyof BWSEvents): number;
    listeners(event: keyof BWSEvents): Array<(...args: Array<any>) => any>;
    off<E extends keyof BWSEvents>(event: E, listener: (...args: BWSEvents[E]) => any): this;
    on<E extends keyof BWSEvents>(event: E, listener: (...args: BWSEvents[E]) => any): this;
    once<E extends keyof BWSEvents>(event: E, listener: (...args: BWSEvents[E]) => any): this;
    prependListener<E extends keyof BWSEvents>(event: E, listener: (...args: BWSEvents[E]) => any): this;
    prependOnceListener<E extends keyof BWSEvents>(event: E, listener: (...args: BWSEvents[E]) => any): this;
    rawListeners(event: keyof BWSEvents): Array<(...args: Array<any>) => any>;
    removeAllListeners(event?: keyof BWSEvents): this;
    removeListener<E extends keyof BWSEvents>(event: E, listener: (...args: BWSEvents[E]) => any): this;
}
/**
 * Helper Class for simplifying the websocket connection to Discord.
 */
declare class BetterWs extends EventEmitter {
    ws: WebSocket;
    wsBucket: RatelimitBucket;
    presenceBucket: RatelimitBucket;
    zlibInflate: zlib.Inflate;
    options: WebSocket.ClientOptions;
    /**
     * Create a new BetterWs instance.
     */
    constructor(address: string, options?: import("ws").ClientOptions);
    /**
     * Get the raw websocket connection currently used.
     */
    get rawWs(): WebSocket;
    /**
     * Add eventlisteners to a passed websocket connection.
     * @param ws Websocket.
     */
    private bindWs;
    /**
     * Create a new websocket connection if the old one was closed/destroyed.
     * @param address Address to connect to.
     * @param options Options used by the websocket connection.
     */
    recreateWs(address: string, options?: import("ws").ClientOptions): void;
    /**
     * Called upon opening of the websocket connection.
     */
    private onOpen;
    /**
     * Called once a websocket message is received,
     * uncompresses the message using zlib and parses it via Erlpack or JSON.parse.
     * @param message Message received by websocket.
     */
    private onMessage;
    /**
     * Called when the websocket connection closes for some reason.
     * @param code Websocket close code.
     * @param reason Reason of the close if any.
     */
    private onClose;
    /**
     * Send a message to the Discord gateway.
     * @param data Data to send.
     */
    sendMessage(data: any): Promise<void>;
    /**
     * Close the current websocket connection.
     * @param code Websocket close code to use.
     * @param reason Reason of the disconnect.
     */
    close(code?: number, reason?: string): Promise<void>;
}
export = BetterWs;
