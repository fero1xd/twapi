export interface Entitlement {
  id: string;
  benefit_id: string;
  timestamp: string;
  user_id: string;
  game_id: string;

  fulfillment_status: FulfillmentStatus;
  last_updated: string;
}

export type FulfillmentStatus = "CLAIMED" | "FULLFILLED";

export interface GetEntitlementQuery {
  user_id: string;
  game_id: string;
  fulfillment_status: FulfillmentStatus;
}

export interface EntitlementStaus {
  status:
    | "INVALID_ID"
    | "NOT_FOUND"
    | "SUCCESS"
    | "UNAUTHORIZED"
    | "UPDATE_FAILED";
  ids: string[];
}
