import { ApiClient } from "../../client";
import { HelixResponse } from "../../internal/interfaces";
import { createBroadcasterQuery } from "../common.data";
import { Goal } from "./goals.data";

export interface GoalsApiEndpoints {
  /**
   * Gets the broadcaster’s list of active goals. Use this endpoint to get the current progress of each goal.
   *
   * @param broadcasterId The ID of the broadcaster that created the goals. This ID must match the user ID in the user access token.
   *
   * @retuns A paginated list of goals
   */
  getCreatorGoals(broadcasterId: string): Promise<Goal[]>;
}

export class GoalsApi implements GoalsApiEndpoints {
  constructor(private _client: ApiClient) {}

  async getCreatorGoals(broadcasterId: string) {
    const res = await this._client.enqueueCall<HelixResponse<Goal>>({
      url: "goals",
      method: "GET",
      oauth: true,
      query: createBroadcasterQuery(broadcasterId),
    });

    return res.data;
  }
}
