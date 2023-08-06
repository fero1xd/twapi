import { ApiClient } from "../../client";
import {
  HelixPaginatedResponse,
  HelixResponse,
  RequestConfig,
} from "../../internal/interfaces";
import { HelixPaginatedResponseIterator } from "../HelixPaginatedResponse";
import { createBroadcasterQuery } from "../common.data";
import {
  createDeleteUpdateRewardQuery,
  createGetRewardQuery,
} from "./channelPoints";
import {
  CreateRewardBody,
  GetCustomRewardRedemptionQuery,
  RewardRedemptionResponse,
  RewardResponse,
  UpdateRedemptionStatusQuery,
  UpdateRewardBody,
} from "./channelPoints.data";

export interface ChannelPointsApiEndpoints {
  /**
   * Gets a list of custom rewards that the specified broadcaster created.
   *
   * @param broadcasterId The ID of the broadcaster to add the custom reward to. This ID must match the user ID found in the OAuth token.
   * @param body Data related to the reward
   *
   * @returns The created reward
   */
  createCustomReward(
    broadcasterId: string,
    body: CreateRewardBody
  ): Promise<RewardResponse>;

  /**
   * Deletes a custom reward that the broadcaster created.
   *
   * @param broadcasterId The ID of the broadcaster that created the custom reward. This ID must match the user ID found in the OAuth token.
   * @param rewardId The ID of the custom reward to delete.
   */
  deleteCustomReward(broadcasterId: string, rewardId: string): Promise<void>;

  /**
   * Gets a list of custom rewards that the specified broadcaster created.
   *
   * @param broadcasterId The ID of the broadcaster whose custom rewards you want to get. This ID must match the user ID found in the OAuth token.
   * @param ids ID to filter the rewards by. To specify more than one ID, include this parameter for each reward you want to get. For example, id=1234&id=5678. You may specify a maximum of 50 IDs.
   * @param onlyManageableRewards A Boolean value that determines whether the response contains only the custom rewards that the app may manage (the app is identified by the ID in the Client-Id header). Set to true to get only the custom rewards that the app may manage. The default is false.
   * @returns A list of custom rewards. The list is in ascending order by id. If the broadcaster hasn’t created custom rewards, the list is empty.
   */
  getCustomReward(
    broadcasterId: string,
    ids?: string | string[],
    onlyManageableRewards?: boolean
  ): Promise<RewardResponse[]>;

  /**
   * Gets a list of redemptions for the specified custom reward. The app used to create the reward is the only app that may get the redemptions.
   *
   * @param query Query data related to the custom reward
   * @returns The list of redemptions for the specified reward. The list is empty if there are no redemptions that match the redemption criteria.
   */
  getCustomRewardRedemption(
    query: GetCustomRewardRedemptionQuery
  ): Promise<HelixPaginatedResponseIterator<RewardRedemptionResponse>>;

  /**
   * Updates a custom reward. The app used to create the reward is the only app that may update the reward.
   *
   * @param broadcasterId The ID of the broadcaster that’s updating the reward. This ID must match the user ID found in the OAuth token.
   * @param rewardId The ID of the reward to update.
   * @param body Fields that you want to update
   *
   * @returns The single reward that you updated
   */
  updateCustomReward(
    broadcasterId: string,
    rewardId: string,
    body: UpdateRewardBody
  ): Promise<RewardResponse>;

  /**
   * Updates a redemption’s status. You may update a redemption only if its status is UNFULFILLED. The app used to create the reward is the only app that may update the redemption.
   *
   * @param query The Query object
   * @param status The status to set the redemption to.
   *
   * @returns The single redemption that you updated.
   */
  updateRedemptionStatus(
    query: UpdateRedemptionStatusQuery,
    status: "CANCELED" | "FULFILLED"
  ): Promise<RewardRedemptionResponse>;
}

export class ChannelPointsApi implements ChannelPointsApiEndpoints {
  constructor(private _client: ApiClient) {}

  async createCustomReward(broadcasterId: string, body: CreateRewardBody) {
    const res = await this._client.enqueueCall<HelixResponse<RewardResponse>>({
      url: "channel_points/custom_rewards",
      method: "POST",
      query: createBroadcasterQuery(broadcasterId),
      body,
      oauth: true,
    });

    return res.data[0];
  }

  async deleteCustomReward(broadcasterId: string, rewardId: string) {
    await this._client.enqueueCall({
      url: "channel_points/custom_rewards",
      method: "DELETE",
      oauth: true,
      query: createDeleteUpdateRewardQuery(broadcasterId, rewardId),
    });
  }

  async getCustomReward(
    broadcasterId: string,
    ids?: string | string[],
    onlyManageableRewards?: boolean
  ) {
    const res = await this._client.enqueueCall<HelixResponse<RewardResponse>>({
      url: "channel_points/custom_rewards",
      method: "GET",
      oauth: true,
      query: createGetRewardQuery(broadcasterId, ids, onlyManageableRewards),
    });

    return res.data;
  }

  async getCustomRewardRedemption(query: GetCustomRewardRedemptionQuery) {
    const config: RequestConfig = {
      url: "channel_points/custom_rewards/redemptions",
      method: "GET",
      oauth: true,
      query,
    };
    const res = await this._client.enqueueCall<
      HelixPaginatedResponse<RewardRedemptionResponse>
    >(config);

    return new HelixPaginatedResponseIterator(res, this._client, config);
  }

  async updateCustomReward(
    broadcasterId: string,
    rewardId: string,
    body: UpdateRewardBody
  ) {
    const res = await this._client.enqueueCall<HelixResponse<RewardResponse>>({
      url: "channel_points/custom_rewards",
      method: "PATCH",
      query: createDeleteUpdateRewardQuery(broadcasterId, rewardId),
      body,
      oauth: true,
    });

    return res.data[0];
  }

  async updateRedemptionStatus(
    query: UpdateRedemptionStatusQuery,
    status: "CANCELED" | "FULFILLED"
  ) {
    const res = await this._client.enqueueCall<
      HelixResponse<RewardRedemptionResponse>
    >({
      url: "channel_points/custom_rewards/redemptions",
      oauth: true,
      method: "PATCH",
      query,
      body: { status },
    });

    return res.data[0];
  }
}
