import { ApiClient } from "../../client";
import {
  HelixPaginatedResponse,
  HelixResponse,
  RequestConfig,
} from "../../internal/interfaces";
import { HelixPaginatedResponseIterator } from "../HelixPaginatedResponse";
import { createBroadModQuery } from "../chat/chat";
import { createBroadcasterQuery, createModeratorQuery } from "../common.data";
import {
  createAddModeratorQuery,
  createAddVipQuery,
  createGetBannedUsersQuery,
  createGetModeratorsQuery,
  createGetVipsQuery,
  createRemoveModeratorQuery,
  createRemoveVipQuery,
  createUnbanQuery,
} from "./moderation";
import {
  AutomodSettings,
  BanUserBody,
  BanUserResponse,
  BannedUser,
  BlockedTerm,
  BroadcasterModeratorQuery,
  CheckAutoModStatusBody,
  DeleteChatMessageQuery,
  ManageAutomodMessageBody,
  MessageApproval,
  ModerationSettings,
  Moderator,
  RemoveBlockedTermQuery,
  ShieldModeStatus,
  UnbanUserQuery,
  Vip,
} from "./moderation.data";

export interface ModerationApiEndpoints {
  /**
   * Checks whether AutoMod would flag the specified message for review.
   *
   * @param body The list of messages to check. The list must contain at least one message and may contain up to a maximum of 100 messages.
   *
   * @returns The list of messages and whether Twitch would approve them for chat.
   */
  checkAutomodStatus(
    body: CheckAutoModStatusBody | CheckAutoModStatusBody[]
  ): Promise<MessageApproval[]>;

  /**
   * Allow or deny the message that AutoMod flagged for review.
   *
   * @param body The message id and action to apply
   */
  manageHeldAutomodMessage(body: ManageAutomodMessageBody): Promise<void>;

  /**
   * Gets the broadcaster’s AutoMod settings. The settings are used to automatically block inappropriate or harassing messages from appearing in the broadcaster’s chat room.
   *
   * @param broadcasterId The ID of the broadcaster whose AutoMod settings you want to get.
   *
   * @returns Object that contains all the AutoMod settings.
   */
  getAutomodSettings(broadcasterId: string): Promise<AutomodSettings>;

  /**
   * Updates the broadcaster’s AutoMod settings. The settings are used to automatically block inappropriate or harassing messages from appearing in the broadcaster’s chat room.
   *
   * @param broadcasterId The ID of the broadcaster whose AutoMod settings you want to update.
   * @param body Settings Diff
   *
   * @returns Object that contains all the AutoMod settings.
   */
  updateAutomodSettings(
    broadcasterId: string,
    body: Partial<ModerationSettings>
  ): Promise<AutomodSettings>;

  /**
   * Gets all users that the broadcaster banned or put in a timeout.
   *
   * @param userIds Filter users with this filter
   *
   * @returns A paginated list of banned users
   */
  getBannedUsers(
    userIds?: string[]
  ): Promise<HelixPaginatedResponseIterator<BannedUser>>;

  /**
   * Bans a user from participating in the specified broadcaster’s chat room or puts them in a timeout.
   * If the user is currently in a timeout, you can call this endpoint to change the duration of the timeout or ban them altogether. If the user is currently banned, you cannot call this method to put them in a timeout instead.
   *
   * @param broadcasterId The ID of the broadcaster whose chat room the user is being banned from.
   * @param body Identifies the user and type of ban
   *
   * @returns Contains the user you successfully banned or put in a timeout.
   */
  banUser(broadcasterId: string, body: BanUserBody): Promise<BanUserResponse>;

  /**
   * Removes the ban or timeout that was placed on the specified user.
   *
   * @param broadcasterId The ID of the broadcaster whose chat room the user is banned from chatting in.
   * @param userId The ID of the user to remove the ban or timeout from.
   */
  unbanUser(broadcasterId: string, userId: string): Promise<void>;

