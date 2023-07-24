import { ApiClient } from "../../client";
import { HelixResponse } from "../../internal/interfaces";
import { createBroadcasterQuery } from "../channel/channel";
import {
  Cheermotes,
  GetBitsLeaderboardQuery,
  HelixBitsLeaderboardResponse,
} from "./bits.data";

interface BitsApiEndpoints {
  getBitsLeaderboard(
    query: GetBitsLeaderboardQuery
  ): Promise<HelixBitsLeaderboardResponse>;

  getCheermotes(broadcasterId: string): Promise<Cheermotes[]>;
}

export class BitsApi implements BitsApiEndpoints {
  constructor(private _client: ApiClient) {}

  /**
   * Gets the Bits leaderboard for the authenticated broadcaster.
   *
   * @param query Optional query params
   * @returns The Bits leaderboard
   */
  async getBitsLeaderboard(query: GetBitsLeaderboardQuery = {}) {
    const res = await this._client.enqueueCall<HelixBitsLeaderboardResponse>({
      url: "bits/leaderboard",
      method: "GET",
      oauth: true,
      query,
    });
    return res;
  }

  /**
   * Gets a list of Cheermotes that users can use to cheer Bits in any Bits-enabled channel’s chat room. Cheermotes are animated emotes that viewers can assign Bits to.
   *
   * @param broadcasterId The ID of the broadcaster whose custom Cheermotes you want to get. Specify the broadcaster’s ID if you want to include the broadcaster’s Cheermotes in the response (not all broadcasters upload Cheermotes). If not specified, the response contains only global Cheermotes.
   * @returns The list of Cheermotes. The list is in ascending order by the order field’s value.
   */
  async getCheermotes(broadcasterId?: string) {
    const res = await this._client.enqueueCall<HelixResponse<Cheermotes>>({
      url: "bits/cheermotes",
      method: "GET",
      oauth: true,
      query: broadcasterId ? createBroadcasterQuery(broadcasterId) : {},
    });

    return res.data;
  }
}
