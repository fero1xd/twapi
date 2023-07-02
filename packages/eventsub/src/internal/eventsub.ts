import { InitialSubscribtions, WebsocketMessage } from "./types";
import { WebSocket, MessageEvent } from "ws";
import { ConnectionClosed } from "./errors";

export class EventSub {
  private initialSubscribtions: InitialSubscribtions;

  connection: WebSocket | undefined;
  private sessionId: string | undefined;

  /**
   * ----------Constructor------------
   *
   * @param initialSubscribtions A non empty list of initial subscribtions is important as twitch closes the connection
   *  if we dont subscribe to an event within 10 seconds of connecting
   */
  constructor(initialSubscribtions: InitialSubscribtions) {
    this.initialSubscribtions = initialSubscribtions;
  }

  /**
   * @returns Initial list of subscribtions which was passed in the constructor
   */
  public getInitialSubscribtions() {
    return this.initialSubscribtions;
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
    this._assertConnectionisOpen();

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

  private _assertConnectionisOpen(): asserts this is this & {
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
    return (
      message.metadata.message_type in
      ["session_welcome", "session_keepalive", "session_reconnect"]
    );
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
