import { Prettify } from "../../internal/types";

export interface BasicUser {
  id: string;
  login: string;
  display_name: string;
}

export interface User extends BasicUser {
  type: HelixUserType;
  broadcaster_type: HelixBroadcasterType;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  email?: string;
  created_at: string;
}

type HelixUserType = "admin" | "global_mod" | "staff" | "";
type HelixBroadcasterType = "affiliate" | "partner" | "";

export interface BlockUserQuery {
  target_user_id: string;
  source_context?: "chat" | "whisper";
  reason?: "harassment" | "spam" | "other";
}

export interface Extension {
  id: string;
  version: string;
  name: string;
  can_activate: boolean;
  type: "component" | "mobile" | "overlay" | "panel"[];
}

interface BaseExtensionSlotData {
  id: string;
  version: string;
  name: string;
}

interface InstalledExtensionData extends BaseExtensionSlotData {
  active: true;
}

interface EmptySlotData {
  active: false;
}

type ExtensionSlotData = InstalledExtensionData | EmptySlotData;

export interface ActiveExtension {
  panel: Record<"1" | "2" | "3", ExtensionSlotData>;
  overlay: Record<"1", ExtensionSlotData>;
  component: Record<
    "1" | "2",
    Prettify<ExtensionSlotData & { x: number; y: number }>
  >;
}

export interface UpdateExtensionBody {
  panel?: Partial<Record<"1" | "2" | "3", ExtensionSlotData>>;

  overlay?: Partial<Record<"1", ExtensionSlotData>>;

  component?: Partial<
    Record<"1" | "2", Prettify<ExtensionSlotData & { x: number; y: number }>>
  >;
}
