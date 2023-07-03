import { WebsocketMessage } from "./types";
import { WebSocket, MessageEvent, CloseEvent } from "ws";
import { ConnectionClosed } from "./errors";
import { Message } from "./message";

/**
 * Create a new instance whenever you want to interact with twitch eventsub system
 */
export class EventSub {
  // Websocket connection to twitch
  connection: WebSocket | undefined;

  // Session id received in welcome message. used for subscribing to events
  private sessionId: string | undefined;

  // Checks if the current connection to twitch is lost
  private checkConnectionLostTimeout: NodeJS.Timeout | undefined;

  // Number of seconds after which connection is meant to be lost
  private keepaliveTimeout: number = -1;

  /**
   * ---------CONSTRUCTOR--------
   */
  constructor() {}

  /**
   * Connects to twitch's eventsub system
   */
  public run() {
    if (!this._canOpenConnection()) {
      console.log(
        "[-] Cannot open new connection, connection is not in closed state"
      );
      return;
    }

    this.connection = new WebSocket("wss://eventsub.wss.twitch.tv/ws");
    this.connection.onmessage = this._onMessage.bind(this);
    this.connection.onclose = this._onClose.bind(this);
  }

  /**
   * Checks if we can connect/reconnect
   * @returns true if connection is undefined or closed, false if connection is not in closed state
   */
  private _canOpenConnection() {
    if (!this.connection) {
      return true;
    }

    return this.connection.readyState === 3;
  }

  /**
   * Handles closing of the connection
   * @param e Websocket Close event
   */
  private _onClose(e: CloseEvent) {
    console.log("[-] Websocket connection closed, Reason: " + e.code);
    this.sessionId = undefined;
    clearTimeout(this.checkConnectionLostTimeout);
  }

  /**
   * Handles incomming raw websocket message
   * @param e Raw websocket message event
   */
  private _onMessage(e: MessageEvent) {
    this._assertConnectionIsOpen();

    if (e.data === "PING") {
      console.log("[+] Received ping: " + e.data);
      return this.connection.send("PONG");
    }

    const message = new Message(
      JSON.parse(e.data as string) as WebsocketMessage
    );

    if (message.isInternal()) {
      this._handleInternalMessage(message);
      return;
    }
  }

  private _assertConnectionIsOpen(): asserts this is this & {
    connection: WebSocket;
  } {
    if (!this.isConnected()) {
      throw new ConnectionClosed();
    }
  }

  /**
   * Handles internal ws commands
   * @param message Websocket parsed message
   */
  private _handleInternalMessage(message: Message) {
    switch (message.getType()) {
      case "session_welcome":
        this.sessionId = message.getPayload().session!.id;

        console.log(
          "[+] Successfuly Connected to twitch EventSub. Session ID: " +
            this.sessionId
        );

        const timeoutSeconds =
          message.getPayload().session!.keepalive_timeout_seconds;

        this.keepaliveTimeout = timeoutSeconds;

        // +5 seconds for safety
        this._startTicking(timeoutSeconds + 5);

        break;

      case "session_keepalive":
        console.log(
          "[+] Got keepalive message, reseting the keepalive timer. It means the conneection is good"
        );

        clearTimeout(this.checkConnectionLostTimeout);
        this._startTicking(this.keepaliveTimeout);

        break;
      default:
        break;
    }
  }

  /**
   * If no event or keepalive message received in last specified seconds. Then attempt to close and reconnect
   * @param number Amount of seconds after which we will reconnect
   */
  private _startTicking(secs: number) {
    this.checkConnectionLostTimeout = setTimeout(() => {
      // Check first if we have disconnected for some other reason
      // If yes then dont reconnect
      if (!this.isConnected()) {
        return;
      }

      // We reach here, it means immediately reconnect
      console.log(
        `[-] No event or keepalive message received in last ${secs} seconds. This connection is probably lost, reconnecting!`
      );

      // TODO: Reconnect
    }, secs * 1000);
  }

  /**
   * Checks wether the connection is still active
   */
  public isConnected() {
    return this.connection !== undefined && this.connection.readyState === 1;
  }
}
