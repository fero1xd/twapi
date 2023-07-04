import { availableSubscriptions, internalMessage } from "./constants";

export type WebsocketMessage<
  TEvent extends ValidSubscription = never,
  TSub extends boolean = false
> = {
  metadata: {
    message_id: string;
    message_type: MessageType;
    message_timestamp: string;

    subscription_type: TSub extends true ? ValidSubscription : undefined;
    subscription_version: TSub extends true ? string : undefined;
  };
  payload: {
    session?: {
      id: string;
      status: string;
      keepalive_timeout_seconds: number;
      reconnect_url: string | null;
      connected_at: string;
    };

    subscription: TSub extends true
      ? {
          id: string;
          type: ValidSubscription;
          version: string;
          status: string;
          cost: number;
          condition: Condition<TEvent> extends Record<string, never>
            ? any
            : Condition<TEvent>;
          transport: {
            method: "websocket";
            session_id: string;
          };
          created_at: string;
        }
      : undefined;
  };
};

export type MessageType = InternalMessage | "revocation" | "notification";

export type InternalMessage = (typeof internalMessage)[number];

export type ValidSubscription = (typeof availableSubscriptions)[number];

type Prettify<T> = { [K in keyof T]: T[K] } & {};

// -------------- API ----------------

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

type Key<T extends ValidSubscription> = T extends `user.${string}`
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

type GeneralCondition<T extends ValidSubscription> = T extends T
  ? {
      [K in T as Key<T>]: string;
    } & {
      [K in T as T extends SubWithoutBroadcasterId
        ? never
        : "broadcaster_user_id"]: string;
    }
  : never;

export type Condition<T extends ValidSubscription> =
  GeneralCondition<T> extends Record<string, never>
    ? Record<string, never>
    : Prettify<GeneralCondition<T>>;

export interface CreateSubscriptionRequest<T extends ValidSubscription> {
  type: T;
  version: string;

  condition: Condition<T>;

  transport: {
    method: "websocket";
    session_id: string;
  };
}

// ---------- LISTENERS --------------

export type ReplaceDots<T extends string> =
  T extends `${infer A}.${infer B}${infer C}`
    ? `${A}${Capitalize<B>}${ReplaceDots<C>}`
    : T;

export type IsEqual<T extends string, Q extends string> = T extends Q
  ? true
  : false;

export type ReplaceUnderScores<T extends string> =
  T extends `${infer A}.${infer B}_${infer C}${infer D}.${infer E}`
    ? `${A}.${IsEqual<A, B> extends true
        ? ""
        : B}${Capitalize<C>}${ReplaceUnderScores<D>}.${E}`
    : T extends `${infer A}_${infer B}${infer C}`
    ? `${A}${Capitalize<B>}${ReplaceUnderScores<C>}`
    : T;

export type EasyToUseMap = {
  [K in ValidSubscription as ReplaceDots<ReplaceUnderScores<K>>]: K;
};
