import { BroadcasterInfo, UserInfo } from "../../internal/types";
import { HelixPaginatedResponseWithTotal } from "../common.data";

export interface Subscriber extends BroadcasterInfo, UserInfo, GifterInfo {
  tier: "1000" | "2000" | "3000";
  is_gift: boolean;
  plan_name: string;
}

export interface HelixPaginatedSubscriptionResponse<T>
  extends HelixPaginatedResponseWithTotal<T> {
  points: number;
}

interface GifterInfo {
  gifter_id: string;
  gifter_login: string;
  gifter_name: string;
}

export interface UserSubscription extends BroadcasterInfo, GifterInfo {
  tier: "1000" | "2000" | "3000";
  is_gift: boolean;
}
