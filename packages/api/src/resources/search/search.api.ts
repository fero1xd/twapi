import { ApiClient } from "../../client";
import {
  HelixPaginatedResponse,
  RequestConfig,
} from "../../internal/interfaces";
import { HelixPaginatedResponseIterator } from "../HelixPaginatedResponse";
import { createSearchChannelQuery } from "./search";
import { SearchCategoriesResponse, SearchChannelResponse } from "./search.data";

export interface SearchApiEndpoints {
  /**
   * Gets the games or categories that match the specified query.
   *
   * @param query The search string
   *
   * @returns A paginated list of games or categories that match the query.
   */
  searchCategories(
    query: string
  ): Promise<HelixPaginatedResponseIterator<SearchCategoriesResponse>>;

  /**
   * Gets the channels that match the specified query and have streamed content within the past 6 months.
   *
   * @param query The search string
   * @param liveOnly A Boolean value that determines whether the response includes only channels that are currently streaming live
   *
   * @returns A paginated list of channels that match the query
   */
  searchChannel(
    query: string,
    liveOnly: boolean
  ): Promise<HelixPaginatedResponseIterator<SearchChannelResponse>>;
}

export class SearchApi implements SearchApiEndpoints {
  constructor(private _client: ApiClient) {}

  async searchCategories(query: string) {
    const config: RequestConfig = {
      url: "search/categories",
      method: "GET",
      oauth: false,
      query: { query },
    };

    const res = await this._client.enqueueCall<
      HelixPaginatedResponse<SearchCategoriesResponse>
    >(config);
    return new HelixPaginatedResponseIterator(res, this._client, config);
  }

  async searchChannel(query: string, liveOnly = false) {
    const config: RequestConfig = {
      url: "search/channels",
      method: "GET",
      oauth: false,
      query: createSearchChannelQuery(query, liveOnly),
    };

    const res = await this._client.enqueueCall<
      HelixPaginatedResponse<SearchChannelResponse>
    >(config);
    return new HelixPaginatedResponseIterator(res, this._client, config);
  }
}
