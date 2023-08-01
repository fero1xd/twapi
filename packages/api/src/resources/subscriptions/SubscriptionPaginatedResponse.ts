import { ApiClient } from "../../client";
import { RequestConfig } from "../../internal/interfaces";
import { HelixPaginatedResponseIterator } from "../HelixPaginatedResponse";
import { HelixPaginatedSubscriptionResponse } from "./subscriptions.data";

export class SubscriptionPaginatedResponse<
  T = unknown
> extends HelixPaginatedResponseIterator<T> {
  private _points: number;

  constructor(
    response: HelixPaginatedSubscriptionResponse<T>,
    _client: ApiClient,
    config: RequestConfig
  ) {
    super(response, _client, config);

    this._points = response.points;
  }

  public get points() {
    return this._points;
  }
}
