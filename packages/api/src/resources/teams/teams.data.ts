import { BroadcasterInfo, UserInfo } from "../../internal/types";

export interface Team extends BroadcasterInfo {
  background_image_url: string;
  banner: string;
  created_at: string;
  updated_at: string;
  info: string;
  thumbnail_url: string;
  team_name: string;
  team_display_name: string;
  id: string;
}

export interface GetTeamsResponse extends Team {
  users: UserInfo[];
}
