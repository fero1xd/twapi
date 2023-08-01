import { ApiClient } from "../../client";
import { HelixResponse, RequestConfig } from "../../internal/interfaces";
import { SubscriptionPaginatedResponse } from "./SubscriptionPaginatedResponse";
import { createGetSubscriptionsQuery } from "./subscriptions";
import {
  HelixPaginatedSubscriptionResponse,
  Subscriber,
  UserSubscription,
} from "./subscriptions.data";

export interface SubscriptionsApiEndpoints {
  /**
   * Gets a list of users that subscribe to the specified broadcaster.
   *
   * @param broadcasterId The broadcaster’s ID. This ID must match the user ID in the access token.
   * @param userId Filters the list to include only the specified subscribers.
   *
   * @returns A paginated list of users that subscribe to the broadcaster.
   */
  getBroadcasterSubscriptions(
    broadcasterId: string,
    userId?: string
  ): Promise<SubscriptionPaginatedResponse<Subscriber>>;

  /**
   * Checks whether the user subscribes to the broadcaster’s channel.
   *
   * @param broadcasterId The ID of a partner or affiliate broadcaster.
   * @param userId The ID of the user that you’re checking to see whether they subscribe to the broadcaster in broadcaster_id. This ID must match the user ID in the access Token.
   *
   * @returns An object with information about the user’s subscription.
   */
  checkSubscription(
    broadcasterId: string,
    userId: string
  ): Promise<UserSubscription>;
}

export class SubscriptionsApi implements SubscriptionsApiEndpoints {
  constructor(private _client: ApiClient) {}

  async getBroadcasterSubscriptions(broadcasterId: string, userId?: string) {
    const config: RequestConfig = {
      url: "subscriptions",
      method: "GET",
      oauth: true,
      query: createGetSubscriptionsQuery(broadcasterId, userId),
    };

    const res = await this._client.enqueueCall<
      HelixPaginatedSubscriptionResponse<Subscriber>
    >(config);
    return new SubscriptionPaginatedResponse(res, this._client, config);
  }

  async checkSubscription(broadcasterId: string, userId: string) {
    const res = await this._client.enqueueCall<HelixResponse<UserSubscription>>(
      {
        url: "subscriptions/user",
        method: "GET",
        oauth: true,
        query: createGetSubscriptionsQuery(broadcasterId, userId),
      }
    );

    return res.data[0];
  }
}
