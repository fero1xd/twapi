import { internalMessage } from "./constants";
import { ValidSubscription, WebsocketMessage } from "./types";

/**
 * Class responsible for parsing incomming ws message
 */
export class Message<
  TEvent extends ValidSubscription = never,
  TSub extends boolean = false
> {
  private readonly message: WebsocketMessage<TEvent, TSub>;

  /**
   * ----------Constructor------------
   *
   * @param message The incomming websocket message
   */
  constructor(message: WebsocketMessage<TEvent, TSub>) {
    this.message = message;
  }

  /**
   * Gets the metadata.message_type property
   * @returns The type of message. see MessageType type
   */
  getType() {
    return this.message.metadata.message_type;
  }

  /**
   * All messages except notification and revocation message are considered as internal message and end user has nothing to do with it
   * @returns true if message type starts with session_
   */
  isInternal() {
    // @ts-ignore - OkkkkkkkkkK!
    return internalMessage.includes(this.message.metadata.message_type);
  }

  /**
   * @returns same instance with new generics
   */
  asNotification(): Message<TEvent, true> | null {
    if (this.message.metadata.message_type === "notification") {
      return this as Message<TEvent, true>;
    }

    return null;
  }

  /**
   * @returns same instance with new generics
   */
  asRevocation(): Message<TEvent, true> | null {
    if (this.message.metadata.message_type === "revocation") {
      return this as Message<TEvent, true>;
    }

    return null;
  }

  /**
   * @returns the raw message type
   */
  getRaw() {
    return this.message;
  }

  /**
   *
   * @returns the message metadata
   */
  getMeta() {
    return this.message.metadata;
  }

  /**
   *
   * @returns the message payload. can be empty for keep alive messages
   */
  getPayload() {
    return this.message.payload;
  }
}
