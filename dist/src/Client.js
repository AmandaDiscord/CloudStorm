"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const version = require("../package.json").version;
const events_1 = require("events");
let Erlpack;
try {
    Erlpack = require("erlpack");
}
catch (e) {
    Erlpack = null;
}
const Constants_1 = __importDefault(require("./Constants"));
const snowtransfer_1 = __importDefault(require("snowtransfer"));
const ShardManager_1 = __importDefault(require("./ShardManager"));
/**
 * Main class used for receiving events and interacting with the Discord gateway.
 */
class Client extends events_1.EventEmitter {
    /**
     * Create a new Client to connect to the Discord gateway.
     * @param token Token received from creating a discord bot user, which will be used to connect to the gateway.
     */
    constructor(token, options = {}) {
        super();
        this.Constants = Constants_1.default;
        if (!token) {
            throw new Error("Missing token!");
        }
        this.options = {
            largeGuildThreshold: 250,
            firstShardId: 0,
            lastShardId: 0,
            shardAmount: 1,
            reconnect: true,
            intents: 0,
            token: ""
        };
        this.token = token.startsWith("Bot ") ? token.substring(4) : token;
        Object.assign(this.options, options);
        this.options.token = token;
        this.shardManager = new ShardManager_1.default(this);
        this.version = version;
        this._restClient = new snowtransfer_1.default(token);
    }
    /**
     * Create one or more connections (depending on the selected amount of shards) to the Discord gateway.
     * @returns This function returns a promise which is solely used for awaiting the getGateway() method's return value.
     */
    async connect() {
        const gatewayUrl = await this.getGateway();
        this._updateEndpoint(gatewayUrl);
        this.shardManager.spawn();
    }
    /**
     * Get the gateway endpoint to connect to.
     * @returns String url with the Gateway Endpoint to connect to.
     */
    async getGateway() {
        const gatewayData = await this._restClient.bot.getGateway();
        return gatewayData.url;
    }
    /**
     * Get the GatewayData including recommended amount of shards.
     * @returns Object with url and shards to use to connect to discord.
     */
    async getGatewayBot() {
        return this._restClient.bot.getGatewayBot();
    }
    /**
     * Disconnect the bot gracefully,
     * you will receive a 'disconnected' event once the ShardManager successfully closes all shard websocket connections.
     */
    disconnect() {
        return this.shardManager.disconnect();
    }
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
    async presenceUpdate(data) {
        await this.shardManager.presenceUpdate(data);
        void undefined;
    }
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
    shardStatusUpdate(shardId, data) {
        return this.shardManager.shardPresenceUpdate(shardId, data);
    }
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
    voiceStateUpdate(shardId, data) {
        return this.shardManager.voiceStateUpdate(shardId, data);
    }
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
    requestGuildMembers(shardId, data) {
        if (!data.guild_id) {
            throw new Error("You need to pass a guild_id");
        }
        return this.shardManager.requestGuildMembers(shardId, data);
    }
    /**
     * Update the endpoint shard websockets will connect to.
     * @param gatewayUrl Base gateway wss url to update the cached endpoint to.
     */
    _updateEndpoint(gatewayUrl) {
        this.options.endpoint = `${gatewayUrl}?v=${Constants_1.default.GATEWAY_VERSION}&encoding=${Erlpack ? "etf" : "json"}&compress=zlib-stream`;
    }
}
Client.Constants = Constants_1.default;
module.exports = Client;
