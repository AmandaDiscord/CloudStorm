/// <reference types="node" />
import { EventEmitter } from "events";
import BetterWs from "../structures/BetterWs";
interface ConnectorEvents {
    queueIdentify: [number];
    event: [import("../Types").IWSMessage];
    ready: [boolean];
    error: [string];
    disconnect: [number, string, boolean];
}
interface DiscordConnector {
    addListener<E extends keyof ConnectorEvents>(event: E, listener: (...args: ConnectorEvents[E]) => any): this;
    emit<E extends keyof ConnectorEvents>(event: E, ...args: ConnectorEvents[E]): boolean;
    eventNames(): Array<keyof ConnectorEvents>;
    listenerCount(event: keyof ConnectorEvents): number;
    listeners(event: keyof ConnectorEvents): Array<(...args: Array<any>) => any>;
    off<E extends keyof ConnectorEvents>(event: E, listener: (...args: ConnectorEvents[E]) => any): this;
    on<E extends keyof ConnectorEvents>(event: E, listener: (...args: ConnectorEvents[E]) => any): this;
    once<E extends keyof ConnectorEvents>(event: E, listener: (...args: ConnectorEvents[E]) => any): this;
    prependListener<E extends keyof ConnectorEvents>(event: E, listener: (...args: ConnectorEvents[E]) => any): this;
    prependOnceListener<E extends keyof ConnectorEvents>(event: E, listener: (...args: ConnectorEvents[E]) => any): this;
    rawListeners(event: keyof ConnectorEvents): Array<(...args: Array<any>) => any>;
    removeAllListeners(event?: keyof ConnectorEvents): this;
    removeListener<E extends keyof ConnectorEvents>(event: E, listener: (...args: ConnectorEvents[E]) => any): this;
}
/**
 * Class used for acting based on received events.
 *
 * This class is automatically instantiated by the library and is documented for reference.
 */
declare class DiscordConnector extends EventEmitter {
    id: number;
    client: import("../Client");
    options: import("../Client")["options"];
    reconnect: boolean;
    betterWs: BetterWs | null;
    heartbeatTimeout: NodeJS.Timeout | null;
    heartbeatInterval: number;
    _trace: string | null;
    seq: number;
    status: string;
    sessionId: string | null;
    lastACKAt: number;
    lastHeartbeatSend: number;
    latency: number;
    /**
     * Create a new Discord Connector.
     * @param id id of the shard that created this class.
     * @param client Main client instance.
     */
    constructor(id: number, client: import("../Client"));
    /**
     * Connect to Discord.
     */
    connect(): void;
    /**
     * Close the websocket connection and disconnect.
     */
    disconnect(): Promise<void>;
    /**
     * Called with a parsed Websocket message to execute further actions.
     * @param message Message that was received.
     */
    private messageAction;
    /**
     * Reset this connector to be ready to resume or hard reconnect, then connect.
     * @param resume Whether or not the client intends to send an OP 6 RESUME later.
     */
    private _reconnect;
    /**
     * Hard reset this connector.
     */
    private reset;
    /**
     * Clear the heart beat interval, set it to null and set the cached heartbeat_interval as 0.
     */
    private clearHeartBeat;
    /**
     * Send an OP 2 IDENTIFY to the gateway or an OP 6 RESUME if forceful identify is falsy.
     * @param force Whether CloudStorm should send an OP 2 IDENTIFY even if there's a session that could be resumed.
     */
    identify(force?: boolean): Promise<void>;
    /**
     * Send an OP 6 RESUME to the gateway.
     */
    private resume;
    /**
     * Send an OP 1 HEARTBEAT to the gateway.
     */
    private heartbeat;
    /**
     * Handle dispatch events.
     * @param message Message received from the websocket.
     */
    private handleDispatch;
    /**
     * Handle a close from the underlying websocket.
     * @param code Websocket close code.
     * @param reason Close reason if any.
     */
    private handleWsClose;
    /**
     * Send an OP 3 PRESENCE_UPDATE to the gateway.
     * @param data Presence data to send.
     */
    presenceUpdate(data?: import("../Types").IPresence): Promise<void>;
    /**
     * Send an OP 4 VOICE_STATE_UPDATE to the gateway.
     * @param data Voice state update data to send.
     */
    voiceStateUpdate(data: import("../Types").IVoiceStateUpdate): Promise<void>;
    /**
     * Send an OP 8 REQUEST_GUILD_MEMBERS to the gateway.
     * @param data Data to send.
     */
    requestGuildMembers(data: import("../Types").IRequestGuildMembers): Promise<void>;
    /**
     * Checks presence data and fills in missing elements.
     * @param data Data to send.
     * @returns Data after it's fixed/checked.
     */
    private _checkPresenceData;
    /**
     * Checks voice state update data and fills in missing elements.
     * @param data Data to send.
     * @returns Data after it's fixed/checked.
     */
    private _checkVoiceStateUpdateData;
    /**
     * Checks request guild members data and fills in missing elements.
     * @param data Data to send.
     * @returns Data after it's fixed/checked.
     */
    private _checkRequestGuildMembersData;
}
export = DiscordConnector;
