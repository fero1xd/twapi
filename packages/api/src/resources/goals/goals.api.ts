import { ApiClient } from "../../client";
import { HelixResponse } from "../../internal/interfaces";
import { createBroadcasterQuery } from "../common.data";
import { Goal } from "./goals.data";

export interface GoalsApiEndpoints {
  /**
   * Gets the broadcaster’s list of active goals. Use this endpoint to get the current progress of each goal.
   *
   * @retuns A paginated list of goals
   */
  getCreatorGoals(): Promise<Goal[]>;
}

export class GoalsApi implements GoalsApiEndpoints {
  constructor(private _client: ApiClient) {}

  async getCreatorGoals() {
    const userId = await this._client.getUserId();

    const res = await this._client.enqueueCall<HelixResponse<Goal>>({
      url: "goals",
      method: "GET",
      oauth: true,
      query: createBroadcasterQuery(userId),
    });

    return res.data;
  }
}
