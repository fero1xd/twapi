import { BroadcasterInfo } from "../../internal/types";

export interface Goal extends BroadcasterInfo {
  id: string;
  type:
    | "follower"
    | "subscription"
    | "subscription_count"
    | "new_subscription"
    | "new_subscription_count";
  description: string;
  current_amount: number;
  target_amount: number;
  created_at: string;
}
