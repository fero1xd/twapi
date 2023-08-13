import { ApiClient } from "../../client";
import {
  HelixPaginatedResponse,
  HelixResponse,
  RequestConfig,
} from "../../internal/interfaces";
import { HelixPaginatedResponseIterator } from "../HelixPaginatedResponse";
import { createBroadcasterQuery } from "../common.data";
import { CharityCampaign, CharityDonation } from "./charity.data";

export interface CharityApiEndpoints {
  /**
   * Gets information about the charity campaign that a broadcaster is running. For example, the campaign’s fundraising goal and the current amount of donations.
   *
   * @returns A list that contains the charity campaign that the broadcaster is currently running. The list is empty if the broadcaster is not running a charity campaign; the campaign information is not available after the campaign ends.
   */
  getCharityCampaign(): Promise<CharityCampaign[]>;

  /**
   * Gets the list of donations that users have made to the broadcaster’s active charity campaign.
   *
   * @returns A list that contains the donations that users have made to the broadcaster’s charity campaign. The list is empty if the broadcaster is not currently running a charity campaign; the donation information is not available after the campaign ends.
   */
  getCharityCampaignDonation(): Promise<
    HelixPaginatedResponseIterator<CharityDonation>
  >;
}

export class CharityApi implements CharityApiEndpoints {
  constructor(private _client: ApiClient) {}

  async getCharityCampaign() {
    const userId = await this._client.getUserId();

    const res = await this._client.enqueueCall<HelixResponse<CharityCampaign>>({
      url: "charity/campaigns",
      method: "GET",
      oauth: true,
      query: createBroadcasterQuery(userId),
    });

    return res.data;
  }

  async getCharityCampaignDonation() {
    const userId = await this._client.getUserId();

    const config: RequestConfig = {
      url: "charity/donations",
      method: "GET",
      oauth: true,
      query: createBroadcasterQuery(userId),
    };
    const res = await this._client.enqueueCall<
      HelixPaginatedResponse<CharityDonation>
    >(config);

    return new HelixPaginatedResponseIterator(res, this._client, config);
  }
}
