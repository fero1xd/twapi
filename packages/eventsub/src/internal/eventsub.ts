import {
  Condition,
  EasyToUseMap,
  ValidSubscription,
  WebsocketMessage,
} from "./types";
import { WebSocket, MessageEvent, CloseEvent } from "ws";
import { ConnectionClosed } from "./errors";
import { Message } from "./message";
import { createSubscription } from "./api";
import { subRemap } from "./constants";

/**
 * Create a new instance whenever you want to interact with twitch eventsub system
 */
export class EventSub {
  // Websocket connection to twitch
  connection: WebSocket | undefined;

  // Session id received in welcome message. used for subscribing to events
  private sessionId?: string;

  // Checks if the current connection to twitch is lost
  private checkConnectionLostTimeout?: NodeJS.Timeout;

  // Number of seconds after which connection is meant to be lost
  private keepaliveTimeout: number = -1;

  // User oauth token
  private readonly oauthToken: string;
  // Client id
  private readonly clientId: string;

  /**
   * ---------CONSTRUCTOR--------
   * @param oauthToken A user oauth token. It is used to create any subscription
   * @param clientId Application id
   */
  constructor(oauthToken: string, clientId: string) {
    this.oauthToken = oauthToken;
    this.clientId = clientId;
  }

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
    this.connection.on("ping", this._handlePing.bind(this));
  }

  /**
   * Handles ping pong cycle
   */
  private _handlePing() {
    this.connection?.pong();
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

    let message = new Message(JSON.parse(e.data as string) as WebsocketMessage);

    if (message.isInternal()) {
      this._handleInternalMessage(message);
      return;
    }

    this._resetConnectionLostTimeout();

    const revocationMessage = message.asRevocation();
    if (revocationMessage) {
      console.log(
        "[-] Subscription revoked for event: " +
          revocationMessage.getMeta().subscription_type
      );
      console.log(
        "Reason: " + revocationMessage.getPayload().subscription.status
      );

      return;
    }

    const notificationMessage = message.asNotification();
    if (!notificationMessage) return;
  }

  /**
   * Makes sure that we are connected
   */
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

        break;

      case "session_keepalive":
        console.log(
          "[+] Got keepalive message, reseting the keepalive timer. It means the conneection is good"
        );

        break;
      default:
        break;
    }
    this._resetConnectionLostTimeout();
  }

  private _resetConnectionLostTimeout() {
    clearTimeout(this.checkConnectionLostTimeout);
    // +15 seconds for safety
    this._startTicking(this.keepaliveTimeout + 15);
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
   * Helper function to create subscriptions
   * @param event Name of the event you want to subsribe to
   * @param condition Data related with that subscribtion
   */
  private async _createSubHelper<T extends ValidSubscription>(
    event: T,
    condition: Condition<T>
  ) {
    this._assertConnectionIsOpen();

    if (!this.sessionId) return;

    await createSubscription(this.oauthToken, this.clientId, {
      type: event,
      version: "1",
      transport: {
        method: "websocket",
        session_id: this.sessionId,
      },
      condition,
    });
  }

  /**
   * Use this to listen to any event
   * @param event Name of the event
   * @param condition Data related to the event required to subscribe
   */
  public on<T extends keyof EasyToUseMap>(
    ...args: Condition<EasyToUseMap[T]> extends Record<string, never>
      ? [event: T]
      : [event: T, condition: Condition<EasyToUseMap[T]>]
  ) {
    const event = args[0];
    console.log("[+] Listening on event: " + subRemap[event]);
  }

  /**
   * Checks wether the connection is still active
   */
  public isConnected() {
    return this.connection !== undefined && this.connection.readyState === 1;
  }
}
