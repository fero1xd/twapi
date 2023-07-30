import { ApiClient } from "../../client";
import {
  HelixPaginatedResponse,
  HelixResponse,
  RequestConfig,
} from "../../internal/interfaces";
import { HelixPaginatedResponseIterator } from "../HelixPaginatedResponse";
import { createGetPollsQuery } from "./polls";
import { CreatePollBody, EndPollBody, Poll } from "./polls.data";

export interface PollsApiEndpoints {
  /**
     * Gets a list of polls that the broadcaster created.
       Polls are available for 90 days after they’re created.

     * @param broadcasterId The ID of the broadcaster that created the polls. This ID must match the user ID in the user access token.
     * @param id IDs that identify the polls to return
     * 
     * @returns A paginated list of polls
  */
  getPolls(
    broadcasterId: string,
    id?: string
  ): Promise<HelixPaginatedResponseIterator<Poll>>;

  /**
   * Creates a poll that viewers in the broadcaster’s channel can vote on.
   *
   * @param body Data to create a poll
   *
   * @returns The poll that you created.
   */
  createPoll(body: CreatePollBody): Promise<Poll>;

  /**
   * Ends an active poll. You have the option to end it or end it and archive it.
   *
   * @param body Data related to end a post
   *
   * @returns The poll that you ended.
   */
  endPoll(body: EndPollBody): Promise<Poll>;
}

export class PollsApi implements PollsApiEndpoints {
  constructor(private _client: ApiClient) {}

  async getPolls(broadcasterId: string, id?: string) {
    const config: RequestConfig = {
      url: "polls",
      method: "GET",
      query: createGetPollsQuery(broadcasterId, id),
      oauth: true,
    };

    const res = await this._client.enqueueCall<HelixPaginatedResponse<Poll>>(
      config
    );

    return new HelixPaginatedResponseIterator(res, this._client, config);
  }

  async createPoll(body: CreatePollBody) {
    const res = await this._client.enqueueCall<HelixResponse<Poll>>({
      url: "polls",
      method: "POST",
      oauth: true,
      body,
    });

    return res.data[0];
  }

  async endPoll(body: EndPollBody) {
    const res = await this._client.enqueueCall<HelixResponse<Poll>>({
      url: "polls",
      method: "PATCH",
      oauth: true,
      body,
    });

    return res.data[0];
  }
}
