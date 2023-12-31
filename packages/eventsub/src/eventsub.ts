import { type LoggerType, createLogger } from "@twapi/logger";
import axios from "axios";
import WebSocket, { MessageEvent, CloseEvent } from "isomorphic-ws";
import { ConnectionClosed, CreateSubscriptionRequestFailed } from "./errors";
import { createSubscription, deleteSubscription } from "./internal/api";
import { subRemap } from "./internal/constants";
import { Listener } from "./internal/listener";
import { Message } from "./internal/message";
import {
  BadResponse,
  Condition,
  ConnectedListener,
  EasyToUseMap,
  EventDataMap,
  RevocationReason,
  ValidSubscription,
  WebsocketMessage,
} from "./internal/types";
import { AuthProvider } from "@twapi/auth";

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

  // Auth Provider
  private readonly _authProvider: AuthProvider;

  // All currently active listeners
  private listeners: Listener[] = [];

  // Listeners waiting to be registered
  private pendingListeners: Listener[] = [];

  // Event listener when we first connect to twitch, doesnt run on subsequent reconnects
  private connectedListener?: ConnectedListener;

  // Called before reconnect
  private reconnectListener?: () => void;

  // Take care of above
  private hasCalled: boolean = false;

  // Boolean indicating wether to reconnect or not
  private reconnect: boolean = false;

  // Logger
  private log: LoggerType;

  /**
   * ---------CONSTRUCTOR--------
   * @param authProvider Twitch Authentication provider for eventsub
   */
  constructor(authProvider: AuthProvider) {
    this._authProvider = authProvider;
    this.log = createLogger("eventsub");
  }

  /**
   * Connects to twitch's eventsub system
   * @param onConnected optional. Will be called when connection establishes successfully
   */
  public run(onConnected?: ConnectedListener) {
    if (!this._canOpenConnection()) {
      this.log.error(
        "Cannot open new connection, connection is not in closed state"
      );
      return;
    }

    this.log.info(`Connecting to twitch eventsub`);

    this.connection = new WebSocket("wss://eventsub.wss.twitch.tv/ws");

    this.connection.onmessage = this._onMessage.bind(this);

    this.connection.onclose = this._onClose.bind(this);
    this.connection.on("ping", this._handlePing.bind(this));

    if (!this.connectedListener) {
      this.connectedListener = onConnected;
    }
  }

  private async _registerListenersAfterReconnect() {
    if (this.listeners.length > 0) {
      this.log.info("Resubscribing to events after reconnect");

      for (let i = this.listeners.length - 1; i >= 0; i--) {
        const l = this.listeners[i];
        const ogEvent = l.getSubscriptionName();
        await this._createSub(ogEvent, l.getCondition(), l, false);
      }
    }
  }

  private async _registerPendingListeners() {
    if (this.pendingListeners.length > 0) {
      this.log.info("Registering pending listeners");

      for (let i = this.pendingListeners.length - 1; i >= 0; i--) {
        const l = this.pendingListeners[i];
        const ogEvent = l.getSubscriptionName();
        await this._createSub(ogEvent, l.getCondition(), l);
        this.pendingListeners.splice(i, 1);
      }
    }
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
    this.log.warn("Websocket connection closed, Reason: " + e.code);
    this.sessionId = undefined;
    clearTimeout(this.checkConnectionLostTimeout);

    if (this.reconnect) {
      this.log.info("Now reconnecting....");
      this.reconnect = false;

      this.reconnectListener?.();

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
      this.log.error(
        "[-] Subscription revoked for event: " +
          revocationMessage.getMeta().subscription_type
      );
      const reason = revocationMessage.getPayload().subscription.status;

      this.log.error("Reason: " + reason);

      this.listeners = this.listeners.filter((l) => {
        if (
          l.getSubscriptionName() ===
          revocationMessage.getMeta().subscription_type
        ) {
          l.triggerRevocationHandler(reason as RevocationReason);

          return false;
        }

        return true;
      });

      return;
    }

    const notificationMessage = message.asNotification();
    if (!notificationMessage) return;

    this._resetConnectionLostTimeout();

    const subs = this.listeners.filter(
      (l) => l.getId() === notificationMessage.getPayload().subscription.id
    );

    subs.forEach((s) =>
      s.triggerHandler(notificationMessage.getPayload().event)
    );
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

        this.log.info(
          "Successfully Connected to twitch EventSub. Session ID: " +
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
          // It means we are going to reconnect with url that already has the subscriptions
          this.reconnect = false;
          this.reconnectListener?.();

          this.connection?.close();
        } else {
          this._registerListenersAfterReconnect();
        }

        this._registerPendingListeners();

        break;

      case "session_keepalive":
        this.log.info(
          "Got keepalive message. It means the connnection is good"
        );

        break;

      case "session_reconnect":
        this.log.warn("Received reconnect request from twitch");
        const reconnectUrl = message.getPayload().session!.reconnect_url!;

        this._reconnectWithUrl(reconnectUrl);
      default:
        break;
    }

    this._resetConnectionLostTimeout();
  }

  /**
   * Resets the connection lost timeout that keep tracks of lost connection
   */
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
      this.log.error(
        `No event or keepalive message received in last ${secs} seconds. This connection is probably lost, reconnecting!`
      );

      this._reconnect();
    }, secs * 1000);
  }

  private async _createSub<T extends ValidSubscription>(
    event: T,
    condition: Condition<T>,
    l: Listener<T, Condition<T>>,
    add: boolean = true
  ) {
    await this._createSubHelper(event, condition)
      .then((id) => {
        this.log.info("Subscription created successfully for event: " + event);

        l.setId(id!);
        add && this.listeners.push(l);
      })
      .catch((e) => {
        this.log.error("Subscription creation failed for event: " + event);
        let error = new CreateSubscriptionRequestFailed(event);

        if (axios.isAxiosError<BadResponse>(e)) {
          error = new CreateSubscriptionRequestFailed(event, e.response?.data);
        }

        l.triggerError(error);
      });
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

    const accessToken = await this._authProvider.getUserAccessToken();

    return await createSubscription(
      accessToken,
      this._authProvider.getClientId(),
      {
        type: event,
        version: "1",
        transport: {
          method: "websocket",
          session_id: this.sessionId,
        },
        condition,
      }
    );
  }

  /**
   * Reconnects to twitch eventsub after a disconnect with a reconnect url
   * @param reconnectUrl The url to connect to
   */
  private _reconnectWithUrl(reconnectUrl: string) {
    this.reconnect = true;

    const newWs = new WebSocket(reconnectUrl);

    newWs.onmessage = this._onMessage.bind(this);
    newWs.onclose = this._onClose.bind(this);
    newWs.on("ping", this._handlePing.bind(this));

    const oldConn = this.connection;

    if (oldConn) {
      oldConn.onclose = () => {
        this.log.info(
          "Old websocket connection closed, replacing with newly created one."
        );
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
   * Helper function to delete subsrciption
   * @param id Subscription Id
   */
  private async _deleteSubscription(id: string) {
    this._assertConnectionIsOpen();
    const accessToken = await this._authProvider.getUserAccessToken();

    await deleteSubscription(id, accessToken, this._authProvider.getClientId());
  }

  /**
   * Use this to listen to any event
   * @param event Name of the event
   * @param condition Data related to the event required to subscribe
   */
  public register<T extends keyof EasyToUseMap>(
    event: T,
    condition: Condition<EasyToUseMap[T]>
  ) {
    const ogEvent = subRemap[event];
    const l = new Listener(ogEvent, condition);

    if (!this.isConnected()) {
      this.log.warn("Not currently connected to twitch, waiting listener.");

      this.pendingListeners.push(l);
    } else {
      this.log.info("Requesting to listen on event: " + ogEvent);

      this._createSub(ogEvent, condition, l);
    }

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
      onRevocation: (handler: (reason: RevocationReason) => void) => {
        l.handleRevocation(handler);
      },
      unsubscribe: async () => {
        if (l.getId()) {
          try {
            this.listeners = this.listeners.filter(
              (listener) => listener.getId() !== l.getId()
            );

            await this._deleteSubscription(l.getId()!);
            this.log.info("Successfuly deleted subscription");
          } catch (ignored) {
            this.log.error("Deleting subscription failed");
          }
        }
      },
    };
  }

  /**
   * @param handler Callback function, called when we successfully connect to twitch
   */
  public onConnected(handler: ConnectedListener) {
    this.connectedListener = handler;
  }

  /**
   * @param handler Callback function, called before a reconnect
   */
  public onReconnect(handler: () => void) {
    this.reconnectListener = handler;
  }

  /**
   * Checks wether the connection is still active
   */
  public isConnected() {
    return this.connection !== undefined && this.connection.readyState === 1;
  }
}
