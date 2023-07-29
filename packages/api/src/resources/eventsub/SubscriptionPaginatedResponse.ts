import { ApiClient } from "../../client";
import { RequestConfig } from "../../internal/interfaces";
import { HelixPaginatedResponseIterator } from "../HelixPaginatedResponse";
import { HelixPaginatedSubscriptionResponse } from "./eventsub.data";

export class SubscriptionPaginatedResponse<
  T = unknown
> extends HelixPaginatedResponseIterator<T> {
  private _totalCost: number;
  private _maxTotalCost: number;

  constructor(
    response: HelixPaginatedSubscriptionResponse<T>,
    _client: ApiClient,
    config: RequestConfig
  ) {
    super(response, _client, config);

    this._totalCost = response.total_cost;
    this._maxTotalCost = response.max_total_cost;
  }

  public get totalCost() {
    return this._totalCost;
  }

  public get maxTotalCost() {
    return this._maxTotalCost;
  }
}
