import { CloseEvent, MessageEvent, WebSocket } from "ws";
import { createSubscription, deleteSubscription } from "./internal/api";
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
  RevocationReason,
  ValidSubscription,
  WebsocketMessage,
} from "./internal/types";
import axios from "axios";
import { logger } from "@twapi/logger";

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

  // All currently active listeners
  private listeners: Listener[] = [];

  // Listeners waiting to be registered
  private pendingListeners: Listener[] = [];

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
      logger.error(
        "Cannot open new connection, connection is not in closed state"
      );
      return;
    }

    logger.info(`Connecting to twitch eventsub`);

    this.connection = new WebSocket("wss://eventsub.wss.twitch.tv/ws");

    this.connection.onmessage = this._onMessage.bind(this);
    this.connection.onclose = this._onClose.bind(this);
    this.connection.on("ping", this._handlePing.bind(this));

    if (!this.connectedListener) {
      this.connectedListener = onConnected;
    }
  }

  private _registerPendingListeners() {
    if (this.pendingListeners.length > 0) {
      logger.info("Registering pending listeners");

      this.pendingListeners.forEach((l, i) => {
        const ogEvent = l.getSubscriptionName();
        this._createSubHelper(ogEvent, l.getCondition())
          .then((id) => {
            logger.info(
              "Subscription created successfully for event: " + ogEvent
            );

            l.setId(id!);
            this.listeners.push(l);
          })
          .catch((e) => {
            logger.error("Subscription creation failed for event: " + ogEvent);
            let error = new CreateSubscriptionRequestFailed(ogEvent);

            if (axios.isAxiosError<BadResponse>(e)) {
              error = new CreateSubscriptionRequestFailed(
                ogEvent,
                e.response?.data
              );
            }

            l.triggerError(error);
          });
      });

      this.pendingListeners = [];
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
    logger.warn("Websocket connection closed, Reason: " + e.code);
    this.sessionId = undefined;
    clearTimeout(this.checkConnectionLostTimeout);

    if (this.reconnect) {
      logger.info("Now reconnecting....");
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
      logger.error(
        "[-] Subscription revoked for event: " +
          revocationMessage.getMeta().subscription_type
      );
      const reason = revocationMessage.getPayload().subscription.status;

      logger.error("Reason: " + reason);

      const revokedSubs = this.listeners.filter(
        (l) =>
          l.getSubscriptionName() ===
          revocationMessage.getMeta().subscription_type
      );

      revokedSubs.forEach((s) =>
        s.triggerRevocationHandler(reason as RevocationReason)
      );

      this.listeners = this.listeners.filter(
        (l) =>
          l.getSubscriptionName() !==
          revocationMessage.getMeta().subscription_type
      );

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

        logger.info(
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
          this.reconnect = false;
          this.connection?.close();
        }

        this._registerPendingListeners();

        break;

      case "session_keepalive":
        logger.info("Got keepalive message. It means the connnection is good");

        break;

      case "session_reconnect":
        logger.warn("Received reconnect request from twitch");
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
      logger.error(
        `No event or keepalive message received in last ${secs} seconds. This connection is probably lost, reconnecting!`
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

    return await createSubscription(this.oauthToken, this.clientId, {
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
        logger.info(
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
    await deleteSubscription(id, this.oauthToken, this.clientId);
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
      logger.warn("Not currently connected to twitch, waiting listener.");

      this.pendingListeners.push(l);
    } else {
      logger.info("Requesting to listen on event: " + ogEvent);

      this._createSubHelper(ogEvent, condition)
        .then((id) => {
          logger.info(
            "Subscription created successfully for event: " + ogEvent
          );

          l.setId(id!);
          this.listeners.push(l);
        })
        .catch((e) => {
          logger.error("Subscription creation failed for event: " + ogEvent);
          let error = new CreateSubscriptionRequestFailed(ogEvent);

          if (axios.isAxiosError<BadResponse>(e)) {
            error = new CreateSubscriptionRequestFailed(
              ogEvent,
              e.response?.data
            );
          }

          l.triggerError(error);
        });
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
            logger.info("Successfuly deleted subscription");
          } catch (ignored) {
            logger.error("Deleting subscription failed");
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
   * Checks wether the connection is still active
   */
  public isConnected() {
    return this.connection !== undefined && this.connection.readyState === 1;
  }
}
