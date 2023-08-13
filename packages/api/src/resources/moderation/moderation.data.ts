import { BroadcasterInfo, UserInfo } from "../../internal/types";

export interface CheckAutoModStatusBody {
  msg_id: string;
  msg_text: string;
}

export interface MessageApproval {
  msg_id: string;
  is_permitted: boolean;
}

export interface ManageAutomodMessageBody {
  msg_id: string;
  action: "ALLOW" | "DENY";
}

export interface ModerationSettings {
  overall_level: number;
  disability: number;
  aggression: number;
  sexuality_sex_or_gender: number;
  misogyny: number;
  bullying: number;
  swearing: number;
  race_ethnicity_or_religion: number;
  sex_based_terms: number;
}

export interface AutomodSettings extends ModerationSettings {
  broadcaster_id: string;
  moderator_id: string;
}

export interface BroadcasterModeratorQuery {
  broadcaster_id: string;
  moderator_id: string;
}

export interface BannedUser extends UserInfo, BroadcasterInfo {
  expires_at: string;
  created_at: string;
  reason: string;
}

export interface BanUserBody {
  user_id: string;
  duration?: number;
  reason?: string;
}

export interface BanUserResponse extends BroadcasterModeratorQuery {
  user_id: string;
  created_at: string;
  end_time: string;
}

export interface UnbanUserQuery extends BroadcasterModeratorQuery {
  user_id: string;
}

export interface BlockedTerm extends BroadcasterModeratorQuery {
  id: string;
  text: string;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
}

export interface RemoveBlockedTermQuery {
  broadcaster_id: string;
  id: string;
}

export interface DeleteChatMessageQuery {
  broadcaster_id: string;
  message_id: string;
}

export interface Moderator extends UserInfo {}

export interface Vip extends UserInfo {}

export interface ShieldModeStatus extends BroadcasterInfo {
  last_activated_at: string;
  is_active: boolean;
}
