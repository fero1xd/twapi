import { ApiClient } from "../client";
import { HelixPaginatedResponse, RequestConfig } from "../internal/interfaces";
import { HelixPaginatedResponseWithTotal } from "./channelPoints/channelPoints.data";

export class HelixPaginatedResponseIterator<T = unknown> {
  private readonly _initialResponse: T[] = [];
  private readonly _total?: number;
  private _cursor?: string;
  private _requestConfig: RequestConfig;

  constructor(
    response: HelixPaginatedResponse<T> | HelixPaginatedResponseWithTotal<T>,
    private _client: ApiClient,
    config: RequestConfig
  ) {
    // @ts-expect-error
    this._total = response.total || undefined;

    this._cursor = response.pagination?.cursor;
    this._initialResponse.push(...response.data);
    this._requestConfig = config;
  }

  async *[Symbol.asyncIterator]() {
    if (this._initialResponse.length > 0) {
      for (const r of this._initialResponse) {
        yield r;
      }
    }

    while (this._cursor) {
      const res = await this._client.enqueueCall<HelixPaginatedResponse<T>>({
        ...this._requestConfig,
        query: {
          ...this._requestConfig.query,
          after: this._cursor,
        },
      });

      if (!res.data.length) {
        return;
      }

      for (const r of res.data) {
        yield r;
      }

      this._cursor = res.pagination?.cursor;
    }
  }

  get total() {
    return this._total;
  }
}
