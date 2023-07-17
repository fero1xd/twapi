import { topics } from "./constants";

export enum MessageType {
  PING = "PING",
  PONG = "PONG",
  LISTEN = "LISTEN",
  AUTH_REVOKED = "AUTH_REVOKED",
  RECONNECT = "RECONNECT",
  RESPONSE = "RESPONSE",
  MESSAGE = "MESSAGE",
  UNLISTEN = "UNLISTEN",
}

export type ResponseListener = {
  handler: (message: WebsocketMessage) => void;
};

export type WebsocketMessage = {
  type: MessageType;
  nonce?: string;
  data?: {
    topic?: string;
    message?: any;
    topics?: string[];
    auth_token?: string;
  };
  error?: ErrorMessage;
};

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Topics = (typeof topics)[number];

type StaticlyParsedTopics = "channelRedemption";
type ExcludedFields = "channel-points-channel-v1.<channel_id>";

export type ParsedTopics =
  | ParseTopic<GetBeforeDot<Exclude<Topics, ExcludedFields>>>
  | StaticlyParsedTopics;

export type ParseArgs<
  T extends string,
  TResult = {}
> = T extends `${string}<${infer P}>${infer X}`
  ? ParseArgs<
      X,
      Prettify<{ [K in keyof TResult]: number } & { [K in P]: number }>
    >
  : TResult;

export type GetBeforeDot<T extends string> =
  T extends `${infer First}.${string}` ? First : never;

export type ParseTopic<T extends string> =
  T extends `${infer A}-events-${string}`
    ? ParseTopic<A>
    : T extends `${infer A}${"-" | "_"}${infer B}${infer C}`
    ? `${A}${Capitalize<B>}${ParseTopic<C>}`
    : T;

export type ParsedMap = Prettify<
  {
    [K in Topics as K extends ExcludedFields
      ? never
      : ParseTopic<GetBeforeDot<K>>]: K;
  } & {
    channelRedemption: "channel-points-channel-v1.<channel_id>";
  }
>;

export type TriggerHandler<T extends Topics> = (data: TopicDataMap[T]) => void;

export type ErrorHandlerFn = (message: ErrorMessage) => void;

export type ErrorMessage =
  | "ERR_BADMESSAGE"
  | "ERR_BADAUTH"
  | "ERR_SERVER"
  | "ERR_BADTOPIC";

export type ListenerWrap<T extends Topics> = {
  onTrigger: (handler: TriggerHandler<T>) => void;
  onError: (handler: ErrorHandlerFn) => void;
  onRevocation: (handler: Fn) => void;
  onTimeout: (handler: Fn) => void;
  unsubscribe: () => void;
};

export type Fn = () => void;

// ------- Event Payloads ---------
export type TopicDataMap = Prettify<
  WhisperEvent &
    UserModerationNotification &
    AutoModQueueMessage &
    ChannelSubscriptionMessage &
    LowTrustUserMessage &
    BitsEventMessage &
    ModeratorAction &
    BitsBadgeUnlockMessage &
    RedemptionMessage
>;

type Emote = {
  start: number;
  end: number;
  id: number;
};

type Badge = {
  id: string;
  version: string;
};

type WhisperEvent = {
  [K in ParsedMap["whispers"]]: {
    type: "whisper_sent" | "whisper_received";
    data: string;
    data_object: {
      message_id: string;
      id: number;
      thread_id: string;
      body: string;
      sent_ts: number;
      from_id: number;
      tags: {
        login: string;
        display_name: string;
        color: string;
        emotes: Emote[];
        badges: Badge[];
      };
      recipient: {
        id: number;
        username: string;
        display_name: string;
        color: string;
        badges: Badge[];
      };
      nonce: string;
    };
  };
};

type UserModerationNotification = {
  [K in ParsedMap["userModerationNotifications"]]: {
    type: "automod_caught_message";
    data: {
      message_id: string;
      status: "DENIED" | "PENDING" | "ALLOWED" | "EXPIRED";
    };
  };
};

type AutoModQueueMessage = {
  [K in ParsedMap["automodQueue"]]: {
    type: "automod_caught_message";
    data: {
      message: {
        id: string;
        content: {
          text: string;
          fragments: {
            text: string;
            automod?: {
              topics: Record<string, number>;
            };
          }[];
        };

        sender: {
          user_id: string;
          login: string;
          display_name: string;
          chat_color?: string;
        };
        sent_at: string;
      };
      content_classification: {
        category: string;
        level: number;
      };
      status: "PENDING" | "ALLOWED" | "DENIED" | "EXPIRED";
      reason_code: string;
      resolver_id: string;
      resolver_login: string;
    };
  };
};

type PubSubSubscriptionDetail = {
  context: "sub" | "resub";
  cumulative_months: number;
  streak_months: number;
};

type PubSubSubscriptionGiftDetail = {
  context: "subgift" | "anonsubgift" | "resubgift" | "anonresubgift";
  recipient_id: string;
  recipient_user_name: string;
  recipient_display_name: string;
  months: number;
};

