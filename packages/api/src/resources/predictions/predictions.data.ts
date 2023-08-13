import { BroadcasterInfo, UserInfo } from "../../internal/types";

export interface Predictors extends UserInfo {
  channel_points_used: number;
  channel_points_won: number;
}

export interface PossibleOutcome {
  id: string;
  title: string;
  users: number;
  channel_points: number;
  top_predictors: Predictors[] | null;
  color: "PINK" | "BLUE";
}

export interface ChannelPrediction extends BroadcasterInfo {
  id: string;
  title: string;
  winning_outcome_id: string | null;
  outcomes: PossibleOutcome[];
  prediction_window: number;
  status: "ACTIVE" | "CANCELLED" | "LOCKED" | "RESOLVED";
  created_at: string;
  ended_at: string | null;
  locked_at: string | null;
}

export interface CreatePredictionBody {
  title: string;
  outcomes: { title: string }[];
  prediction_window: number;
}

export interface EndPredictionBody {
  id: string;
  status: "RESOLVED" | "CANCELLED" | "LOCKED";
  winning_outcome_id?: string;
}
