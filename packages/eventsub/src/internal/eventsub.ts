import { WebsocketMessage } from "./types";
import { WebSocket, MessageEvent, CloseEvent } from "ws";
import { ConnectionClosed } from "./errors";
import { Message } from "./message";

export class EventSub {
  connection: WebSocket | undefined;
  private sessionId: string | undefined;

  private checkConnectionLostTimeout: NodeJS.Timeout | undefined;
  private keepaliveTimeout: number = -1;

  /**
   * Connects to twitch's eventsub system
   */
  public run() {
    if (
      this.connection?.OPEN ||
      this.connection?.CONNECTING ||
      this.connection?.CLOSING
    ) {
      console.log("[-] Connection is already opened or is connecting/closing");
      return;
    }

    this.connection = new WebSocket("wss://eventsub.wss.twitch.tv/ws");
    this.connection.onmessage = this._onMessage.bind(this);

    this.connection.onclose = this._onClose.bind(this);
  }

  private _onClose(e: CloseEvent) {
    console.log("[-] Websocket connection closed, Reason: " + e.code);
    this.sessionId = undefined;
    clearTimeout(this.checkConnectionLostTimeout);
  }

  private _onMessage(e: MessageEvent) {
    this._assertConnectionIsOpen();

    if (e.data === "PING") {
      console.log("[+] Received ping: " + e.data);
      return this.connection.send("PONG");
    }

    const message = new Message(
      JSON.parse(e.data as string) as WebsocketMessage
    );

    if (message.isInternal()) {
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

        // +5 seconds for safety
        this._startTicking(timeoutSeconds + 5);

        break;

      case "session_keepalive":
        console.log(
          "[+] Got keepalive message, reseting the keepalive timer. It means the conneection is good"
        );

        clearTimeout(this.checkConnectionLostTimeout);
        this._startTicking(this.keepaliveTimeout);

        break;
      default:
        break;
    }
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
   * Checks wether the connection is still active
   */
  public isConnected() {
    return this.connection && this.connection.readyState === 1;
  }
}
