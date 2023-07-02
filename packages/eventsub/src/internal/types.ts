import { createSubscription } from "./api";

export type Subscription = string;

export type WebsocketMessage = {
  metadata: {
    message_id: string;
    message_type: MessageType;
    message_timestamp: string;
  };
  payload: {
    session?: {
      id: string;
      status: string;
      keepalive_timeout_seconds: number;
      reconnectUrl: string | null;
      connected_at: string;
    };
  };
};

export const availableSubscriptions = [
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

export const internalMessage = [
  "session_welcome",
  "session_keepalive",
  "session_reconnect",
] as const;

export type MessageType = InternalMessage | "revocation" | "notification";

export type InternalMessage = (typeof internalMessage)[number];

export type ValidSubscription = (typeof availableSubscriptions)[number];

// -------------- API ----------------

type SubWithoutBroadcasterId =
  | "channel.raid"
  | "drop.entitlement.grant"
  | "extension.bits_transaction.create"
  | "user.authorization.grant"
  | "user.authorization.revoke"
  | "user.update";

type GeneralCondition<T extends ValidSubscription> = {
  [K in T as T extends SubWithoutBroadcasterId
    ? never
    : "broadcaster_user_id"]: string;
};

export type Condition<T extends ValidSubscription> = {
  condition: GeneralCondition<T> extends Record<string, never>
    ? Record<string, never>
    : GeneralCondition<T>;
};

export interface CreateSubscriptionRequest<T extends ValidSubscription> {
  type: T;
  version: string;

  condition: Condition<T>["condition"];

  transport: {
    method: "websocket";
    session_id: string;
  };
}
