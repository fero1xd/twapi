import { ApiClient } from "../../client";
import { HelixResponse, RequestConfig } from "../../internal/interfaces";
import { UserInfo } from "../../internal/types";
import { HelixPaginatedResponseIterator } from "../HelixPaginatedResponse";
import {
  HelixPaginatedResponseWithTotal,
  createBroadcasterQuery,
} from "../common.data";
import {
  createBroadModQuery,
  createGetEmoteSetsQuery,
  createSendShoutoutQuery,
  createUpdateChatColorQuery,
} from "./chat";
import {
  ChannelEmote,
  ChatAnnouncementBody,
  ChatBadge,
  ChatColor,
  ChatSettings,
  EmoteSet,
  GlobalEmote,
  HelixResponseWithTemplate,
  UpdateChatSettingsBody,
  UserColor,
} from "./chat.data";

export interface ChatApiEndpoints {
  /**
   * Gets the list of users that are connected to the broadcaster’s chat session.
   *
   * @param broadcasterId The ID of the broadcaster whose list of chatters you want to get.
   *
   * @returns The list of users that are connected to the broadcaster’s chat room. The list is empty if no users are connected to the chat room.
   */
  getChatters(
    broadcasterId: string
  ): Promise<HelixPaginatedResponseIterator<UserInfo>>;

  /**
   * Gets the broadcaster’s list of custom emotes. Broadcasters create these custom emotes for users who subscribe to or follow the channel or cheer Bits in the channel’s chat window
   *
   * @param broadcasterId An ID that identifies the broadcaster whose emotes you want to get.
   *
   * @returns The list of emotes that the specified broadcaster created. If the broadcaster hasn’t created custom emotes, the list is empty.
   */
  getChannelEmotes(broadcasterId: string): Promise<ChannelEmote[]>;

  /**
   * Gets the list of global emotes. Global emotes are Twitch-created emotes that users can use in any Twitch chat.
   *
   * @returns The list of global emotes.
   */
  getGlobalEmotes(): Promise<GlobalEmote[]>;

  /**
   * Gets emotes for one or more specified emote sets.
   *
   * @param emoteSetId An ID that identifies the emote set to get. Include this parameter for each emote set you want to get. For example, emote_set_id=1234&emote_set_id=5678. You may specify a maximum of 25 IDs. The response contains only the IDs that were found and ignores duplicate IDs.
   *
   *@returns The list of emotes found in the specified emote sets. The list is empty if none of the IDs were found. The list is in the same order as the set IDs specified in the request. Each set contains one or more emoticons.
   */
  getEmoteSets(emoteSetId: string | string[]): Promise<EmoteSet[]>;

  /**
   * Gets the broadcaster’s list of custom chat badges. The list is empty if the broadcaster hasn’t created custom chat badges.
   *
   * @param broadcasterId The ID of the broadcaster whose chat badges you want to get.
   *
   * @returns The list of chat badges. The list is sorted in ascending order by set_id, and within a set, the list is sorted in ascending order by id.
   */
  getChannelChatBadges(broadcasterId: string): Promise<ChatBadge[]>;

  /**
   * Gets Twitch’s list of chat badges, which users may use in any channel’s chat room.
   *
   * @returns The list of chat badges. The list is sorted in ascending order by set_id, and within a set, the list is sorted in ascending order by id.
   */
  getGlobalChatBadges(): Promise<ChatBadge[]>;

  /**
   * Gets the broadcaster’s chat settings.
   *
   * @param broadcasterId The ID of the broadcaster whose chat settings you want to get.
   *
   * @returns The chat settings
   */
  getChatSettings(broadcasterId: string): Promise<ChatSettings>;

  /**
   * Updates the broadcaster’s chat settings.
   *
   * @param broadcasterId The ID of the broadcaster whose chat settings you want to update.
   * @param body Updated chat settings
   *
   * @returns All the settings
   */
  updateChatSettings(
    broadcasterId: string,
    body: UpdateChatSettingsBody
  ): Promise<ChatSettings>;

  /**
   * Sends an announcement to the broadcaster’s chat room.
   *
   * @param broadcasterId The ID of the broadcaster that owns the chat room to send the announcement to.
   * @param body The message and color fields
   */
  sendChatAnnouncement(
    broadcasterId: string,
    body: ChatAnnouncementBody
  ): Promise<void>;

  /**
   * Sends a Shoutout to the specified broadcaster.
   * **Rate Limits** The broadcaster may send a Shoutout once every 2 minutes. They may send the same broadcaster a Shoutout once every 60 minutes.
   *
   * @param from The ID of the broadcaster that’s sending the Shoutout.
   * @param to The ID of the broadcaster that’s receiving the Shoutout.
   */
  sendShoutout(from: string, to: string): Promise<void>;

