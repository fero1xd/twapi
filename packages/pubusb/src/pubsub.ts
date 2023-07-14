import { WebSocket, MessageEvent } from "ws";
import { Logger, logger } from "@twapi/logger";
import {
  ErrorHandlerFn,
  ListenerWrap,
  MessageType,
  ParseArgs,
  ParsedMap,
  ParsedTopics,
  TriggerHandler,
  WebsocketMessage,
} from "./internal/types";
import { topicsMap } from "./internal/constants";
import { Listener } from "./internal/listener";
import { replacePlaceholders } from "./internal/utils";
import crypto from "crypto";

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

  private reconnect = false;

  private connectedListener?: () => void;

  private listeners: Listener[] = [];

  private _responseListeners: {
    handler: (message: WebsocketMessage) => void;
  }[] = [];

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
    this.connectedListener = connectedListener;

    this.connection = new WebSocket("wss://pubsub-edge.twitch.tv");
    this.connection.onopen = this._onOpen.bind(this);
    this.connection.onclose = this._onClose.bind(this);
    this.connection.onmessage = this._onMessage.bind(this);
  }

  private _onMessage(e: MessageEvent) {
    const message = JSON.parse(e.data as string) as WebsocketMessage;

    if (message.type === MessageType.PONG && this.deadConnectionTimeout) {
      clearTimeout(this.deadConnectionTimeout);
      return;
    }

    switch (message.type) {
      case MessageType.PONG:
        if (this.deadConnectionTimeout) {
          clearTimeout(this.deadConnectionTimeout);
          break;
        }

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

      case MessageType.MESSAGE:
        const relatedListeners = this.listeners.filter(
          (l) => l.getParsedTopic() === message.data?.topic
        );

        relatedListeners.forEach((l) => l.triggerHandler({ test: true }));

        const payload = message.data?.message;
    }
  }

  private _handleError(message: WebsocketMessage) {
    switch (message.error) {
      case "ERR_BADAUTH":
        this.listeners = this.listeners.filter((l) => {
          if (l.getParsedTopic() === message.nonce) {
            this.log.error("Error BAD_AUTH for topic: " + l.getParsedTopic());

            l.triggerErrorHandler(message.error!);
            return false;
          }

          return true;
        });
        break;
      default:
        break;
    }
  }

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
      this.run();
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
  ) {
    const ogTopic = topicsMap[topic];
    const finalTopic = replacePlaceholders(ogTopic, data);

    const listener = new Listener(ogTopic, finalTopic);
    this.listeners.push(listener);
    const nonce = this._generateNonce();

    this.log.info("Requesting to listen on topic: " + finalTopic);

    return new Promise<ListenerWrap<typeof ogTopic>>((res, rej) => {
      let timeout: NodeJS.Timeout;

      const unsubscribe = this._addResponseListener((message) => {
        if (message.nonce !== nonce) return;

        unsubscribe();
        if (timeout) clearTimeout(timeout);

        if (message.error) {
          // throw error
          this.log.error(
            "Error listening on the topic: " +
              finalTopic +
              ", error: " +
              message.error
          );
          rej(
            new Error(
              "Error listening on the topic: " +
                finalTopic +
                ", error: " +
                message.error
            )
          );
          return;
        }

        this.log.info("Successfully listening on topic: " + finalTopic);
        res({
          onTrigger: (handler) => {
            listener.setTriggerHandler(handler);
          },
          onError: (handler) => {
            listener.setErrorHandler(handler);
          },
          onRevocation: (handler) => {
            listener.setRevocationHandler(handler);
          },
          unsubscribe: () => {
            this.log.info("Unsubscribing to topic: " + topic);
            this.listeners = this.listeners.filter(
              (l) => l.getTopic() === ogTopic
            );
            this._send({
              type: MessageType.UNLISTEN,
              data: {
                topics: [finalTopic],
              },
            });
          },
        });
      });

      timeout = setTimeout(() => {
        unsubscribe();
        this.log.error("Timeout while listening on topic: " + finalTopic);
        rej(new Error("Timeout error"));
      }, 2000);

      this._send({
        type: MessageType.LISTEN,
        nonce,
        data: {
          topics: [finalTopic],
          auth_token: this.oauthToken,
        },
      });
    });
  }

  private _generateNonce() {
    return crypto.randomBytes(16).toString("base64");
  }

  /**
   * Helper function to send command to pubsub
   * @param payload Message to send
   */
  private _send(payload: WebsocketMessage) {
    this.connection?.send(JSON.stringify(payload));
  }
}
