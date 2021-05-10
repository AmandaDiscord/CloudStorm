"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GATEWAY_OP_CODES = {
    /**
     * Receive.
     */
    DISPATCH: 0,
    /**
     * Send/Receive.
     */
    HEARTBEAT: 1,
    /**
     * Send.
     */
    IDENTIFY: 2,
    /**
     * Send.
     */
    PRESENCE_UPDATE: 3,
    /**
     * Send.
     */
    VOICE_STATE_UPDATE: 4,
    /**
     * Send.
     */
    RESUME: 6,
    /**
     * Receive.
     */
    RECONNECT: 7,
    /**
     * Send.
     */
    REQUEST_GUILD_MEMBERS: 8,
    /**
     * Receive.
     */
    INVALID_SESSION: 9,
    /**
     * Receive.
     */
    HELLO: 10,
    /**
     * Receive.
     */
    HEARTBEAT_ACK: 11
};
exports.GATEWAY_VERSION = 9;
exports.default = { GATEWAY_OP_CODES: exports.GATEWAY_OP_CODES, GATEWAY_VERSION: exports.GATEWAY_VERSION };
