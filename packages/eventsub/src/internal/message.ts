import { internalMessage, WebsocketMessage } from "./types";

/**
 * Class responsible for parsing incomming ws message
 */
export class Message {
  private readonly message: WebsocketMessage;

  /**
   * ----------Constructor------------
   *
   * @param message The incomming websocket message
   */
  constructor(message: WebsocketMessage) {
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
