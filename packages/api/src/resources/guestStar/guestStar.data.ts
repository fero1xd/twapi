export interface GuestStarSettings {
  is_moderator_send_live_enabled: boolean;
  slot_count: number;
  is_browser_source_audio_enabled: boolean;
  group_layout: "TILED_LAYOUT" | "SCREENSHARE_LAYOUT";
  browser_source_token: string;
}

export interface UpdateGuestStarSettingsBody
  extends Partial<GuestStarSettings> {}

interface AudioVideoSettings {
  is_available: boolean;
  is_host_enabled: boolean;
  is_guest_enabled: boolean;
}

interface SessionGuest {
  slot_id: string;
  user_id: string;
  user_display_name: string;
  user_login: string;
  is_live: boolean;
  volume: number;
  assigned_at: string;
  audio_settings: AudioVideoSettings;
  video_settings: AudioVideoSettings;
}

export interface SessionDetail {
  id: string;

  guests: SessionGuest[];
}

export interface Invite {
  user_id: string;
  invited_at: string;
  status: "INVITED" | "ACCEPTED" | "READY";
  is_video_enabled: boolean;
  is_audio_enabled: boolean;
  is_video_available: boolean;
  is_audio_available: boolean;
}

export interface GetGuestStarInvitesQuery {
  broadcaster_id: string;
  moderator_id: string;
  session_id: string;
}

export interface SendInviteQuery extends GetGuestStarInvitesQuery {
  guest_id: string;
}

export interface DeleteInviteQuery extends SendInviteQuery {}

export interface AssignGuestStarSlotQuery extends SendInviteQuery {
  slot_id: string;
}

export interface DeleteGuestStarSlotQuery extends AssignGuestStarSlotQuery {
  should_reinvite_guest?: string;
}

export interface UpdateGuestStarSlotQuery extends GetGuestStarInvitesQuery {
  source_slot_id: string;
  destination_slot_id?: string;
}

export interface UpdateGuestStarSlotSettingsQuery
  extends GetGuestStarInvitesQuery {
  slot_id: string;
  is_audio_enabled?: boolean;
  is_video_enabled?: boolean;
  is_live?: boolean;
  volume?: number;
}