type ChannelSubscriptionMessage = {
  [K in ParsedMap["channelSubscribe"]]: Prettify<
    {
      channel_id: string;
      channel_name: string;
      user_id: string;
      user_name: string;
      display_name: string;
      sub_message: {
        message: string;
        emotes: Emote[] | null;
      };
      is_gift: boolean;
      time: string;
      sub_plan: "Prime" | "1000" | "2000" | "3000";
      sub_plan_name: string;
    } & (PubSubSubscriptionDetail | PubSubSubscriptionGiftDetail)
  >;
};

type LowTrustUserMessage = {
  [K in ParsedMap["lowTrustUsers"]]:
    | LowTrustUserChatMessage
    | LowTrustUserTreatmentMessage;
};

type LowTrustUserCommon = {
  low_trust_id: string;
  channel_id: string;
  updated_by: {
    id: string;
    login: string;
    display_name: string;
  };
  updated_at: string;
  treatment: "NO_TREATMENT" | "ACTIVE_MONITORING" | "RESTRICTED";
  types:
    | "UNKNOWN_TYPE"
    | "MANUALLY_ADDED"
    | "DETECTED_BAN_EVADER"
    | "BANNED_IN_SHARED_CHANNEL"[];
  ban_evasion_evaluation:
    | "UNKNOWN_EVADER"
    | "UNLIKELY_EVADER"
    | "LIKELY_EVADER"
    | "POSSIBLE_EVADER"
    | "";
  evaluated_at: string;
};

type LowTrustUserTreatmentMessage = {
  type: "low_trust_user_treatment_update";
  data: Prettify<
    LowTrustUserCommon & {
      target_user: string;
      target_user_id: string;
    }
  >;
};

type LowTrustUserChatMessage = {
  type: "low_trust_user_new_message";
  data: {
    low_trust_user: Prettify<
      LowTrustUserCommon & {
        id: string;
        sender: {
          user_id: string;
          login: string;
          display_name: string;
        };
        shared_ban_channel_ids: string[] | null;
      }
    >;

    message_content: {
      text: string;
      fragments: {
        text: string;
        emoticon?: {
          emoticonID: string;
          emoticonSetID: string;
        };
      }[];
    };

    message_id: string;
    sent_at: string;
  };
};

type BitsEventMessage = {
  [K in ParsedMap["channelBits"]]: {
    data: {
      badge_entitlement: {
        previous_version: number;
        new_version: number;
      } | null;

      bits_used: number;
      total_bits_used: number;

      channel_id: number;
      chat_message: string;
      context: "cheer";
      time: string;

      user_id?: string;
      user_name?: string;
    };
    version: string;
    message_type: string;
    message_id: string;
  };
};

type BitsBadgeUnlockMessage = {
  [K in ParsedMap["channelBitsBadgeUnlocks"]]: {
    data: {
      chat_message: string;
      badge_tier: number;

      user_id: string;
      user_name: string;
      channel_id: string;
      channel_name: string;
      time: string;
    };
    version: string;
    message_type: string;
    message_id: string;
  };
};

// Mod actions

type RoleChangeAction = {
  type: "moderator_added" | "moderator_removed" | "vip_added" | "vip_removed";
  data: {
    channel_id: string;
    target_user_id: string;
    target_user_login: string;
    created_by_user_id: string;
    created_by: string;
  };
};

type ChatModerationAction = {
  type: "moderation_action";
  data: {
    type: string;
    moderation_action: string;
    args: string[] | null;
    created_by: string;
    created_by_user_id: string;
  };
};

type ChannelTermsAction = {
  type: "channel_terms_action";
  data: {
    type: string;
    id: string;
    text: string;
    requester_id: string;
    requester_login: string;
    expires_at: string;
    updated_at: string;
    from_automod: boolean;
  };
};

type UnbanRequestData = {
  moderation_action: "APPROVE_UNBAN_REQUEST" | "DENY_UNBAN_REQUEST";
  created_by_id: string;
  created_by_login: string;
  moderator_message: string;
  target_user_id: string;
  target_user_login: string;
};

type UnbanRequestApprove = {
  type: "approve_unban_request";
  data: UnbanRequestData;
};

type UnbanRequestDeny = {
  type: "deny_unban_request";
  data: UnbanRequestData;
};

type UnbanRequestAction = UnbanRequestApprove | UnbanRequestDeny;

type ModeratorAction = {
  [K in ParsedMap["chatModeratorActions"]]:
    | ChatModerationAction
    | RoleChangeAction
    | ChannelTermsAction
    | UnbanRequestAction;
};

// Mod actions

type Image = {
  url_1x: string;
  url_2x: string;
  url_4x: string;
};

type RedemptionMessage = {
  [K in ParsedMap["channelRedemption"]]: {
    type: "reward-redeemed";
    data: {
      timestamp: string;
      redemption: {
        id: string;

        user: {
          id: string;
          login: string;
          display_name: string;
        };
        channel_id: string;
        redeemed_at: string;
        reward: {
          id: string;
          channel_id: string;
          title: string;
          prompt: string;
          cost: number;
          is_user_input_required: boolean;
          is_sub_only: boolean;
          image: Image;
          default_image: Image;
          background_color: string;
          is_enabled: boolean;
          is_paused: boolean;
          is_in_stock: boolean;
          max_per_stream: {
            is_enabled: boolean;
            max_per_stream: number;
          };
          should_redemptions_skip_request_queue: boolean;
        };

        user_input: string;
        status: "FULFULLED" | "UNFULFILLED";
      };
    };
  };
};
