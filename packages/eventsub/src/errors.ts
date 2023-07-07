import { BadResponse, ValidSubscription } from "./internal/types";

export class ConnectionClosed extends Error {
  /**
   * Threw when you are using the connection when it is not initialized
   */
  constructor(message?: string) {
    super(message ?? "This connection is not ready to be used yet");
  }
}

export class CreateSubscriptionRequestFailed<
  T extends ValidSubscription
> extends Error {
  private subName: T;
  private body?: BadResponse;

  constructor(subscriptionName: T, body?: BadResponse) {
    super(`Creating subscription ${subscriptionName} failed!`);
    this.subName = subscriptionName;
    this.body = body;
  }

  public getMessage() {
    if (this.body) {
      return this.body.message;
    }

    return this.message;
  }

  public getResponse() {
    return this.body;
  }

  public getSubscriptionName() {
    return this.subName;
  }
}
