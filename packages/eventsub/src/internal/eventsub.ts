import {
  InitialSubscriptions,
  internalMessage,
  WebsocketMessage,
} from "./types";
import { WebSocket, MessageEvent } from "ws";
import { ConnectionClosed } from "./errors";

export class EventSub {
  private initialSubscriptions: InitialSubscriptions;

  connection: WebSocket | undefined;
  private sessionId: string | undefined;

  /**
   * ----------Constructor------------
   *
   * @param initialSubscriptions A non empty list of initial subscriptions is important as twitch closes the connection
   *  if we dont subscribe to an event within 10 seconds of connecting
   */
  constructor(initialSubscriptions: InitialSubscriptions) {
    this.initialSubscriptions = initialSubscriptions;
  }

  /**
   * @returns Initial list of subscriptions which was passed in the constructor
   */
  public getInitialSubscribtions() {
    return this.initialSubscriptions;
  }

  /**
   * Connects to twitch's eventsub system
   */
  public run() {
    if (this.connection?.OPEN || this.connection?.CONNECTING) {
      console.log("[-] Connection is already opened or is connecting");
      return;
    }

    this.connection = new WebSocket("wss://eventsub.wss.twitch.tv/ws");
    this.connection.onmessage = this._onMessage;
    this.connection.onclose = (e) => {
      console.log("[-] Websocket connection closed, Reason: " + e.code);
    };
  }

  private _onMessage(e: MessageEvent) {
    this._assertConnectionIsOpen();

    if (e.data === "PING") {
      console.log("[+] Received ping: " + e.data);
      return this.connection.send("PONG");
    }

    const message = JSON.parse(e.data as string) as WebsocketMessage;

    if (this._isInternalMessage(message)) {
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
   * All messages except notification and revocation message are considered as internal message and end user has nothing to do with it
   */
  private _isInternalMessage(message: WebsocketMessage) {
    return message.metadata.message_type in internalMessage;
  }

  /**
   * Handles internal ws commands
   * @param message Websocket parsed message
   */
  private _handleInternalMessage(message: WebsocketMessage) {
    console.log(message);
  }

  /**
   * Checks wether the connection is still active
   */
  public isConnected() {
    return this.connection && this.connection.OPEN;
  }
}
