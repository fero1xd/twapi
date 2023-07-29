import { Prettify } from "../../internal/types";
import { HelixPaginatedResponseWithTotal } from "../common.data";

const availableSubscriptions = [
  "channel.update",
  "channel.follow",
  "channel.subscribe",
  "channel.subscription.end",
  "channel.subscription.gift",
  "channel.subscription.message",
  "channel.cheer",
  "channel.raid",
  "channel.ban",
  "channel.unban",
  "channel.moderator.add",
  "channel.moderator.remove",

  "channel.guest_star_session.begin",
  "channel.guest_star_session.end",

  "channel.guest_star_guest.update",
  "channel.guest_star_slot.update",
  "channel.guest_star_settings.update",

  "channel.channel_points_custom_reward.add",

  "channel.channel_points_custom_reward.update",
  "channel.channel_points_custom_reward.remove",
  "channel.channel_points_custom_reward_redemption.add",
  "channel.channel_points_custom_reward_redemption.update",

  "channel.poll.begin",
  "channel.poll.progress",
  "channel.poll.end",
  "channel.prediction.begin",
  "channel.prediction.progress",
  "channel.prediction.lock",
  "channel.prediction.end",
  "channel.charity_campaign.donate",
  "channel.charity_campaign.start",
  "channel.charity_campaign.progress",
  "channel.charity_campaign.stop",
  "drop.entitlement.grant",
  "extension.bits_transaction.create",
  "channel.goal.begin",
  "channel.goal.progress",
  "channel.goal.end",
  "channel.hype_train.begin",
  "channel.hype_train.progress",
  "channel.hype_train.end",
  "channel.shield_mode.begin",
  "channel.shield_mode.end",
  "channel.shoutout.create",
  "channel.shoutout.receive",
  "stream.online",
  "stream.offline",
  "user.authorization.grant",
  "user.authorization.revoke",
  "user.update",
] as const;

export type Subscriptions = (typeof availableSubscriptions)[number];

export interface HelixPaginatedSubscriptionResponse<T>
  extends HelixPaginatedResponseWithTotal<T> {
  total_cost: number;
  max_total_cost: number;
}

export type EventSubTransportOption = "websocket" | "webhook";

export interface CreateEventSubSubscriptionBody<T extends Subscriptions> {
  type: T;
  version: string;
  condition: Condition<T>;
  transport: WebhookTransport | WebsocketTransport;
}

interface WebhookTransport {
  method: "webhook";
  callback: string;
  secret: string;
}

interface WebsocketTransport {
  method: "websocket";
  session_id: string;
}

export type SubscriptionStatus =
  | "enabled"
  | "webhook_callback_verification_pending"
  | "webhook_callback_verification_failed"
  | "notification_failures_exceeded"
  | "authorization_revoked"
  | "moderator_removed"
  | "user_removed"
  | "version_removed"
  | "websocket_disconnected"
  | "websocket_failed_ping_pong"
  | "websocket_received_inbound_traffic"
  | "websocket_connection_unused"
  | "websocket_internal_error"
  | "websocket_network_timeout"
  | "websocket_network_error";

export interface Subscription<T extends Subscriptions = any> {
  id: string;
  status: SubscriptionStatus;
  type: T extends any ? string : T;
  version: string;
  condition: T extends any ? Record<string, any> : Condition<T>;
  created_at: string;
  transport: {
    method: "websocket" | "webhook";
    callback?: string;
    session_id?: string;
    connected_at?: string;
  };
  cost: number;
}

type SubWithoutBroadcasterId =
  | "channel.raid"
  | "drop.entitlement.grant"
  | "extension.bits_transaction.create"
  | "user.authorization.grant"
  | "user.authorization.revoke"
  | "user.update";

type DropEntitlementGrantCondition =
  | "organization_id"
  | "category_id"
  | "campaign_id";

type Key<T extends Subscriptions> = T extends `user.${string}`
  ? "client_id"
  : T extends "channel.raid"
  ? "from_broadcaster_user_id" | "to_broadcaster_user_id"
  : T extends "channel.follow" | `channel.guest_star_${string}.update`
  ? "moderator_id"
  : T extends
      | `channel.channel_points_custom_reward_redemption.${string}`
      | `channel.channel_points_custom_reward.${"update" | "remove"}`
  ? "reward_id"
  : T extends "drop.entitlement.grant"
  ? DropEntitlementGrantCondition
  : T extends `extension.${string}`
  ? "extension_client_id"
  : never;

type GeneralCondition<T extends Subscriptions> = T extends T
  ? {
      [K in T as Key<T>]: string;
    } & {
      [K in T as T extends SubWithoutBroadcasterId
        ? never
        : "broadcaster_user_id"]: string;
    }
  : never;

export type Condition<T extends Subscriptions> = Prettify<GeneralCondition<T>>;
