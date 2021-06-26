/// <reference types="node" />
import { EventEmitter } from "events";
import ShardManager from "./ShardManager";
interface ClientEvents {
    debug: [string];
    rawSend: [import("./Types").IWSMessage];
    rawReceive: [import("./Types").IGatewayMessage];
    event: [import("./Types").IGatewayMessage];
    dispatch: [import("./Types").IGatewayMessage];
    voiceStateUpdate: [import("./Types").IGatewayMessage];
    shardReady: [{
        id: number;
        ready: boolean;
    }];
    error: [string];
    ready: [];
    disconnected: [];
}
interface Client {
    addListener<E extends keyof ClientEvents>(event: E, listener: (...args: ClientEvents[E]) => any): this;
    emit<E extends keyof ClientEvents>(event: E, ...args: ClientEvents[E]): boolean;
    eventNames(): Array<keyof ClientEvents>;
    listenerCount(event: keyof ClientEvents): number;
    listeners(event: keyof ClientEvents): Array<(...args: Array<any>) => any>;
    off<E extends keyof ClientEvents>(event: E, listener: (...args: ClientEvents[E]) => any): this;
    on<E extends keyof ClientEvents>(event: E, listener: (...args: ClientEvents[E]) => any): this;
    once<E extends keyof ClientEvents>(event: E, listener: (...args: ClientEvents[E]) => any): this;
    prependListener<E extends keyof ClientEvents>(event: E, listener: (...args: ClientEvents[E]) => any): this;
    prependOnceListener<E extends keyof ClientEvents>(event: E, listener: (...args: ClientEvents[E]) => any): this;
    rawListeners(event: keyof ClientEvents): Array<(...args: Array<any>) => any>;
    removeAllListeners(event?: keyof ClientEvents): this;
    removeListener<E extends keyof ClientEvents>(event: E, listener: (...args: ClientEvents[E]) => any): this;
}
/**
 * Main class used for receiving events and interacting with the Discord gateway.
 */
