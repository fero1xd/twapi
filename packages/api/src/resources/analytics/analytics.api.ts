import { ApiClient } from "../../client";
import {
  HelixPaginatedResponse,
  RequestConfig,
} from "../../internal/interfaces";
import { HelixPaginatedResponseIterator } from "../HelixPaginatedResponse";
import {
  GameReport,
  GetExtensionAnalyticsQuery,
  GetGameAnalyticsQuery,
  Report,
} from "./analytics.data";

export interface AnalyticsApiEndpoints {
  /**
   * Gets an analytics report for one or more extensions. The response contains the URLs used to download the reports (CSV files)
   *
   * @param query Options to customize response
   *
   * @returns A paginated list of reports
   */
  getExtensionAnalytics(
    query: GetExtensionAnalyticsQuery
  ): Promise<HelixPaginatedResponseIterator<Report>>;

  /**
   * Gets an analytics report for one or more games. The response contains the URLs used to download the reports (CSV files)
   *
   * @param query Options to customize response
   *
   * @returns A paginated list of reports
   */
  getGameAnalytics(
    query: GetGameAnalyticsQuery
  ): Promise<HelixPaginatedResponseIterator<GameReport>>;
}

export class AnalyticsApi implements AnalyticsApiEndpoints {
  constructor(private _client: ApiClient) {}

  async getExtensionAnalytics(
    query: GetExtensionAnalyticsQuery
  ): Promise<HelixPaginatedResponseIterator<Report>> {
    const config: RequestConfig = {
      url: "analytics/extensions",
      oauth: true,
      query,
      method: "GET",
    };

    const res = await this._client.enqueueCall<HelixPaginatedResponse<Report>>(
      config
    );

    return new HelixPaginatedResponseIterator(res, this._client, config);
  }

  async getGameAnalytics(
    query: GetGameAnalyticsQuery
  ): Promise<HelixPaginatedResponseIterator<GameReport>> {
    const config: RequestConfig = {
      url: "analytics/games",
      oauth: true,
      query,
      method: "GET",
    };

    const res = await this._client.enqueueCall<
      HelixPaginatedResponse<GameReport>
    >(config);

    return new HelixPaginatedResponseIterator(res, this._client, config);
  }
}
