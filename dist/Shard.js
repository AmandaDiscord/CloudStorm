"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const events_1 = require("events");
const DiscordConnector_1 = __importDefault(require("./connector/DiscordConnector"));
const Constants_1 = require("./Constants");
/**
 * Shard class, which provides a wrapper around the DiscordConnector with metadata like the id of the shard.
 *
 * This class is automatically instantiated by the library and is documented for reference.
 */
class Shard extends events_1.EventEmitter {
    /**
     * Create a new Shard.
     * @param id id of the shard.
     * @param client Main class used for forwarding events.
     */
    constructor(id, client) {
        super();
        this.id = id;
        this.client = client;
        this.ready = false;
        this.connector = new DiscordConnector_1.default(id, client);
        this.connector.on("event", (event) => {
            const newEvent = Object.assign(event, { shard_id: this.id });
            this.client.emit("event", newEvent);
            switch (event.op) {
                case Constants_1.GATEWAY_OP_CODES.DISPATCH:
                    this.client.emit("dispatch", newEvent);
                    break;
                case Constants_1.GATEWAY_OP_CODES.VOICE_STATE_UPDATE:
                    this.client.emit("voiceStateUpdate", newEvent);
                    break;
                default:
                    break;
            }
        });
        this.connector.on("disconnect", (...args) => {
            this.ready = false;
            this.emit("disconnect", ...args);
        });
        this.connector.on("error", (err) => {
            this.emit("error", err);
        });
        this.connector.on("ready", (resume) => {
            this.emit("ready", resume);
        });
        this.connector.on("queueIdentify", () => {
            this.emit("queueIdentify", this.id);
        });
    }
    /**
     * Time in ms it took for Discord to ackknowledge an OP 1 HEARTBEAT.
     */
    get latency() {
        return this.connector.latency;
    }
    /**
     * Create a new connection to Discord.
     */
    connect() {
        this.connector.connect();
    }
    /**
     * Close the current connection to Discord.
     */
    disconnect() {
        return this.connector.disconnect();
    }
    /**
     * Send an OP 3 PRESENCE_UPDATE to Discord.
     * @param data Data to send.
     */
    presenceUpdate(data) {
        return this.connector.presenceUpdate(data);
    }
    /**
     * Send an OP 4 VOICE_STATE_UPDATE to Discord.
     * @param data Data to send
     */
    voiceStateUpdate(data) {
        return this.connector.voiceStateUpdate(data);
    }
    /**
     * Send an OP 8 REQUEST_GUILD_MEMBERS to Discord.
     * @param data Data to send.
     */
    requestGuildMembers(data) {
        return this.connector.requestGuildMembers(data);
    }
}
module.exports = Shard;