  /**
   * Gets the color used for the user’s name in chat.
   *
   * @param userId The ID of the user whose username color you want to get
   */
  getUserChatColor(userId: string): Promise<UserColor>;

  /**
   * Gets the color used for the user’s name in chat.
   *
   * @param userIds The list of IDs of the user whose username color you want to get
   */
  getUserChatColors(userIds: string | string[]): Promise<UserColor[]>;

  /**
   * Updates the color used for the user’s name in chat.
   *
   * @param color The color to use for the user’s name in chat.
   */
  updateUserChatColor(color: ChatColor): Promise<void>;
}

export class ChatApi implements ChatApiEndpoints {
  constructor(private _client: ApiClient) {}

  async getChatters(broadcasterId: string) {
    const moderatorId = await this._client.getUserId();

    const config: RequestConfig = {
      url: "chat/chatters",
      method: "GET",
      oauth: true,
      query: createBroadModQuery(broadcasterId, moderatorId),
    };
    const res = await this._client.enqueueCall<
      HelixPaginatedResponseWithTotal<UserInfo>
    >(config);

    return new HelixPaginatedResponseIterator(res, this._client, config);
  }

  async getChannelEmotes(broadcasterId: string) {
    const res = await this._client.enqueueCall<
      HelixResponseWithTemplate<ChannelEmote>
    >({
      url: "chat/emotes",
      method: "GET",
      oauth: false,
      query: createBroadcasterQuery(broadcasterId),
    });

    return res.data;
  }

  async getGlobalEmotes() {
    const res = await this._client.enqueueCall<
      HelixResponseWithTemplate<GlobalEmote>
    >({
      url: "chat/emotes/global",
      method: "GET",
      oauth: false,
    });

    return res.data;
  }

  async getEmoteSets(emoteSetId: string | string[]) {
    const res = await this._client.enqueueCall<
      HelixResponseWithTemplate<EmoteSet>
    >({
      url: "chat/emotes/set",
      method: "GET",
      oauth: false,
      query: createGetEmoteSetsQuery(emoteSetId),
    });

    return res.data;
  }

  async getChannelChatBadges(broadcasterId: string): Promise<ChatBadge[]> {
    const res = await this._client.enqueueCall<HelixResponse<ChatBadge>>({
      url: "chat/badges",
      method: "GET",
      oauth: false,
      query: createBroadcasterQuery(broadcasterId),
    });

    return res.data;
  }

  async getGlobalChatBadges(): Promise<ChatBadge[]> {
    const res = await this._client.enqueueCall<HelixResponse<ChatBadge>>({
      url: "chat/badges/global",
      method: "GET",
      oauth: false,
    });

    return res.data;
  }

  async getChatSettings(broadcasterId: string) {
    const moderatorId = await this._client.getUserId();

    const res = await this._client.enqueueCall<HelixResponse<ChatSettings>>({
      url: "chat/settings",
      method: "GET",
      oauth: false,
      query: createBroadModQuery(broadcasterId, moderatorId),
    });

    return res.data[0];
  }

  async updateChatSettings(
    broadcasterId: string,
    body: UpdateChatSettingsBody
  ): Promise<ChatSettings> {
    const moderatorId = await this._client.getUserId();

    const res = await this._client.enqueueCall<HelixResponse<ChatSettings>>({
      url: "chat/settings",
      method: "PATCH",
      oauth: true,
      body,
      query: createBroadModQuery(broadcasterId, moderatorId),
    });

    return res.data[0];
  }

  async sendChatAnnouncement(
    broadcasterId: string,
    body: ChatAnnouncementBody
  ) {
    const moderatorId = await this._client.getUserId();

    await this._client.enqueueCall({
      url: "chat/announcements",
      method: "POST",
      body,
      query: createBroadModQuery(broadcasterId, moderatorId),
      oauth: true,
    });
  }

  async sendShoutout(from: string, to: string) {
    const moderatorId = await this._client.getUserId();

    await this._client.enqueueCall({
      url: "chat/shoutouts",
      method: "POST",
      query: createSendShoutoutQuery(from, to, moderatorId),
      oauth: true,
    });
  }

  async getUserChatColor(userId: string) {
    const res = await this._client.enqueueCall<HelixResponse<UserColor>>({
      url: "chat/color",
      method: "GET",
      query: { user_id: userId },
      oauth: false,
    });

    return res.data[0];
  }

  async getUserChatColors(userIds: string | string[]) {
    const res = await this._client.enqueueCall<HelixResponse<UserColor>>({
      url: "chat/color",
      method: "GET",
      query: { user_id: userIds },
      oauth: false,
    });

    return res.data;
  }

  async updateUserChatColor(color: ChatColor) {
    const userId = await this._client.getUserId();

    await this._client.enqueueCall({
      url: "chat/color",
      method: "PUT",
      query: createUpdateChatColorQuery(userId, color),
      oauth: true,
    });
  }
}
