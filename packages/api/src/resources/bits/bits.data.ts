import { HelixResponse } from "../../internal/interfaces";
import { Prettify, UserInfo } from "../../internal/types";

export type TimePeriod = "day" | "week" | "month" | "year" | "all";

export type LeaderboardLeader = Prettify<
  UserInfo & {
    rank: number;
    score: number;
  }
>;

export interface HelixBitsLeaderboardResponse
  extends HelixResponse<LeaderboardLeader> {
  date_range: {
    started_at: string;
    ended_at: string;
  };
  total: number;
}

export interface GetBitsLeaderboardQuery {
  count?: number;
  period?: TimePeriod;
  started_at?: string;
  user_id?: string;
}

type ImageSizes = "1" | "1.5" | "2" | "3" | "4";

interface Tier {
  min_bits: number;
  id: 1 | 100 | 500 | 1000 | 5000 | 10000 | 100000;
  color: string;
  images: {
    dark: {
      animated: Record<ImageSizes, string>;
      static: Record<ImageSizes, string>;
    };
    light: {
      animated: Record<ImageSizes, string>;
      static: Record<ImageSizes, string>;
    };
  };
  can_cheer: boolean;
  show_in_bits_card: boolean;
}

export interface Cheermotes {
  prefix: string;
  tiers: Tier[];
  type:
    | "global_first_party"
    | "global_third_party"
    | "channel_custom"
    | "display_only"
    | "sponsored";
  order: number;
  last_updated: string;
  is_charitable: boolean;
}
