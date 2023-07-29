import { ApiClient } from "../client";
import { HelixPaginatedResponse, RequestConfig } from "../internal/interfaces";
import { HelixPaginatedResponseWithTotal } from "./common.data";

export class HelixPaginatedResponseIterator<T = unknown> {
  private readonly _initialResponse: T[] = [];
  private readonly _total?: number;
  private _cursor?: string;
  private _requestConfig: RequestConfig;
  private _client: ApiClient;

  constructor(
    response: HelixPaginatedResponse<T> | HelixPaginatedResponseWithTotal<T>,
    client: ApiClient,
    config: RequestConfig
  ) {
    // @ts-expect-error
    this._total = response.total === undefined ? undefined : response.total;

    this._client = client;
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

  public get total() {
    return this._total;
  }
}
