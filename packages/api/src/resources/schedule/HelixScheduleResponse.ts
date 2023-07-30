import { ApiClient } from "../../client";
import { RequestConfig } from "../../internal/interfaces";
import {
  HelixScheduleResponse,
  ScheduleSegment,
  ScheduleVacation,
} from "./schedule.data";

export class HelixScheduleResponseIterator {
  private readonly _initialResponse: ScheduleSegment[] = [];
  private _cursor?: string;
  private _requestConfig: RequestConfig;
  private _client: ApiClient;

  private _broadcasterId: string;
  private _broadcasterLogin: string;
  private _broadcasterName: string;
  private _vacation: ScheduleVacation | null;

  constructor(
    response: HelixScheduleResponse,
    client: ApiClient,
    config: RequestConfig
  ) {
    this._client = client;
    this._cursor = response.pagination?.cursor;

    if (response.data.segments) {
      this._initialResponse.push(...response.data.segments);
    }

    this._requestConfig = config;

    this._broadcasterId = response.data.broadcaster_id;
    this._broadcasterName = response.data.broadcaster_name;
    this._broadcasterLogin = response.data.broadcaster_login;
    this._vacation = response.data.vacation;
  }

  async *[Symbol.asyncIterator]() {
    if (this._initialResponse.length > 0) {
      for (const r of this._initialResponse) {
        yield r;
      }
    }

    while (this._cursor) {
      const res = await this._client.enqueueCall<HelixScheduleResponse>({
        ...this._requestConfig,
        query: {
          ...this._requestConfig.query,
          after: this._cursor,
        },
      });

      if (!res.data.segments || !res.data.segments.length) {
        return;
      }

      for (const r of res.data.segments) {
        yield r;
      }

      this._cursor = res.pagination?.cursor;
    }
  }

  public get broadcasterId() {
    return this._broadcasterId;
  }

  public get broadcasterName() {
    return this._broadcasterName;
  }

  public get broadcasterLogin() {
    return this._broadcasterLogin;
  }

  public get vacation() {
    return this._vacation;
  }
}
