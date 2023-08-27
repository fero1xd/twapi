import { AuthProvider } from "@twapi/auth";
import { WebSocket, MessageEvent } from "isomorphic-ws";
import { type LoggerType, createLogger } from "@twapi/logger";
import { splitIrcMessage } from "./internal/utils";
import { parseMessage } from "./internal/parser";

export class ChatClient {
  // Websocket connection
  private _connection?: WebSocket;

  // Authentication provider
  private _authProvider: AuthProvider;

  // Twitch capabilities for extra information in messages
  private _capabilites: string[];

  // Logger
  private _log: LoggerType;

  /**
   * --------CONSTRUCTOR--------
   *
   * @param authProvider Autnentication provider for the chat client
   */
  constructor(authProvider: AuthProvider) {
    this._authProvider = authProvider;
    this._capabilites = [
      "twitch.tv/membership",
      "twitch.tv/tags",
      "twitch.tv/commands",
    ];
    this._log = createLogger("twapi:chat");
  }

  public connect() {
    this._connection = new WebSocket("ws://irc-ws.chat.twitch.tv:80");

    this._connection.onopen = this._onOpen.bind(this);
    this._connection.onmessage = this._onMessage.bind(this);
  }

  private _onMessage(e: MessageEvent) {
    const messages = splitIrcMessage(e.data.toString());

    messages.forEach((m) => console.log(parseMessage(m)));
  }

  private async _onOpen() {
    this._log.info("Connection opened to twitch's server");

    const userAccessToken = await this._authProvider.getUserAccessToken();
    const nick = await this._authProvider.getUserName();

    const payload = [
      `CAP REQ :${this._capabilites.join(" ")}`,
      `PASS oauth:${userAccessToken}`,
      `NICK ${nick}`,
    ];
    this._send(payload);
  }

  private _send(payload: string | string[]) {
    if (!this.isConnected()) {
      this._log.warn("Cannot send message as connection is closed.");
      return;
    }

    if (Array.isArray(payload)) {
      for (const p of payload) {
        this._connection?.send(p);
      }
    } else {
      this._connection?.send(payload);
    }
  }

  public isConnected() {
    return this._connection !== undefined && this._connection.readyState === 1;
  }
}
