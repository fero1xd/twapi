import { BroadcasterInfo, Prettify, UserInfo } from "../../internal/types";

export type ChannelInformation = Prettify<
  BroadcasterInfo & {
    game_id: string;
    game_name: string;
    broadcaster_language: string;
    title: string;
    delay: number;
    tags: string[];
    content_classification_labels: string[];
    is_branded_content: boolean;
  }
>;

export interface ChannelEditor {
  user_id: string;
  user_name: string;
  created_at: string;
}

export type ChannelFollower = Prettify<
  UserInfo & {
    followed_at: string;
  }
>;

export interface CommericalStatus {
  length: number;
  message: string;
  retry_after: number;
}

export type FollowedChannel = Prettify<
  BroadcasterInfo & {
    followed_at: string;
  }
>;

interface Label {
  id: string;
  is_enabled: string;
}

export interface ChannelUpdateData {
  broadcaster_language?: string;

  game_id?: string;

  title?: string;

  delay?: number;

  tags?: string[];

  is_branded_content?: boolean;

  content_classification_labels?: Label[];
}
