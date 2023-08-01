import { Prettify, UserInfo } from "../../internal/types";

declare const brand: unique symbol;

export type StreamKey = string & {
  [brand]: "stream_key";
};

export interface GetStreamKeyResponse {
  stream_key: StreamKey;
}

export interface GetStreamsQuery extends Omit<UserInfo, "user_name"> {
  game_id?: string;
  type?: "all" | "live";
  language?: string;
}

export interface Stream extends UserInfo {
  id: string;
  game_id: string;
  game_name: string;
  type: "live" | "";
  title: string;
  tags: string[];
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;

  /**
   * @depracted Use `tags` instead
   */
  tag_ids: string[];
  is_mature: boolean;
}

export interface StreamMarker {
  id: string;
  created_at: string;
  position_seconds: number;
  description: string;
}

export interface GetStreamMarkersResponse extends UserInfo {
  videos: {
    video_id: string;
    markers: Prettify<
      StreamMarker & {
        url: string;
      }
    >[];
  }[];
}
