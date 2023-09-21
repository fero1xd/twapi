import { AuthProvider } from '@twapi/auth';
import { WebSocket, MessageEvent, CLOSING } from 'isomorphic-ws';
import { type LoggerType, createLogger } from '@twapi/logger';
import { MessageCodes, splitIrcMessage } from './internal/utils';
import { parseMessage } from './internal/parser';
import { OnConnectedCallback, OnGlobalUserState } from './internal/types';
import { ParsedMessage, UserState } from './internal/interfaces';

export class ChatClient {
  // Websocket connection
  private _connection?: WebSocket;

  // Authentication provider
  private _authProvider: AuthProvider;

  // Twitch capabilities for extra information in messages
  private _capabilites: string[];

  // Logger
  private _log: LoggerType;

  private _onConnected?: OnConnectedCallback;
  private _called: boolean = false;

  private _onGlobalUserState?: OnGlobalUserState;

  private _ircListeners: { handler: (message: ParsedMessage) => void }[] = [];

  /**
   * --------CONSTRUCTOR--------
   *
   * @param authProvider Autnentication provider for the chat client
   */
  constructor(authProvider: AuthProvider) {
    this._authProvider = authProvider;
    this._capabilites = [
      'twitch.tv/membership',
      'twitch.tv/tags',
      'twitch.tv/commands',
    ];
    this._log = createLogger('twapi:chat');
  }

  public connect(cb?: OnConnectedCallback) {
    if (this._connection && this._connection.readyState !== 3) {
      this._log.error('One connection is already open');
      return;
    }

    this._connection = new WebSocket('ws://irc-ws.chat.twitch.tv:80');

    this._connection.onopen = this._onOpen.bind(this);
    this._connection.onmessage = this._onMessage.bind(this);
    this._onConnected = cb;
  }

  /**
   * Joins a room
   * @param room Name of the broadcaster
   */
  public join(room: string, cb?: () => void) {
    this._send(`JOIN #${room}`);

    if (!cb) return;

    const unsub = this._listenForIrcMessage(async (message) => {
      if (
        message.command?.command === MessageCodes.JOIN &&
        message.source?.nick === (await this._authProvider.getUserName())
      ) {
        cb();
        unsub();
      }
    });
  }

  public leave(room: string) {
    this._send(`PART #${room}`);
  }

  public onGlobalUserState(cb: OnGlobalUserState) {
    this._onGlobalUserState = cb;
  }

  private _onMessage(e: MessageEvent) {
    const messages = splitIrcMessage(e.data.toString());

    for (const message of messages) {
      const parsedMessage = parseMessage(message);
      if (parsedMessage) {
        console.log(parsedMessage);
        this._handleIrcMessage(parsedMessage);
      }
    }
  }

  private _handleIrcMessage(message: ParsedMessage) {
    if (!message.command) return;

    this._ircListeners.forEach((l) => l.handler(message));
    switch (message.command.command) {
      case MessageCodes.LOGIN_SUCCESSFUL:
        console.log('Logged in successfuly');
        if (!this._called) {
          this._onConnected?.();
          this._called = true;
        }
        break;
      case MessageCodes.GLOBALUSERSTATE:
        this._onGlobalUserState?.(message.tags as UserState);
        break;
    }
  }

  private _listenForIrcMessage(cb: (message: ParsedMessage) => void) {
    const handler = { handler: cb };
    this._ircListeners.push(handler);

    return () => {
      this._ircListeners.splice(this._ircListeners.indexOf(handler), 1);
    };
  }

  private async _onOpen() {
    this._log.info("Connection opened to twitch's server");

    const userAccessToken = await this._authProvider.getUserAccessToken();
    const nick = await this._authProvider.getUserName();

    const payload = [
      `CAP REQ :${this._capabilites.join(' ')}`,
      `PASS oauth:${userAccessToken}`,
      `NICK ${nick}`,
    ];
    this._send(payload);
  }

  private _send(payload: string | string[]) {
    if (!this.isConnected()) {
      this._log.warn('Cannot send message as connection is closed.');
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
