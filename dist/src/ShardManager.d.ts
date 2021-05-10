/// <reference types="node" />
import Shard from "./Shard";
/**
 * Class used for managing shards for the user.
 *
 * This class is automatically instantiated by the library and is documented for reference.
 */
declare class ShardManager {
    client: import("./Client");
    options: import("./Client")["options"];
    shards: {
        [id: number]: Shard;
    };
    connectQueue: Array<{
        action: string;
        shard: Shard;
    }>;
    lastConnectionAttempt: number | null;
    connectQueueInterval: NodeJS.Timeout;
    /**
     * Create a new ShardManager.
     */
    constructor(client: import("./Client"));
    /**
     * Create shard instances and add them to the connection queue.
     */
    spawn(): void;
    /**
     * Disconnect all shards facilitated by this manager.
     */
    disconnect(): void;
    /**
     * Actually connect/re-identify a single shard spawned by this manager by calling it's connect() or identify() method and reset the connection timer.
     * @param data Object with a shard and action key.
     */
    private _connectShard;
    /**
     * Check if there are shards that have been spawned by this manager that are not connected yet and connect them if over 6 seconds have passed since the last attempt.
     */
    private _checkQueue;
    /**
     * Add event listeners to a shard to that the manager can act on received events.
     * @param shard Shard to add the event listeners to.
     */
    private _addListener;
    /**
     * Checks if all shards spawned by this manager are ready.
     */
    private _checkReady;
    /**
     * Checks if all shards spawned by this manager are disconnected.
     */
    private _checkDisconnect;
    /**
     * Update the status of all currently connected shards which have been spawned by this manager.
     * @param data Data to send.
     */
    presenceUpdate(data?: import("./Types").IPresence): Promise<void>;
    /**
     * Update the status of a single connected shard which has been spawned by this manager.
     * @param shardId id of the shard.
     * @param data Data to send.
     */
    shardPresenceUpdate(shardId: number, data?: import("./Types").IPresence): Promise<void>;
    /**
     * Send an OP 4 VOICE_STATE_UPDATE with a certain shard.
     * @param shardId id of the shard.
     * @param data Data to send.
     */
    voiceStateUpdate(shardId: number, data: import("./Types").IVoiceStateUpdate): Promise<void>;
    /**
     * Send an OP 8 REQUEST_GUILD_MEMBERS with a certain shard.
     * @param shardId id of the shard.
     * @param data Data to send.
     */
    requestGuildMembers(shardId: number, data: import("./Types").IRequestGuildMembers): Promise<void>;
}
export = ShardManager;
