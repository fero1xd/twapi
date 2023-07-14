import {
  ErrorHandlerFn,
  ErrorMessage,
  TopicDataMap,
  Topics,
  TriggerHandler,
} from "./types";

export class Listener<TTopic extends Topics = any> {
  // Topic name
  private topic: TTopic;

  private parsedTopic: string;

  private handlerFunction?: TriggerHandler<TTopic>;

  private errorHandlerFunc?: ErrorHandlerFn;

  private revocationHandler?: () => void;

  constructor(topic: TTopic, parsedTopic: string) {
    this.topic = topic;
    this.parsedTopic = parsedTopic;
  }

  public setTriggerHandler(handler: TriggerHandler<TTopic>) {
    this.handlerFunction = handler;
  }

  public setErrorHandler(handler: ErrorHandlerFn) {
    this.errorHandlerFunc = handler;
  }

  public setRevocationHandler(handler: () => void) {
    this.revocationHandler = handler;
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

  public getTopic() {
    return this.topic;
  }

  public getParsedTopic() {
    return this.parsedTopic;
  }
}
