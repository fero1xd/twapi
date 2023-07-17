import WebSocket, { MessageEvent } from "isomorphic-ws";
import { Logger, logger } from "@twapi/logger";
import {
  Fn,
  ListenerWrap,
  MessageType,
  ParseArgs,
  ParsedMap,
  ParsedTopics,
  ResponseListener,
  Topics,
  WebsocketMessage,
} from "./internal/types";
import { topicsMap } from "./internal/constants";
import { Listener } from "./internal/listener";
import { replacePlaceholders } from "./internal/utils";
import { v4 } from "uuid";

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

  // Boolean to indicate if we have to reconnect on connection close
  private reconnect = false;

  // Triggered when connection gets opened to twitch
  private connectedListener?: Fn;

  // Gets triggered before attempt to reconnect
  private reconnectListener?: Fn;

  // Client listen to topics and listeners get added here
  private listeners: Listener[] = [];

  // Listeners are added here when connection is not opened
  private pendingListeners: Listener[] = [];

  // Response listener for incomming pubsub message
  private _responseListeners: ResponseListener[] = [];

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
  public run(connectedListener?: () => void) {
    if (!this._canOpenConnection()) {
      this.log.error("Cannot open new connection right now");
      return;
    }

    if (!this.connectedListener) {
      this.connectedListener = connectedListener;
    }

    this.connection = new WebSocket("wss://pubsub-edge.twitch.tv");
    this.connection.onopen = this._onOpen.bind(this);
    this.connection.onclose = this._onClose.bind(this);
    this.connection.onmessage = this._onMessage.bind(this);
  }

  /**
   * Handles raw incomming pubsub message from twitch
   * @param e Websocket message event
   */
  private _onMessage(e: MessageEvent) {
    const message = JSON.parse(e.data as string) as WebsocketMessage;

    switch (message.type) {
      case MessageType.PONG:
        if (this.deadConnectionTimeout) {
          clearTimeout(this.deadConnectionTimeout);
        }
        break;

      case MessageType.AUTH_REVOKED:
        const revokedTopics = message.data?.topics;
        this.log.error(`Auth revoked for topics: ${revokedTopics}`);

        this.listeners = this.listeners.filter((l) => {
          if (revokedTopics?.includes(l.getParsedTopic())) {
            l.triggerRevocationHandler();
            return false;
          }

          return true;
        });

        break;

      case MessageType.RESPONSE:
        this._responseListeners.forEach((l) => l.handler(message));

        if (message.error) {
          this._handleError(message);
        }
        break;

      case MessageType.RECONNECT:
        this.log.info("Reconnecting in 3 seconds...");
        setTimeout(() => {
          this.reconnect = true;
          this.connection?.close();
        }, 3000);

      case MessageType.MESSAGE:
        const relatedListeners = this.listeners.filter(
          (l) => l.getParsedTopic() === message.data?.topic
        );

        const payload = JSON.parse(message.data?.message);

        relatedListeners.forEach((l) => l.triggerHandler(payload));
    }
  }

  /**
   * Handles error code
   * @param message Websocket message
   */
  private _handleError(message: WebsocketMessage) {
    switch (message.error) {
      case "ERR_BADAUTH":
        break;
      default:
        break;
    }
  }

  /**
   * Adds a message handler that gets triggered when we get RESPONSE as a message type
   */
  private _addResponseListener(handler: (message: WebsocketMessage) => void) {
    const listener = { handler };
    this._responseListeners.push(listener);

    return () =>
      this._responseListeners.splice(
        this._responseListeners.indexOf(listener),
        1
      );
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

  /**
   * Checks if we have to reconnect
   */
  private _onClose() {
    if (this.reconnect) {
      this.reconnect = false;
      this.log.warn("Reconnecting...");
      this.reconnectListener?.();

      this.run();
    }
  }

  /**
   * Registers pending listeners after connection gets opened
   */
  private _registerPendingListeners() {
    if (!this.pendingListeners.length) return;

    this.log.info("Registering pending listeners");

    for (let i = this.pendingListeners.length - 1; i >= 0; i--) {
      const l = this.pendingListeners[i];

      let timeout: NodeJS.Timeout;
      const finalTopic = l.getParsedTopic();

      const unsubscribe = this._addResponseListener((message) => {
        const nonce = l.getNonce();

        if (message.nonce !== nonce) return;

        unsubscribe();
        if (timeout) clearTimeout(timeout);

        if (message.error) {
          this.log.error(
            "Error listening on the topic: " +
              finalTopic +
              ", error: " +
              message.error
          );
          if (message.error === "ERR_BADAUTH") {
            this.log.error(
              "Please check if your access token has required oauth scopes for this topic"
            );
          }

          l.triggerErrorHandler(message.error);

          return;
        }

        this._addListener(l);

        this.log.info("Successfully listening on topic: " + finalTopic);
      });

      timeout = setTimeout(() => {
        unsubscribe();
        this.log.error("Timeout while listening on topic: " + finalTopic);
        l.triggerTimeoutHandler();
      }, 2000);

      this._send({
        type: MessageType.LISTEN,
        nonce: l.getNonce(),
        data: {
          topics: [l.getParsedTopic()],
          auth_token: this.oauthToken,
        },
      });

      this.pendingListeners.splice(i, 1);
    }
  }

  /**
   * Initializes heartbeat interval when connection gets opened
   */
  private _onOpen() {
    this.log.info("Successfully connected to twitch pubsub");
    this.heartbeatInterval = setInterval(
      this._heartbeat.bind(this),
      this.heartbeatIntervalMs
    );

    this.connectedListener?.();
    this._registerPendingListeners();
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

      this.reconnect = true;
      this.connection?.close();
    }, 15 * 1000); // 10 Seconds + 5 seconds
  }

  /**
   * Use this method to listen on topics
   *
   * @param topic A valid topic to listen on
   * @param data Specific data required to subscribe to this event
   */
  public register<T extends ParsedTopics>(
    topic: T,
    data: ParseArgs<ParsedMap[T]>
  ): ListenerWrap<ParsedMap[T]> {
    const ogTopic = topicsMap[topic];
    const finalTopic = replacePlaceholders(ogTopic, data);

    const nonce = this._generateNonce();
    const listener = new Listener(ogTopic, finalTopic, nonce);

    this.log.info("Requesting to listen on topic: " + finalTopic);

    if (!this.isConnected()) {
      this.log.warn("Waiting till connection is established");
      this.pendingListeners.push(listener);
    } else {
      let timeout: NodeJS.Timeout;

      const unsubscribe = this._addResponseListener((message) => {
        if (message.nonce !== nonce) return;

        unsubscribe();
        if (timeout) clearTimeout(timeout);

        if (message.error) {
          this.log.error(
            "Error listening on the topic: " +
              finalTopic +
              ", error: " +
              message.error
          );

          listener.triggerErrorHandler(message.error);

          return;
        }

        this._addListener(listener);
        this.log.info("Successfully listening on topic: " + finalTopic);
      });

      timeout = setTimeout(() => {
        unsubscribe();
        this.log.error("Timeout while listening on topic: " + finalTopic);
        listener.triggerTimeoutHandler();
      }, 2000);

      this._send({
        type: MessageType.LISTEN,
        nonce,
        data: {
          topics: [finalTopic],
          auth_token: this.oauthToken,
        },
      });
    }

    return this._listenerWrap<ParsedMap[typeof topic]>(listener, nonce);
  }

  /**
   * Wraps the actual listener object
   *
   * @param listener The listener instance
   * @param nonce Random string used to confirm stuff
   * @returns A wrapper to interact with the underneath listener
   */
  private _listenerWrap<T extends Topics>(
    listener: Listener,
    nonce: string
  ): ListenerWrap<T> {
    const finalTopic = listener.getParsedTopic();
    return {
      onTrigger: (handler) => {
        listener.setTriggerHandler(handler);
      },
      onError: (handler) => {
        listener.setErrorHandler(handler);
      },
      onRevocation: (handler) => {
        listener.setRevocationHandler(handler);
      },
      onTimeout: (handler) => {
        listener.setTimeoutHandler(handler);
      },
      unsubscribe: () => {
        this.log.info("Unsubscribing to topic: " + finalTopic);

        this.listeners = this.listeners.filter((l) => l.getNonce() !== nonce);

        const multipleListeners = this.listeners.filter(
          (l) => l.getParsedTopic() === finalTopic
        );

        // Pubsub sends a notification only once even if you have subscribed to the event multiple times,
        // But to support multiple listeners we will only send an UNLISTEN command when we dont have anymore listener for this topic
        if (multipleListeners.length === 0) {
          this._send({
            type: MessageType.UNLISTEN,
            data: {
              topics: [finalTopic],
            },
          });
        }
      },
    };
  }

  /**
   * Helper function to generate random nonce
   */
  private _generateNonce() {
    return v4();
  }

  /**
   * Helper function to send command to pubsub
   * @param payload Message to send
   */
  private _send(payload: WebsocketMessage) {
    this.connection?.send(JSON.stringify(payload));
  }

  /**
   * Helper function to add listener in order to prevent duplicate listeners
   * @param listener The listener object to add
   */
  private _addListener(listener: Listener) {
    if (this.listeners.find((l) => listener.getNonce() === l.getNonce())) {
      return false;
    }

    this.listeners.push(listener);
    return true;
  }

  /**
   * Sets the connected listener
   * @param handler A callback function that will only run on the first successfull connect
   */
  public onConnected(handler: Fn) {
    this.connectedListener = handler;
  }

  /**
   * Sets the connected listener
   * @param handler A callback function that will always run before an attempt to reconnect
   */
  public onReconnect(handler: Fn) {
    this.reconnectListener = handler;
  }

  /**
   * Checks if we are connected to twitch
   * @returns true if connection is in open state
   */
  public isConnected() {
    return this.connection !== undefined && this.connection.readyState === 1;
  }
}
