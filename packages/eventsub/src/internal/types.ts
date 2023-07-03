import { createSubscription } from "./api";
import { availableSubscriptions, internalMessage } from "./constants";

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

export type Condition<T extends ValidSubscription> =
  GeneralCondition<T> extends Record<string, never>
    ? Record<string, never>
    : GeneralCondition<T>;

export interface CreateSubscriptionRequest<T extends ValidSubscription> {
  type: T;
  version: string;

  condition: Condition<T>;

  transport: {
    method: "websocket";
    session_id: string;
  };
}