  /**
   * Gets the broadcaster’s list of non-private, blocked words or phrases. These are the terms that the broadcaster or moderator added manually or that were denied by AutoMod.
   *
   * @param broadcasterId The ID of the broadcaster whose blocked terms you’re getting.
   *
   * @returns A paginated list of blocked terms
   */
  getBlockedTerms(
    broadcasterId: string
  ): Promise<HelixPaginatedResponseIterator<BlockedTerm>>;

  /**
   * Adds a word or phrase to the broadcaster’s list of blocked terms. These are the terms that the broadcaster doesn’t want used in their chat room.
   * 
   * @param broadcasterId The ID of the broadcaster that owns the list of blocked terms.
   * @param text The word or phrase to block from being used in the broadcaster’s chat room. The term must contain a minimum of 2 characters and may contain up to a maximum of 500 characters.
        Terms may include a wildcard character (*). The wildcard character must appear at the beginning or end of a word or set of characters. For example, *foo or foo*.
        If the blocked term already exists, the response contains the existing blocked term.

    @returns Blocked term that the broadcaster added.
   */
  addBlockedTerm(broadcasterId: string, text: string): Promise<BlockedTerm>;

  /**
   * Removes the word or phrase from the broadcaster’s list of blocked terms.
   *
   * @param query The id of the blocked term
   */
  removeBlockedTerm(query: RemoveBlockedTermQuery): Promise<void>;

  /**
   * Removes a single chat message or all chat messages from the broadcaster’s chat room.
   *
   * @param query The id of the message to delete
   */
  deleteChatMessage(query: DeleteChatMessageQuery): Promise<void>;

  /**
   * Gets all users allowed to moderate the broadcaster’s chat room.
   *
   * @param userIds Filter users with this filter
   *
   * @returns A paginated list of channel moderators
   */
  getModerators(
    userIds?: string[]
  ): Promise<HelixPaginatedResponseIterator<Moderator>>;

  /**
   * Adds a moderator to the broadcaster’s chat room.
     Rate Limits: The broadcaster may add a maximum of 10 moderators within a 10-second window.

   * @param userId The ID of the user to add as a moderator in the broadcaster’s chat room.
   */
  addModerator(userId: string): Promise<void>;

  /**
   * Removes a moderator from the broadcaster’s chat room.
     Rate Limits: The broadcaster may remove a maximum of 10 moderators within a 10-second window.

   * @param userId The ID of the user to remove as a moderator from the broadcaster’s chat room.
   */
  removeChannelModerator(userId: string): Promise<void>;

  /**
   * Gets a list of the broadcaster’s VIPs.
   *
   * @param userIds Filters the list for specific VIPs
   *
   * @returns A paginated list of channel vips
   */
  getVips(userIds?: string[]): Promise<HelixPaginatedResponseIterator<Vip>>;

  /**
   * Adds the specified user as a VIP in the broadcaster’s channel.
     Rate Limits: The broadcaster may add a maximum of 10 VIPs within a 10-second window.

   * @param userId The ID of the user to give VIP status to.
   */
  addChannelVip(userId: string): Promise<void>;

  /**
   * Removes the specified user as a VIP in the broadcaster’s channel.
     If the broadcaster is removing the user’s VIP status, the ID in the broadcaster_id query parameter must match the user ID in the access token; otherwise, if the user is removing their VIP status themselves, the ID in the user_id query parameter must match the user ID in the access token.

   * @param userId The ID of the user to remove VIP status from.
   */
  removeChannelVip(userId: string): Promise<void>;

  /**
   * Activates or deactivates the broadcaster’s Shield Mode.
     Twitch’s Shield Mode feature is like a panic button that broadcasters can push to protect themselves from chat abuse coming from one or more accounts.
     When activated, Shield Mode applies the overrides that the broadcaster configured in the Twitch UX. If the broadcaster hasn’t configured Shield Mode, it applies default overrides.

   * @param broadcasterId The ID of the broadcaster whose Shield Mode you want to activate or deactivate.
   * @param isActive A Boolean value that determines whether to activate Shield Mode. Set to true to activate Shield Mode; otherwise, false to deactivate Shield Mode.
   * 
   * @returns Channel's updated shield mode status
   */
  updateShieldModeStatus(
    broadcasterId: string,
    isActive: boolean
  ): Promise<ShieldModeStatus>;

