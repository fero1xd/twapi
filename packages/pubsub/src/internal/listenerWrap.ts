import { PubSub } from "../pubsub";
import { Listener } from "./listener";
import {
  ErrorHandlerFn,
  Fn,
  ListenerWrapType,
  Topics,
  TriggerHandler,
} from "./types";

export class ListenerWrap<T extends Topics> implements ListenerWrapType<T> {
  private _listener: Listener;
  private _pubsub: PubSub;

  constructor(listener: Listener, pubsub: PubSub) {
    this._listener = listener;
    this._pubsub = pubsub;
  }
  onTrigger(handler: TriggerHandler<T>) {
    this._listener.setTriggerHandler(handler);
  }

  onError(handler: ErrorHandlerFn) {
    this._listener.setErrorHandler(handler);
  }

  onRevocation(handler: Fn) {
    this._listener.setRevocationHandler(handler);
  }

  onTimeout(handler: Fn) {
    this._listener.setTimeoutHandler(handler);
  }

  onRegistered(handler: Fn) {
    this._listener.setRegisteredHandler(handler);
  }

  unsubscribe(): Promise<boolean> {
    return this._pubsub.removeListener(this);
  }

  getParsedTopic() {
    return this._listener.getParsedTopic();
  }

  getNonce() {
    return this._listener.getNonce();
  }
}
