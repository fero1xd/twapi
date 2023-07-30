import { ApiClient } from "../../client";
import { HelixResponse } from "../../internal/interfaces";
import { createBroadcasterQuery } from "../common.data";
import { createStartRaidQuery } from "./raids";
import { StartRaidRespone } from "./raids.data";

export interface RaidsApiEndpoints {
  /**
     * Raid another channel by sending the broadcaster’s viewers to the targeted channel.
       When you call the API from a chat bot or extension, the Twitch UX pops up a window at the top of the chat room that identifies the number of viewers in the raid. The raid occurs when the broadcaster clicks Raid Now or after the 90-second countdown expires.

     * @param from The ID of the broadcaster that’s sending the raiding party. This ID must match the user ID in the user access token.
     * @param to The ID of the broadcaster to raid.
     * 
     * @returns Information about the pending raid.
     */
  startRaid(from: string, to: string): Promise<StartRaidRespone>;

  /**
   * Cancel a pending raid.
     You can cancel a raid at any point up until the broadcaster clicks Raid Now in the Twitch UX or the 90-second countdown expires.
     
   * @param broadcasterId The ID of the broadcaster that initiated the raid. This ID must match the user ID in the user access token.
   */
  cancelRaid(broadcasterId: string): Promise<void>;
}

export class RaidsApi implements RaidsApiEndpoints {
  constructor(private _client: ApiClient) {}

  async startRaid(from: string, to: string) {
    const res = await this._client.enqueueCall<HelixResponse<StartRaidRespone>>(
      {
        url: "raids",
        oauth: true,
        method: "POST",
        query: createStartRaidQuery(from, to),
      }
    );

    return res.data[0];
  }

  async cancelRaid(broadcasterId: string) {
    await this._client.enqueueCall({
      url: "raids",
      oauth: true,
      method: "DELETE",
      query: createBroadcasterQuery(broadcasterId),
    });
  }
}
