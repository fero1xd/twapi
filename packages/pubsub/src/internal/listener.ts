import {
  ErrorHandlerFn,
  ErrorMessage,
  Fn,
  TopicDataMap,
  Topics,
  TriggerHandler,
} from "./types";

export class Listener<TTopic extends Topics = any> {
  // Topic name
  private topic: TTopic;

  private parsedTopic: string;

  private nonce: string;

  private handlerFunction?: TriggerHandler<TTopic>;

  private errorHandlerFunc?: ErrorHandlerFn;

  private revocationHandler?: Fn;

  private timeoutHandler?: Fn;

  private registeredHandler?: Fn;

  constructor(topic: TTopic, parsedTopic: string, nonce: string) {
    this.topic = topic;
    this.parsedTopic = parsedTopic;
    this.nonce = nonce;
  }

  public setTriggerHandler(handler: TriggerHandler<TTopic>) {
    this.handlerFunction = handler;
  }

  public setErrorHandler(handler: ErrorHandlerFn) {
    this.errorHandlerFunc = handler;
  }

  public setRevocationHandler(handler: Fn) {
    this.revocationHandler = handler;
  }

  public setTimeoutHandler(handler: Fn) {
    this.timeoutHandler = handler;
  }

  public setRegisteredHandler(handler: Fn) {
    this.registeredHandler = handler;
  }

  public triggerHandler(data: TopicDataMap[TTopic]) {
    this.handlerFunction?.(data);
  }

  public triggerErrorHandler(message: ErrorMessage) {
    this.errorHandlerFunc?.(message);
  }

  public triggerRevocationHandler() {
    this.revocationHandler?.();
  }

  public triggerTimeoutHandler() {
    this.timeoutHandler?.();
  }

  public triggerRegisteredHandler() {
    this.registeredHandler?.();
  }

  public getTopic() {
    return this.topic;
  }

  public getNonce() {
    return this.nonce;
  }

  public getParsedTopic() {
    return this.parsedTopic;
  }
}
