import { ApiClient } from "../../client";
import { HelixResponse, RequestConfig } from "../../internal/interfaces";
import { SubscriptionPaginatedResponse } from "./SubscriptionPaginatedResponse";
import {
  CreateEventSubSubscriptionBody,
  EventSubTransportOption,
  HelixPaginatedSubscriptionResponse,
  Subscription,
  SubscriptionStatus,
  Subscriptions,
} from "./eventsub.data";

export interface EventSubApiEndpoints {
  /**
   * Creates an EventSub subscription.
   *
   * @param body Data related to create a subscription
   *
   * @returns The single subscription that you created.
   */
  createSubscription<T extends Subscriptions>(
    body: CreateEventSubSubscriptionBody<T>
  ): Promise<Subscription<T>>;

  /**
   * Deletes an EventSub subscription.
   *
   * @param id The ID of the subscription to delete.
   * @param transport Wether you used websocket or webhook to receive events
   */
  deleteSubscription(
    id: string,
    transport: EventSubTransportOption
  ): Promise<void>;

  /**
   * Gets a list of EventSub subscriptions that the client in the access token created.
   *
   * @param status Filter subscriptions by its status.
   * @param transport Wether you used websocket or webhook to receive events
   *
   * @returns Paginated response of subscriptions
   */
  getSubscriptionsByStatus(
    status: SubscriptionStatus,
    transport: EventSubTransportOption
  ): Promise<SubscriptionPaginatedResponse<Subscription>>;

  /**
   * Gets a list of EventSub subscriptions that the client in the access token created.
   *
   * @param type Filter subscriptions by subscription type
   * @param transport Wether you used websocket or webhook to receive events
   *
   * @returns Paginated response of subscriptions
   */
  getSubscriptionsByType<T extends Subscriptions>(
    type: T,
    transport: EventSubTransportOption
  ): Promise<SubscriptionPaginatedResponse<Subscription<T>>>;

  /**
   * Gets a list of EventSub subscriptions that the client in the access token created.
   *
   * @param userId Filter subscriptions by user ID. The response contains subscriptions where this ID matches a user ID that you specified in the Condition object when you created the subscription.
   * @param transport Wether you used websocket or webhook to receive events
   *
   * @returns Paginated response of subscriptions
   */
  getSubscriptionsByUserId(
    userId: string,
    transport: EventSubTransportOption
  ): Promise<SubscriptionPaginatedResponse<Subscription>>;
}

export class EventSubApi implements EventSubApiEndpoints {
  constructor(private _client: ApiClient) {}

  async createSubscription<T extends Subscriptions>(
    body: CreateEventSubSubscriptionBody<T>
  ) {
    const res = await this._client.enqueueCall<HelixResponse<Subscription<T>>>({
      url: "eventsub/subscriptions",
      method: "POST",
      oauth: body.transport.method === "websocket",
      body,
    });

    return res.data[0];
  }

  async deleteSubscription(id: string, transport: EventSubTransportOption) {
    await this._client.enqueueCall({
      url: "eventsub/subscriptions",
      method: "DELETE",
      oauth: transport === "websocket",
      query: { id },
    });
  }

  async getSubscriptionsByStatus(
    status: SubscriptionStatus,
    transport: EventSubTransportOption
  ) {
    const config: RequestConfig = {
      url: "eventsub/subscriptions",
      method: "GET",
      query: { status },
      oauth: transport === "websocket",
    };

    const res = await this._client.enqueueCall<
      HelixPaginatedSubscriptionResponse<Subscription>
    >(config);

    return new SubscriptionPaginatedResponse(res, this._client, config);
  }

  async getSubscriptionsByType<T extends Subscriptions>(
    type: T,
    transport: EventSubTransportOption
  ) {
    const config: RequestConfig = {
      url: "eventsub/subscriptions",
      method: "GET",
      query: { type },
      oauth: transport === "websocket",
    };

    const res = await this._client.enqueueCall<
      HelixPaginatedSubscriptionResponse<Subscription<T>>
    >(config);

    return new SubscriptionPaginatedResponse(res, this._client, config);
  }

  async getSubscriptionsByUserId(
    userId: string,
    transport: EventSubTransportOption
  ) {
    const config: RequestConfig = {
      url: "eventsub/subscriptions",
      method: "GET",
      query: { user_id: userId },
      oauth: transport === "websocket",
    };

    const res = await this._client.enqueueCall<
      HelixPaginatedSubscriptionResponse<Subscription>
    >(config);

    return new SubscriptionPaginatedResponse(res, this._client, config);
  }
}
