import { ApiClient } from "../../client";
import {
  HelixPaginatedResponse,
  HelixResponse,
  RequestConfig,
} from "../../internal/interfaces";
import { HelixPaginatedResponseIterator } from "../HelixPaginatedResponse";
import {
  Entitlement,
  EntitlementStaus,
  FulfillmentStatus,
  GetEntitlementQuery,
} from "./entitlements.data";

interface EntitlementsApiEndpoint {
  getDropEntitlements(
    query: GetEntitlementQuery,
    useAppToken: boolean
  ): Promise<HelixPaginatedResponseIterator<Entitlement>>;

  getDropEntitlementsById(id: string): Promise<Entitlement[]>;

  updateEntitlements(
    ids: string[],
    fulfillmentStatus: FulfillmentStatus
  ): Promise<EntitlementStaus[]>;
}

export class EntitlementsApi implements EntitlementsApiEndpoint {
  constructor(private _client: ApiClient) {}

  async getDropEntitlements(query: GetEntitlementQuery, useAppToken = true) {
    const config: RequestConfig = {
      url: "entitlements/drops",
      method: "GET",
      query,
      oauth: useAppToken,
    };
    const res = await this._client.enqueueCall<
      HelixPaginatedResponse<Entitlement>
    >(config);

    return new HelixPaginatedResponseIterator(res, this._client, config);
  }

  async getDropEntitlementsById(id: string) {
    const res = await this._client.enqueueCall<HelixResponse<Entitlement>>({
      url: "entitlements/drops",
      method: "GET",
      query: { id },
      oauth: false,
    });

    return res.data;
  }

  async updateEntitlements(
    ids: string[],
    fulfillmentStatus: FulfillmentStatus
  ) {
    const res = await this._client.enqueueCall<HelixResponse<EntitlementStaus>>(
      {
        url: "entitlements/drops",
        method: "PATCH",
        body: { entitlement_ids: ids, fulfillment_status: fulfillmentStatus },
        oauth: false,
      }
    );

    return res.data;
  }
}
