import { BroadcasterInfo } from "../../internal/types";

export interface PollChoice {
  id: string;
  title: string;
  votes: number;
  channel_points_votes: number;
  bits_voted: number;
}

export type PollStatus =
  | "ACTIVE"
  | "COMPLETED"
  | "TERMINATED"
  | "ARCHIVED"
  | "MODERATED"
  | "INVALID";

export interface Poll extends BroadcasterInfo {
  id: string;
  title: string;
  choices: PollChoice[];
  bits_voting_enabled: boolean;
  bits_per_vote: number;
  channel_points_voting_enabled: boolean;
  channel_points_per_vote: number;
  status: PollStatus;
  duration: string;
  started_at: string;
  ended_at: string;
}

export interface CreatePollBody {
  broadcaster_id: string;
  title: string;
  choices: { title: string }[];
  duration: string;
  channel_points_voting_enabled?: boolean;
  channel_points_per_vote?: number;
}

export interface EndPollBody {
  broadcaster_id: string;
  id: string;
  status: "TERMINATED" | "ARCHIVED";
}
