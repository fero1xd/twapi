import { UserInfo } from "../../internal/types";

export interface PublishedVideo extends UserInfo {
  id: string;
  stream_id: string;
  title: string;
  description: string;
  created_at: string;
  published_at: string;
  url: string;
  thumbnail_url: string;
  viewable: string;
  view_count: number;
  language: string;
  type: "archive" | "highlight" | "upload";
  duration: string;
  muted_segments: {
    duration: number;
    offset: number;
  }[];
}

export interface GetVideosQuery {
  id: string | string[];
  user_id: string;
  game_id: string;
  language?: string;

  period?: "all" | "day" | "month" | "week";
  sort?: "time" | "trending" | "views";
  type?: "all" | "archive" | "highlight" | "upload";
}
