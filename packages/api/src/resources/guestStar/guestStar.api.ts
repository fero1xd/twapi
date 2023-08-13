import { ApiClient } from "../../client";
import { HelixResponse } from "../../internal/interfaces";
import { createBroadModQuery } from "../chat/chat";
import { createBroadcasterQuery, createModeratorQuery } from "../common.data";
import {
  AssignGuestStarSlotQuery,
  DeleteGuestStarSlotQuery,
  DeleteInviteQuery,
  GetGuestStarInvitesQuery,
  GuestStarSettings,
  Invite,
  SendInviteQuery,
  SessionDetail,
  UpdateGuestStarSettingsBody,
  UpdateGuestStarSlotQuery,
  UpdateGuestStarSlotSettingsQuery,
} from "./guestStar.data";

export interface GuestStarApiEndpoints {
  /**
     * BETA Gets the channel settings for configuration of the Guest Star feature for a particular host.
     * 
     * @param broadcasterId The ID of the broadcaster you want to get guest star settings for.

     * @returns Guest star configuration for the user
  */
  getChannelGuestStarSettings(
    broadcasterId: string
  ): Promise<GuestStarSettings>;

  /**
   * BETA Mutates the channel settings for configuration of the Guest Star feature for a particular host.
   *
   * @param body Data to update
   */
  updateChannelGuestStarSettings(
    body: UpdateGuestStarSettingsBody
  ): Promise<void>;

  /**
   * BETA Gets information about an ongoing Guest Star session for a particular channel.
   *
   * @param broadcasterId ID for the user hosting the Guest Star session.
   *
   * @returns Summary of the session details
   */
  getGuestStarSession(broadcasterId: string): Promise<SessionDetail>;

  /**
   * BETA Programmatically creates a Guest Star session on behalf of the broadcaster. Requires the broadcaster to be present in the call interface, or the call will be ended automatically.
   *
   * @returns Summary of the session details.
   */
  createGuestStarSession(): Promise<SessionDetail>;

  /**
   * BETA Programmatically ends a Guest Star session on behalf of the broadcaster. Performs the same action as if the host clicked the “End Call” button in the Guest Star UI.
   *
   * @param sessionId ID for the session to end on behalf of the broadcaster.
   *
   * @returns Summary of the session details when the session was ended.
   */
  endGuestStarSession(sessionId: string): Promise<SessionDetail>;

  /**
   * BETA Provides the caller with a list of pending invites to a Guest Star session, including the invitee’s ready status while joining the waiting room.
   *
   * @param query Data related to request
   *
   * @returns A list of invite objects describing the invited user as well as their ready status.
   */
  getGuestStarInvites(query: GetGuestStarInvitesQuery): Promise<Invite[]>;

  /**
   * BETA Sends an invite to a specified guest on behalf of the broadcaster for a Guest Star session in progress.
   *
   * @param query Data related to query
   */
  sendGuestStarInvite(query: SendInviteQuery): Promise<void>;

  /**
   * BETA Revokes a previously sent invite for a Guest Star session.
   *
   * @param query Data related to query
   */
  deleteGuestStarInvite(query: DeleteInviteQuery): Promise<void>;

  /**
   * BETA Allows a previously invited user to be assigned a slot within the active Guest Star session, once that guest has indicated they are ready to join.
   *
   * @param query Data related to query
   */
  assignGuestStarSlot(query: AssignGuestStarSlotQuery): Promise<void>;

  /**
   * BETA Allows a user to update the assigned slot for a particular user within the active Guest Star session.
   *
   * @param query Data related to query
   */
  updateGuestStarSlot(query: UpdateGuestStarSlotQuery): Promise<void>;

  /**
   * BETA Allows a caller to remove a slot assignment from a user participating in an active Guest Star session. This revokes their access to the session immediately and disables their access to publish or subscribe to media within the session.
   *
   * @param query Data related to query
   */
  deleteGuestStarSlot(query: DeleteGuestStarSlotQuery): Promise<void>;

  /**
   * BETA Allows a user to update slot settings for a particular guest within a Guest Star session, such as allowing the user to share audio or video within the call as a host. These settings will be broadcasted to all subscribers which control their view of the guest in that slot. One or more of the optional parameters to this API can be specified at any time.
   *
   * @param query Data related to query
   */
  updateGuestStarSlotSettings(
    query: UpdateGuestStarSlotSettingsQuery
  ): Promise<void>;
}

