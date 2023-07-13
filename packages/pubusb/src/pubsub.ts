import { WebSocket } from "ws";
import { Logger, logger } from "@twapi/logger";
import { MessageType } from "./internal/types";

export class PubSub {
  // Websocket Connection to twitch
  private connection?: WebSocket;

  // User access token
  private oauthToken: string;

  // Logger
  private log: Logger;

  // This interval sends PING message at a fixed interval
  private heartbeatInterval?: NodeJS.Timer;

  // Number of miliseconds after which we have to send a ping message - 4 mins
  private heartbeatIntervalMs = 4 * 1000 * 60;

  // Timeout for keeping track of dead connection, so that we can reconnect
  private deadConnectionTimeout?: NodeJS.Timeout;

  /**
   * --------CONSTRUCTOR-------
   * @param oauthToken A user access token used to subscribe to events
   */
  constructor(oauthToken: string) {
    this.oauthToken = oauthToken;
    this.log = logger("pubsub");
  }

  /**
   * Tries to connect to twitch's pubusb
   */
  public run() {
    if (!this._canOpenConnection()) {
      this.log.error("Cannot open new connection right now");
      return;
    }

    this.connection = new WebSocket("wss://pubsub-edge.twitch.tv");
    this.connection.onopen = this._onOpen.bind(this);

    this.connection.onmessage = (e) => {
      const data = JSON.parse(e.data as string);

      if (data.type === MessageType.PONG && this.deadConnectionTimeout) {
        this.log.info("Resetted dead connection timeout");
        clearTimeout(this.deadConnectionTimeout);
      }
    };
  }

  /**
   * @returns true if connection is not initialized or is in closed state
   */
  private _canOpenConnection() {
    if (!this.connection) {
      return true;
    }

    return this.connection.readyState === 3;
  }

  private _onOpen() {
    this.log.info("Successfully connected to twitch pubsub");
    this.heartbeatInterval = setInterval(
      this._heartbeat.bind(this),
      this.heartbeatIntervalMs
    );
  }

  /**
   * Sends PING messages at an interval to the server
   */
  private _heartbeat() {
    this.log.info("Sending heartbeat");
    this._send({
      type: MessageType.PING,
    });

    this.deadConnectionTimeout = setTimeout(() => {
      // We reached here, it means we didnt receive a response pong message in a while
      clearInterval(this.heartbeatInterval);

      // TODO: Reconnect
    }, 15 * 1000); // 10 Seconds + 5 seconds
  }

  /**
   * Helper function to send command to pubsub
   * @param payload Message to send
   */
  private _send(payload: Record<string, any>) {
    this.connection?.send(JSON.stringify(payload));
  }
}