  /**
   * Gets the broadcaster’s Shield Mode activation status.
   *
   * @param broadcasterId The ID of the broadcaster whose Shield Mode activation status you want to get.
   *
   * @returns The broadcaster’s Shield Mode status.
   */
  getShieldModeStatus(broadcasterId: string): Promise<ShieldModeStatus>;
}

export class ModerationApi implements ModerationApiEndpoints {
  constructor(private _client: ApiClient) {}

  async checkAutomodStatus(
    body: CheckAutoModStatusBody | CheckAutoModStatusBody[]
  ) {
    const broadcasterId = await this._client.getUserId();

    const res = await this._client.enqueueCall<HelixResponse<MessageApproval>>({
      url: "moderation/enforcements/status",
      method: "POST",
      body: { data: Array.isArray(body) ? body : [body] },
      query: createBroadcasterQuery(broadcasterId),
      oauth: true,
    });

    return res.data;
  }

  async manageHeldAutomodMessage(body: ManageAutomodMessageBody) {
    const userId = await this._client.getUserId();

    await this._client.enqueueCall({
      url: "moderation/automod/message",
      method: "POST",
      body: { ...body, user_id: userId },
      oauth: true,
    });
  }

  async getAutomodSettings(broadcasterId: string) {
    const moderatorId = await this._client.getUserId();

    const res = await this._client.enqueueCall<HelixResponse<AutomodSettings>>({
      url: "moderation/automod/settings",
      oauth: true,
      method: "GET",
      query: createBroadModQuery(broadcasterId, moderatorId),
    });

    return res.data[0];
  }

  async updateAutomodSettings(
    broadcasterId: string,
    body: Partial<ModerationSettings>
  ) {
    const moderatorId = await this._client.getUserId();

    const res = await this._client.enqueueCall<HelixResponse<AutomodSettings>>({
      url: "moderation/automod/settings",
      method: "PUT",
      body,
      query: createBroadModQuery(broadcasterId, moderatorId),
      oauth: true,
    });

    return res.data[0];
  }

  async getBannedUsers(userIds?: string[]) {
    const broadcasterId = await this._client.getUserId();

    const config: RequestConfig = {
      url: "moderation/banned",
      method: "GET",
      oauth: true,
      query: createGetBannedUsersQuery(broadcasterId, userIds),
    };

    const res = await this._client.enqueueCall<
      HelixPaginatedResponse<BannedUser>
    >(config);

    return new HelixPaginatedResponseIterator(res, this._client, config);
  }

  async banUser(broadcasterId: string, body: BanUserBody) {
    const moderatorId = await this._client.getUserId();

    const res = await this._client.enqueueCall<HelixResponse<BanUserResponse>>({
      url: "moderation/bans",
      method: "POST",
      oauth: true,
      query: createBroadModQuery(broadcasterId, moderatorId),
      body: { data: body },
    });

    return res.data[0];
  }

  async unbanUser(broadcasterId: string, userId: string) {
    const moderatorId = await this._client.getUserId();

    await this._client.enqueueCall({
      url: "moderation/bans",
      method: "DELETE",
      query: createUnbanQuery(broadcasterId, userId, moderatorId),
      oauth: true,
    });
  }

  async getBlockedTerms(broadcasterId: string) {
    const moderatorId = await this._client.getUserId();

    const config: RequestConfig = {
      url: "moderation/blocked_terms",
      method: "GET",
      oauth: true,
      query: createBroadModQuery(broadcasterId, moderatorId),
    };

    const res = await this._client.enqueueCall<
      HelixPaginatedResponse<BlockedTerm>
    >(config);

    return new HelixPaginatedResponseIterator(res, this._client, config);
  }

