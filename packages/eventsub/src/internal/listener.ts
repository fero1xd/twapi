import {
  Condition,
  EventDataMap,
  RevocationReason,
  ValidSubscription,
} from "./types";
import { v4 } from "uuid";
import { CreateSubscriptionRequestFailed } from "../errors";

export class Listener<
  TSub extends ValidSubscription = any,
  TCond extends Condition<TSub> = any
> {
  private subscriptionName: TSub;

  // Unique listener id
  private id?: string;

  // Called when a notification comes that matches this subscription
  private handlerFunction?: (data: EventDataMap[TSub]) => void;

  // Called when unsuccessful in registering this event
  private errorHandler?: (error: CreateSubscriptionRequestFailed<TSub>) => void;

  // Called when this subscription is revoked
  private revocationHandler?: (reason: RevocationReason) => void;

  private condition: TCond;

  /**
   * ------- CONSTRUCTOR ------
   * This class calls the registered function whenever a subscription triggers
   * @param sub A valid subscription name
   * @param id Subscription id
   */
  constructor(sub: TSub, condition: TCond, id?: string) {
    this.subscriptionName = sub;
    this.id = id;
    this.condition = condition;
  }

  public setId(id: string) {
    this.id = id;
  }

  public getCondition() {
    return this.condition;
  }

  /**
   * Triggers the handler related to this subscription
   * @param data Event data related to the subscription
   */
  public triggerHandler(data: EventDataMap[TSub]) {
    this.handlerFunction?.(data);
  }

  /**
   * Triggers the error handler fn
   * @param error Custom generic error class
   */
  public triggerError(error: CreateSubscriptionRequestFailed<TSub>) {
    this.errorHandler?.(error);
  }

  /**
   * Triggers the revocation handler
   * @param reason Possible reason for this revocation
   */
  public triggerRevocationHandler(reason: RevocationReason) {
    this.revocationHandler?.(reason);
  }

  /**
   * Registers a handler function
   * @param handler A callback function for this event
   */
  public handle(handler: (data: EventDataMap[TSub]) => void) {
    this.handlerFunction = handler;
  }

  /**
   * Registers error handler
   * @param handler A callback function for handling error
   */
  public handleError(
    handler: (error: CreateSubscriptionRequestFailed<TSub>) => void
  ) {
    this.errorHandler = handler;
  }

  /**
   * Registers revocation handler
   * @param handler A callback function for handling revocation
   */
  public handleRevocation(handler: (reason: RevocationReason) => void) {
    this.revocationHandler = handler;
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