declare class Client extends EventEmitter {
    token: string;
    options: import("./Types").IClientOptions & {
        token: string;
        endpoint?: string;
    };
    shardManager: ShardManager;
    version: any;
    private _restClient;
    static Constants: {
        GATEWAY_OP_CODES: {
            DISPATCH: 0;
            HEARTBEAT: 1;
            IDENTIFY: 2;
            PRESENCE_UPDATE: 3;
            VOICE_STATE_UPDATE: 4;
            RESUME: 6;
            RECONNECT: 7;
            REQUEST_GUILD_MEMBERS: 8;
            INVALID_SESSION: 9;
            HELLO: 10;
            HEARTBEAT_ACK: 11;
        };
        GATEWAY_VERSION: number;
    };
    Constants: {
        GATEWAY_OP_CODES: {
            DISPATCH: 0;
            HEARTBEAT: 1;
            IDENTIFY: 2;
            PRESENCE_UPDATE: 3;
            VOICE_STATE_UPDATE: 4;
            RESUME: 6;
            RECONNECT: 7;
            REQUEST_GUILD_MEMBERS: 8;
            INVALID_SESSION: 9;
            HELLO: 10;
            HEARTBEAT_ACK: 11;
        };
        GATEWAY_VERSION: number;
    };
    /**
     * Create a new Client to connect to the Discord gateway.
     * @param token Token received from creating a discord bot user, which will be used to connect to the gateway.
     */
    constructor(token: string, options?: import("./Types").IClientOptions);
    /**
     * Create one or more connections (depending on the selected amount of shards) to the Discord gateway.
     * @returns This function returns a promise which is solely used for awaiting the getGateway() method's return value.
     */
    connect(): Promise<void>;
    /**
     * Get the gateway endpoint to connect to.
     * @returns String url with the Gateway Endpoint to connect to.
     */
    getGateway(): Promise<string>;
    /**
     * Get the GatewayData including recommended amount of shards.
     * @returns Object with url and shards to use to connect to discord.
     */
    getGatewayBot(): Promise<any>;
    /**
     * Disconnect the bot gracefully,
     * you will receive a 'disconnected' event once the ShardManager successfully closes all shard websocket connections.
     */
    disconnect(): void;
    /**
     * Send an OP 3 PRESENCE_UPDATE to Discord, which updates the status of all shards facilitated by this client's ShardManager.
     * @returns Promise that's resolved once all shards have sent the websocket payload.
     *
     * @example
     * // Connect to Discord and set status to do not disturb and game to "Memes are Dreams".
     * const CloudStorm = require("cloudstorm"); // CloudStorm also supports import statements.
     * const token = "token";
     * const client = new CloudStorm.Client(token);
     * client.connect();
     * client.once("ready", () => {
     * 	// Client is connected to Discord and is ready, so we can update the status.
     * 	client.presenceUpdate({ status: "dnd", game: { name: "Memes are Dreams" } });
     * });
     */
    presenceUpdate(data: import("./Types").IPresence): Promise<void>;
    /**
     * Send an OP 3 PRESENCE_UPDATE to Discord, which updates the status of a single shard facilitated by this client's ShardManager.
     * @param shardId id of the shard that should update it's status.
     * @param data Presence data to send.
     * @returns Promise that's resolved once the shard has sent the websocket payload.
     *
     * @example
     * // Connect to Discord and set status to do not disturb and game to "Im shard 0".
     * const CloudStorm = require("cloudstorm"); // CloudStorm also supports import statements.
     * const token = "token";
     * const client = new CloudStorm.Client(token);
     * client.connect();
     * client.once("ready", () => {
     * 	// Client is connected to Discord and is ready, so we can update the status of shard 0.
     * 	client.shardPresenceUpdate(0, { status: "dnd", game: { name: "Im shard 0" } });
     * });
     */
    shardStatusUpdate(shardId: number, data: import("./Types").IPresence): Promise<void>;
    /**
     * Send an OP 4 VOICE_STATE_UPDATE to Discord. this does **not** allow you to send audio with CloudStorm itself,
     * it just provides the necessary data for another application to send audio data to Discord.
     * @param shardId id of the shard that should send the payload.
     * @param data Voice state update data to send.
     * @returns Promise that's resolved once the payload was sent to Discord.
     *
     * @example
     * // Connect to Discord and join a voice channel
     * const CloudStorm = require("cloudstorm"); // CloudStorm also supports import statements.
     * const token = "token";
     * const client = new CloudStorm.Client(token);
     * client.connect();
     * client.once("ready", () => {
     * 	// Client is connected to Discord and is ready, so we can join a voice channel.
     * 	// We will use shard 0 as the shard to send the payload.
     * 	client.voiceStateUpdate(0, { guild_id: "id", channel_id: "id", self_mute: false, self_deaf: false });
     * });
     */
    voiceStateUpdate(shardId: number, data: import("./Types").IVoiceStateUpdate): Promise<void>;
    /**
     * Send an OP 8 REQUEST_GUILD_MEMBERS to Discord.
     * @param shardId id of the shard that should send the payload.
     * @param data Request guild members data to send.
     * @returns Promise that's resolved once the payload was send to Discord.
     *
     * @example
     * // Connect to Discord and request guild members.
     * const CloudStorm = require("cloudstorm"); // CloudStorm also supports import statements.
     * const token = "token";
     * const client = new CloudStorm.Client(token);
     * client.connect();
     * client.once("ready", () => {
     * 	// Client is connected to Discord and is ready, so we can send the request guild members payload.
     * 	// We will use shard 0 as the shard to send the payload.
     * 	client.requestGuildMembers(0, { guild_id: "id" });
     * });
     */
    requestGuildMembers(shardId: number, data: import("./Types").IRequestGuildMembers): Promise<void>;
    /**
     * Update the endpoint shard websockets will connect to.
     * @param gatewayUrl Base gateway wss url to update the cached endpoint to.
     */
    private _updateEndpoint;
}
export = Client;
