import { BroadcasterInfo, UserInfo } from "../../internal/types";
import { Image } from "../common.data";

export interface CreateRewardBody {
  title: string;
  cost: number;
  prompt?: string;
  is_enabled?: boolean;
  background_color?: boolean;
  is_user_input_required?: boolean;
  is_max_per_stream_enabled?: boolean;
  is_max_per_user_per_stream_enabled?: boolean;
  is_global_cooldown_enabled?: boolean;
  should_redemptions_skip_request_queue?: boolean;

  global_cooldown_seconds?: number;
  max_per_user_per_stream?: number;
  max_per_stream?: number;
}

export interface RewardResponse extends BroadcasterInfo {
  id: string;
  title: string;
  prompt: string;
  cost: number;
  image: Image | null;
  default_image: Image;
  background_color: string;
  is_enabled: boolean;
  is_user_input_required: boolean;
  max_per_stream_setting: {
    is_enabled: boolean;
    max_per_stream: number;
  };
  max_per_user_per_stream_setting: {
    is_enabled: boolean;
    max_per_stream: number;
  };
  global_cooldown_setting: {
    is_enabled: boolean;
    global_cooldown_seconds: number;
  };
  is_paused: boolean;
  is_in_stock: boolean;
  should_redemptions_skip_request_queue: boolean;
  redemptions_redeemed_current_stream: number | null;
  cooldown_expires_at: string | null;
}

export interface UpdateRewardBody extends Partial<CreateRewardBody> {
  is_paused?: boolean;
}

export interface GetCustomRewardRedemptionQuery {
  reward_id: string;
  status: RewardStatus;
  id?: string | string[];
  sort?: "OLDEST" | "NEWEST";
}

type RewardStatus = "CANCELED" | "FULFILLED" | "UNFULFILLED";

export interface RewardRedemptionResponse extends BroadcasterInfo, UserInfo {
  id: string;
  user_input: string;
  status: RewardStatus;
  redeemed_at: string;
  reward: {
    id: string;
    title: string;
    prompt: string;
    cost: number;
  };
}

export interface UpdateRedemptionStatusQuery {
  id: string | string[];
  reward_id: string;
}
