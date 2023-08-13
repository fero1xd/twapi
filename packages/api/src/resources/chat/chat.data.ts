import { HelixResponse } from "../../internal/interfaces";
import { Prettify, UserInfo } from "../../internal/types";
import { Image } from "../common.data";

export interface ChannelEmote {
  id: string;
  name: string;
  images: Image;
  tier: string;
  emote_type: "bitstier" | "follower" | "subscriptions";
  emote_set_id: string;
  format: ["static"] | ["static", "animated"];
  scale: ["1.0"] | ["1.0", "2.0"] | ["1.0", "2.0", "3.0"];
  theme_mode: ["light"] | ["light", "dark"] | ["dark"];
}

export interface GlobalEmote
  extends Exclude<ChannelEmote, "tier" | "emote_type" | "emote_set_id"> {}

export interface EmoteSet extends Exclude<ChannelEmote, "tier"> {
  owner_id: string;
}

export interface HelixResponseWithTemplate<T> extends HelixResponse<T> {
  template: string;
}

type ChatBadgeURL = {
  [K in `image_url_${"1" | "2" | "4"}x`]: string;
};

export interface ChatBadge {
  set_id: string;
  versions: Prettify<
    ChatBadgeURL & {
      id: string;
      title: string;
      description: string;
      click_action: string | null;
      click_url: string | null;
    }
  >[];
}

export interface ChatSettings {
  broadcaster_id: string;
  emote_mode: boolean;
  follower_mode: boolean;
  follower_mode_duration: number | null;
  moderator_id: string;

  non_moderator_chat_delay?: boolean;
  non_moderator_chat_delay_duration?: number | null;
  slow_mode: boolean;
  slow_mode_wait_time: number | null;
  subscriber_mode: boolean;
  unique_chat_mode: boolean;
}

export interface UpdateChatSettingsBody
  extends Partial<Exclude<ChatSettings, "broadcaster_id" | "moderator_id">> {}

export interface ChatAnnouncementBody {
  message: string;
  color?: "blue" | "green" | "orange" | "purple" | "primary";
}

export type ChatColor =
  | "blue"
  | "blue_violet"
  | "cadet_blue"
  | "chocolate"
  | "coral"
  | "dodger_blue"
  | "firebrick"
  | "golden_rod"
  | "green"
  | "hot_pink"
  | "orange_red"
  | "red"
  | "sea_green"
  | "spring_green"
  | "yellow_green"
  | `#${string}`;

export interface UserColor extends UserInfo {
  color: string;
}
