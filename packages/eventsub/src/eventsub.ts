import { CloseEvent, MessageEvent, WebSocket } from "ws";
import { createSubscription } from "./internal/api";
import { subRemap } from "./internal/constants";
import { ConnectionClosed, CreateSubscriptionRequestFailed } from "./errors";
import { Listener } from "./internal/listener";
import { Message } from "./internal/message";
import {
  BadResponse,
  Condition,
  ConnectedListener,
  EasyToUseMap,
  EventDataMap,
  ValidSubscription,
  WebsocketMessage,
} from "./internal/types";
import axios from "axios";

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

  private listeners: Listener<any>[] = [];

  // Event listener when we first connect to twitch, doesnt run on subsequent reconnects
  private connectedListener?: ConnectedListener;

  // Take care of above
  private hasCalled: boolean = false;

  // Boolean indicating wether to reconnect or not
  private reconnect: boolean = false;

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
   * @param onConnected optional. Will be called when connection establishes successfully
   */
  public run(onConnected?: ConnectedListener) {
    if (!this._canOpenConnection()) {
      console.log(
        "[-] Cannot open new connection, connection is not in closed state"
      );
      return;
    }

    console.log(`[+] Connecting to twitch eventsub`);

    this.connection = new WebSocket("wss://eventsub.wss.twitch.tv/ws");

    this.connection.onmessage = this._onMessage.bind(this);
    this.connection.onclose = this._onClose.bind(this);
    this.connection.on("ping", this._handlePing.bind(this));
    this.connectedListener = onConnected;
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

    if (this.reconnect) {
      console.log(`[+] Now reconnecting....`);
      this.reconnect = false;

      this.run();
    }
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

    this._resetConnectionLostTimeout();

    const subs = this.listeners.filter(
      (l) =>
        l.getSubscriptionName() ===
        notificationMessage.getMeta().subscription_type
    );

    console.log(notificationMessage);

    subs.forEach((s) => s.triggerHandler({ test: true }));
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
          "[+] successfully Connected to twitch EventSub. Session ID: " +
            this.sessionId
        );

        const timeoutSeconds =
          message.getPayload().session!.keepalive_timeout_seconds;

        this.keepaliveTimeout = timeoutSeconds;

        if (!this.hasCalled) {
          this.hasCalled = true;
          this.connectedListener?.(this.sessionId);
        }

        if (this.reconnect) {
          this.reconnect = false;
          this.connection?.close();
        }

        break;

      case "session_keepalive":
        console.log(
          "[+] Got keepalive message, reseting the keepalive timer. It means the conneection is good"
        );

        break;

      case "session_reconnect":
        console.log("[+] Received reconnect request from twitch");
        const reconnectUrl = message.getPayload().session!.reconnect_url!;

        this._reconnectWithUrl(reconnectUrl);
      default:
        break;
    }

    this._resetConnectionLostTimeout();
  }

  private _resetConnectionLostTimeout() {
    clearTimeout(this.checkConnectionLostTimeout);
    // +10 seconds for safety
    this._startTicking(this.keepaliveTimeout + 10);
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

      this._reconnect();
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

  private _reconnectWithUrl(reconnectUrl: string) {
    this.reconnect = true;

    const newWs = new WebSocket(reconnectUrl);

    newWs.onmessage = this._onMessage.bind(this);
    newWs.onclose = this._onClose.bind(this);
    newWs.on("ping", this._handlePing.bind(this));

    const oldConn = this.connection;

    if (oldConn) {
      oldConn.onclose = () => {
        console.log("[-] Overidden on close handler called ()");
        this.connection = newWs;
      };
    }
  }

  /**
   * Reconnects to twitch eventsub after a disconnect
   */
  private _reconnect() {
    this.reconnect = true;

    this.connection?.close();
  }

  /**
   * Use this to listen to any event
   * @param event Name of the event
   * @param condition Data related to the event required to subscribe
   * @throws ConnectionClosed when you try to register when the connection is established
   */
  public register<T extends keyof EasyToUseMap>(
    event: T,
    condition: Condition<EasyToUseMap[T]>
  ) {
    this._assertConnectionIsOpen();

    const ogEvent = subRemap[event];
    console.log("[+] Listening on event: " + subRemap[event]);

    const l = new Listener(subRemap[event]);

    this._createSubHelper(ogEvent, condition)
      .then(() => {
        console.log("[+] Subscription created successfully");
        this.listeners.push(l);
      })
      .catch((e) => {
        console.log("[-] Subscription creation failed");
        let error = new CreateSubscriptionRequestFailed(ogEvent);

        if (axios.isAxiosError<BadResponse>(e)) {
          error = new CreateSubscriptionRequestFailed(
            ogEvent,
            e.response?.data
          );
        }

        l.triggerError(error);
      });

    return {
      onTrigger: (handler: (data: EventDataMap[typeof ogEvent]) => void) => {
        l.handle(handler);
      },
      onError: (
        handler: (
          error: CreateSubscriptionRequestFailed<typeof ogEvent>
        ) => void
      ) => {
        l.handleError(handler);
      },
      unsusbscribe: () => {},
    };
  }

  /**
   * @param handler Callback function, called when we successfully connect to twitch
   */
  public onConnected(handler: ConnectedListener) {
    this.connectedListener = handler;
  }

  /**
   * Checks wether the connection is still active
   */
  public isConnected() {
    return this.connection !== undefined && this.connection.readyState === 1;
  }
}