  async addBlockedTerm(broadcasterId: string, text: string) {
    const moderatorId = await this._client.getUserId();

    const res = await this._client.enqueueCall<HelixResponse<BlockedTerm>>({
      url: "moderation/blocked_terms",
      method: "POST",
      oauth: true,
      query: createBroadModQuery(broadcasterId, moderatorId),
      body: { text },
    });

    return res.data[0];
  }

  async removeBlockedTerm(query: RemoveBlockedTermQuery) {
    const moderatorId = await this._client.getUserId();

    await this._client.enqueueCall({
      url: "moderation/blocked_terms",
      method: "DELETE",
      oauth: true,
      query: { ...query, ...createModeratorQuery(moderatorId) },
    });
  }

  async deleteChatMessage(query: DeleteChatMessageQuery) {
    const moderatorId = await this._client.getUserId();

    await this._client.enqueueCall({
      url: "moderation/chat",
      oauth: true,
      query: { ...query, ...createModeratorQuery(moderatorId) },
      method: "DELETE",
    });
  }

  async getModerators(userIds?: string[]) {
    const broadcasterId = await this._client.getUserId();

    const config: RequestConfig = {
      url: "moderation/moderators",
      method: "GET",
      oauth: true,
      query: createGetModeratorsQuery(broadcasterId, userIds),
    };

    const res = await this._client.enqueueCall<
      HelixPaginatedResponse<Moderator>
    >(config);

    return new HelixPaginatedResponseIterator(res, this._client, config);
  }

  async addModerator(userId: string) {
    const broadcasterId = await this._client.getUserId();

    await this._client.enqueueCall({
      url: "moderation/moderators",
      oauth: true,
      query: createAddModeratorQuery(broadcasterId, userId),
      method: "POST",
    });
  }

  async removeChannelModerator(userId: string) {
    const broadcasterId = await this._client.getUserId();

    await this._client.enqueueCall({
      url: "moderation/moderators",
      oauth: true,
      query: createRemoveModeratorQuery(broadcasterId, userId),
      method: "DELETE",
    });
  }

  async getVips(userIds?: string[]) {
    const broadcasterId = await this._client.getUserId();

    const config: RequestConfig = {
      url: "channels/vips",
      method: "GET",
      oauth: true,
      query: createGetVipsQuery(broadcasterId, userIds),
    };

    const res = await this._client.enqueueCall<HelixPaginatedResponse<Vip>>(
      config
    );

    return new HelixPaginatedResponseIterator(res, this._client, config);
  }

  async addChannelVip(userId: string) {
    const broadcasterId = await this._client.getUserId();

    await this._client.enqueueCall({
      url: "channels/vips",
      oauth: true,
      query: createAddVipQuery(broadcasterId, userId),
      method: "POST",
    });
  }

  async removeChannelVip(userId: string) {
    const broadcasterId = await this._client.getUserId();

    await this._client.enqueueCall({
      url: "channels/vips",
      oauth: true,
      query: createRemoveVipQuery(broadcasterId, userId),
      method: "DELETE",
    });
  }

  async updateShieldModeStatus(broadcasterId: string, isActive: boolean) {
    const moderatorId = await this._client.getUserId();

    const res = await this._client.enqueueCall<HelixResponse<ShieldModeStatus>>(
      {
        url: "moderation/shield_mode",
        oauth: true,
        query: createBroadModQuery(broadcasterId, moderatorId),
        method: "PUT",
        body: { is_active: isActive },
      }
    );

    return res.data[0];
  }

  async getShieldModeStatus(broadcasterId: string) {
    const moderatorId = await this._client.getUserId();

    const res = await this._client.enqueueCall<HelixResponse<ShieldModeStatus>>(
      {
        url: "moderation/shield_mode",
        oauth: true,
        method: "GET",
        query: createBroadModQuery(broadcasterId, moderatorId),
      }
    );

    return res.data[0];
  }
}
