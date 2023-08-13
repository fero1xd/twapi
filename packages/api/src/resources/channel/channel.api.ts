import { ApiClient } from "../../client";
import { HelixResponse, RequestConfig } from "../../internal/interfaces";
import { HelixPaginatedResponseIterator } from "../HelixPaginatedResponse";
import {
  HelixPaginatedResponseWithTotal,
  createBroadcasterQuery,
} from "../common.data";
import {
  createCommercialQuery,
  createFollowedQuery,
  createFollowersQuery,
} from "./channel";
import {
  ChannelEditor,
  ChannelFollower,
  ChannelInformation,
  ChannelUpdateData,
  CommericalStatus,
  FollowedChannel,
} from "./channel.data";

export interface ChannelApiEndPoints {
  /**
   * Gets information about one or more channels.
   *
   * @param broadcasterId The ID of the broadcaster whose channel you want to get
   */
  getChannelInformation(broadcasterId: string): Promise<ChannelInformation>;

  /**
   * Gets information about one or more channels.
   *
   * @param broadcasterIds The list ID of the broadcaster whose channel you want to get
   */
  getChannelsInformation(
    broadcasterIds: string[]
  ): Promise<ChannelInformation[]>;

  /**
   * Updates a channel’s properties.
   *
   * @param data Fields that you want to update
   */
  updateChannelInformation(data: ChannelUpdateData): Promise<void>;

  /**
   * Gets the broadcaster’s list editors.
   *
   * @returns A list of users that are editors for the specified broadcaster. The list is empty if the broadcaster doesn’t have editors.
   */
  getChannelEditors(): Promise<ChannelEditor[]>;

  /**
   * Gets a list of broadcasters that the specified user follows. You can also use this endpoint to see whether a user follows a specific broadcaster.
   *
   * @param broadcasterId A broadcaster’s ID. Use this parameter to see whether the user follows this broadcaster. If specified, the response contains this broadcaster if the user follows them. If not specified, the response contains all broadcasters that the user follows.
   * @returns A paginated iterator of followed channels
   */
  getFollowedChannels(
    broadcasterId?: string
  ): Promise<HelixPaginatedResponseIterator<FollowedChannel>>;

  /**
   * Gets a list of users that follow the specified broadcaster. You can also use this endpoint to see whether a specific user follows the broadcaster.
   *
   * @param broadcasterId The broadcaster’s ID. Returns the list of users that follow this broadcaster.
   * @param userId A user’s ID. Use this parameter to see whether the user follows this broadcaster. If specified, the response contains this user if they follow the broadcaster. If not specified, the response contains all users that follow the broadcaster.
   * @returns A paginated iterator of channel followers
   */
  getChannelFollowers(
    broadcasterId: string,
    userId?: string
  ): Promise<HelixPaginatedResponseIterator<ChannelFollower>>;

  /**
   * Starts a commercial on the specified channel.
   * 
   * @param length The length of the commercial to run, in seconds. Twitch tries to serve a commercial that’s the requested length, but it may be shorter or longer. The maximum length you should request is 180 seconds.

   * @returns The status of your start commercial request
   */
  startCommerical(length: number): Promise<CommericalStatus>;
}

export class ChannelApi implements ChannelApiEndPoints {
  private readonly _client: ApiClient;

  constructor(client: ApiClient) {
    this._client = client;
  }

  async getChannelInformation(broadcasterId: string) {
    const res = await this._client.enqueueCall<
      HelixResponse<ChannelInformation>
    >({
      url: "channels",
      query: createBroadcasterQuery(broadcasterId),
      method: "GET",
      oauth: true,
    });

    return res.data[0];
  }

  async getChannelsInformation(broadcasterIds: string[]) {
    const res = await this._client.enqueueCall<
      HelixResponse<ChannelInformation>
    >({
      url: "channels",
      query: createBroadcasterQuery(broadcasterIds),
      method: "GET",
      oauth: true,
    });

    return res.data;
  }

  async updateChannelInformation(data: ChannelUpdateData) {
    const userId = await this._client.getUserId();

    await this._client.enqueueCall({
      url: "channels",
      query: createBroadcasterQuery(userId),
      method: "PATCH",
      body: data,
      oauth: true,
    });
  }

  async getChannelEditors() {
    const userId = await this._client.getUserId();
    const res = await this._client.enqueueCall<HelixResponse<ChannelEditor>>({
      url: "channels/editors",
      query: createBroadcasterQuery(userId),
      method: "GET",
      oauth: true,
    });

    return res.data;
  }

  async getFollowedChannels(broadcasterId?: string) {
    const userId = await this._client.getUserId();

    const config: RequestConfig = {
      url: "channels/followed",
      query: createFollowedQuery(userId, broadcasterId),
      method: "GET",
      oauth: true,
    };

    const res = await this._client.enqueueCall<
      HelixPaginatedResponseWithTotal<FollowedChannel>
    >(config);

    return new HelixPaginatedResponseIterator(res, this._client, config);
  }

  async getChannelFollowers(broadcasterId: string, userId?: string) {
    const config: RequestConfig = {
      url: "channels/followers",
      query: createFollowersQuery(broadcasterId, userId),
      method: "GET",
      oauth: true,
    };

    const res = await this._client.enqueueCall<
      HelixPaginatedResponseWithTotal<ChannelFollower>
    >(config);

    return new HelixPaginatedResponseIterator(res, this._client, config);
  }

  async startCommerical(length: number) {
    const userId = await this._client.getUserId();

    const res = await this._client.enqueueCall<HelixResponse<CommericalStatus>>(
      {
        url: "channels/commercial",
        method: "POST",

        query: createCommercialQuery(userId, length),
        oauth: true,
      }
    );

    return res.data[0];
  }
}