export class GuestStarApi implements GuestStarApiEndpoints {
  constructor(private _client: ApiClient) {}

  async getChannelGuestStarSettings(broadcasterId: string) {
    const moderatorId = await this._client.getUserId();

    const res = await this._client.enqueueCall<
      HelixResponse<GuestStarSettings>
    >({
      url: "guest_star/channel_settings",
      method: "GET",
      oauth: true,
      query: createBroadModQuery(broadcasterId, moderatorId),
    });

    return res.data[0];
  }

  async updateChannelGuestStarSettings(body: UpdateGuestStarSettingsBody) {
    const broadcasterId = await this._client.getUserId();

    await this._client.enqueueCall({
      url: "guest_star/channel_settings",
      method: "PUT",
      oauth: true,
      query: createBroadcasterQuery(broadcasterId),
      body,
    });
  }

  async getGuestStarSession(broadcasterId: string) {
    const moderatorId = await this._client.getUserId();

    const res = await this._client.enqueueCall<HelixResponse<SessionDetail>>({
      url: "guest_star/session",
      method: "GET",
      oauth: true,
      query: createBroadModQuery(broadcasterId, moderatorId),
    });

    return res.data[0];
  }

  async createGuestStarSession(): Promise<SessionDetail> {
    const broadcasterId = await this._client.getUserId();

    const res = await this._client.enqueueCall<HelixResponse<SessionDetail>>({
      url: "guest_star/session",
      method: "POST",
      oauth: true,
      query: createBroadcasterQuery(broadcasterId),
    });

    return res.data[0];
  }

  async endGuestStarSession(sessionId: string) {
    const broadcasterId = await this._client.getUserId();

    const res = await this._client.enqueueCall<HelixResponse<SessionDetail>>({
      url: "guest_star/session",
      method: "DELETE",
      query: {
        ...createBroadcasterQuery(broadcasterId),
        session_id: sessionId,
      },
      oauth: true,
    });

    return res.data[0];
  }

  async getGuestStarInvites(query: GetGuestStarInvitesQuery) {
    const moderatorId = await this._client.getUserId();

    const res = await this._client.enqueueCall<HelixResponse<Invite>>({
      url: "guest_star/invites",
      oauth: true,
      method: "GET",
      query: { ...query, ...createModeratorQuery(moderatorId) },
    });

    return res.data;
  }

  async sendGuestStarInvite(query: SendInviteQuery) {
    const moderatorId = await this._client.getUserId();

    await this._client.enqueueCall({
      url: "guest_star/invites",
      method: "POST",
      oauth: true,
      query: { ...query, ...createModeratorQuery(moderatorId) },
    });
  }

  async deleteGuestStarInvite(query: DeleteInviteQuery) {
    const moderatorId = await this._client.getUserId();

    await this._client.enqueueCall({
      url: "guest_star/invites",
      method: "DELETE",
      oauth: true,
      query: { ...query, ...createModeratorQuery(moderatorId) },
    });
  }

  async assignGuestStarSlot(query: AssignGuestStarSlotQuery) {
    const moderatorId = await this._client.getUserId();

    await this._client.enqueueCall({
      url: "guest_star/slot",
      method: "POST",
      oauth: true,
      query: { ...query, ...createModeratorQuery(moderatorId) },
    });
  }

  async updateGuestStarSlot(query: UpdateGuestStarSlotQuery) {
    const moderatorId = await this._client.getUserId();

    await this._client.enqueueCall({
      url: "guest_star/slot",
      method: "PATCH",
      oauth: true,
      query: { ...query, ...createModeratorQuery(moderatorId) },
    });
  }

  async deleteGuestStarSlot(query: DeleteGuestStarSlotQuery) {
    const moderatorId = await this._client.getUserId();

    await this._client.enqueueCall({
      url: "guest_star/slot",
      method: "DELETE",
      oauth: true,
      query: { ...query, ...createModeratorQuery(moderatorId) },
    });
  }

  async updateGuestStarSlotSettings(query: UpdateGuestStarSlotSettingsQuery) {
    const moderatorId = await this._client.getUserId();

    await this._client.enqueueCall({
      url: "guest_star/slot_settings",
      method: "PATCH",
      oauth: true,
      query: { ...query, ...createModeratorQuery(moderatorId) },
    });
  }
}
