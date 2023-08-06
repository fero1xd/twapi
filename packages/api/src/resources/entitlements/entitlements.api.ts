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

export interface EntitlementsApiEndpoints {
  /**
   * Gets an organization’s list of entitlements that have been granted to a game, a user, or both.
   *
   * @param query Query
   * @param useAppToken Wether to use app access token or user access token
   *
   * @returns A paginated list of entitlements
   */
  getDropEntitlements(
    query: GetEntitlementQuery,
    useAppToken: boolean
  ): Promise<HelixPaginatedResponseIterator<Entitlement>>;

  /**
   * Gets an organization’s list of entitlements that have been granted to a game, a user, or both.
   *
   * @param id Entitlement id
   *
   * @returns A list of entitlements
   */
  getDropEntitlementsById(id: string): Promise<Entitlement>;

  /**
   * Gets an organization’s list of entitlements that have been granted to a game, a user, or both.
   *
   * @param ids List of Entitlement ids
   *
   * @returns A list of entitlements
   */
  getDropEntitlementsByIds(
    ids: string[]
  ): Promise<HelixPaginatedResponseIterator<Entitlement>>;

  /**
   * Updates the Drop entitlement’s fulfillment status.
   *
   * @param ids A list of IDs that identify the entitlements to update. You may specify a maximum of 100 IDs.
   * @param fulfillmentStatus he fulfillment status to set the entitlements to.
   *
   * @returns A list that indicates which entitlements were successfully updated and those that weren’t.
   */
  updateEntitlements(
    ids: string[],
    fulfillmentStatus: FulfillmentStatus
  ): Promise<EntitlementStaus[]>;
}

export class EntitlementsApi implements EntitlementsApiEndpoints {
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

    return res.data[0];
  }

  async getDropEntitlementsByIds(ids: string[]) {
    const config: RequestConfig = {
      url: "entitlements/drops",
      method: "GET",
      query: { id: ids },
      oauth: false,
    };

    const res = await this._client.enqueueCall<
      HelixPaginatedResponse<Entitlement>
    >(config);

    return new HelixPaginatedResponseIterator(res, this._client, config);
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
