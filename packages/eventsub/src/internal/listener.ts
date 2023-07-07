import { EventDataMap, ValidSubscription } from "./types";
import { v4 } from "uuid";
import { CreateSubscriptionRequestFailed } from "../errors";

export class Listener<TSub extends ValidSubscription> {
  private subscriptionName: TSub;

  // Unique listener id
  private id: string;

  // Called when a notification comes that matches this subscription
  private handlerFunction?: (data: EventDataMap[TSub]) => void;

  // Called when unsuccessful in registering this event
  private errorHandler?: (error: CreateSubscriptionRequestFailed<TSub>) => void;

  /**
   * ------- CONSTRUCTOR ------
   * This class calls the registered function whenever a subscription triggers
   * @param sub A valid subscription name
   */
  constructor(sub: TSub) {
    this.subscriptionName = sub;
    this.id = v4();
  }

  /**
   * Triggers the handler related to this subscription
   * @param data Event data related to the subscription
   */
  public triggerHandler(data: EventDataMap[TSub]) {
    this.handlerFunction?.(data);
  }

  public triggerError(error: CreateSubscriptionRequestFailed<TSub>) {
    this.errorHandler?.(error);
  }

  /**
   * Registers a handler function
   * @param handler A callback function for this event
   */
  public handle(handler: (data: EventDataMap[TSub]) => void) {
    this.handlerFunction = handler;
  }

  public handleError(
    handler: (error: CreateSubscriptionRequestFailed<TSub>) => void
  ) {
    this.errorHandler = handler;
  }

  /**
   * @returns The subscription name
   */
  public getSubscriptionName() {
    return this.subscriptionName;
  }

  /**
   * @returns This listener's id
   */
  public getId() {
    return this.id;
  }
}
