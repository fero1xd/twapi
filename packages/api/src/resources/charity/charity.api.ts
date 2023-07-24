import { ApiClient } from "../../client";
import {
  HelixPaginatedResponse,
  HelixResponse,
  RequestConfig,
} from "../../internal/interfaces";
import { HelixPaginatedResponseIterator } from "../HelixPaginatedResponse";
import { createBroadcasterQuery } from "../channel/channel";
import { CharityCampaign, CharityDonation } from "./charity.data";

interface CharityApiEndpoints {
  /**
   * Gets information about the charity campaign that a broadcaster is running. For example, the campaign’s fundraising goal and the current amount of donations.
   *
   * @param broadcasterId The ID of the broadcaster that’s currently running a charity campaign. This ID must match the user ID in the access token.
   *
   * @returns A list that contains the charity campaign that the broadcaster is currently running. The list is empty if the broadcaster is not running a charity campaign; the campaign information is not available after the campaign ends.
   */
  getCharityCampaign(broadcasterId: string): Promise<CharityCampaign[]>;

  /**
   * Gets the list of donations that users have made to the broadcaster’s active charity campaign.
   *
   * @param broadcasterId The ID of the broadcaster that’s currently running a charity campaign. This ID must match the user ID in the access token.
   *
   * @returns A list that contains the donations that users have made to the broadcaster’s charity campaign. The list is empty if the broadcaster is not currently running a charity campaign; the donation information is not available after the campaign ends.
   */
  getCharityCampaignDonation(
    broadcasterId: string
  ): Promise<HelixPaginatedResponseIterator<CharityDonation>>;
}

export class CharityApi implements CharityApiEndpoints {
  constructor(private _client: ApiClient) {}

  async getCharityCampaign(broadcasterId: string) {
    const res = await this._client.enqueueCall<HelixResponse<CharityCampaign>>({
      url: "charity/campaigns",
      method: "GET",
      oauth: true,
      query: createBroadcasterQuery(broadcasterId),
    });

    return res.data;
  }

  async getCharityCampaignDonation(broadcasterId: string) {
    const config: RequestConfig = {
      url: "charity/donations",
      method: "GET",
      oauth: true,
      query: createBroadcasterQuery(broadcasterId),
    };
    const res = await this._client.enqueueCall<
      HelixPaginatedResponse<CharityDonation>
    >(config);

    return new HelixPaginatedResponseIterator(res, this._client, config);
  }
}
