import { ApiClient } from "../../client";
import { HelixResponse } from "../../internal/interfaces";
import { createBroadcasterQuery } from "../common.data";
import { GetTeamsResponse, Team } from "./teams.data";

export interface TeamsApiEndpoints {
  /**
   * Gets the list of Twitch teams that the broadcaster is a member of.
   *
   * @param broadcasterId The ID of the broadcaster whose teams you want to get.
   *
   * @returns The list of teams that the broadcaster is a member of.
   */
  getChannelTeams(broadcasterId: string): Promise<Team[]>;

  /**
   * Gets information about the specified Twitch team
   *
   * @param name The name of the team to get. This parameter and the id parameter are mutually exclusive; you must specify the team’s name or ID but not both.
   * @param id The ID of the team to get. This parameter and the name parameter are mutually exclusive; you must specify the team’s name or ID but not both.
   *
   * @returns A list that contains the single team that you requested.
   */
  getTeams(name: string, id: string): Promise<GetTeamsResponse[]>;
}

export class TeamsApi implements TeamsApiEndpoints {
  constructor(private _client: ApiClient) {}

  async getChannelTeams(broadcasterId: string) {
    const res = await this._client.enqueueCall<HelixResponse<Team>>({
      url: "teams/channel",
      oauth: true,
      query: createBroadcasterQuery(broadcasterId),
      method: "GET",
    });

    return res.data;
  }

  async getTeams(name: string, id: string) {
    const res = await this._client.enqueueCall<HelixResponse<GetTeamsResponse>>(
      {
        url: "teams",
        oauth: true,
        query: { name, id },
        method: "GET",
      }
    );

    return res.data;
  }
}
