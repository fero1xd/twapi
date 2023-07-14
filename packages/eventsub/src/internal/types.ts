import { availableSubscriptions, internalMessage } from "./constants";

export type WebsocketMessage<
  TEvent extends ValidSubscription = never,
  TSub extends boolean = false
> = {
  metadata: {
    message_id: string;
    message_type: MessageType;
    message_timestamp: string;

    subscription_type: TSub extends true
      ? [TEvent] extends [never]
        ? ValidSubscription
        : TEvent
      : never;
    subscription_version: TSub extends true ? string : never;
  };
  payload: {
    session?: TSub extends true
      ? undefined
      : {
          id: string;
          status: string;
          keepalive_timeout_seconds: number;
          reconnect_url: string | null;
          connected_at: string;
        };

    subscription: TSub extends true
      ? {
          id: string;
          type: [TEvent] extends [never] ? ValidSubscription : TEvent;
          version: string;
          status: string;
          cost: number;
          condition: Condition<TEvent> extends EmptyObject
            ? any
            : Condition<TEvent>;
          transport: {
            method: "websocket";
            session_id: string;
          };
          created_at: string;
        }
      : never;

    event: TSub extends true
      ? [TEvent] extends [never]
        ? any
        : EventDataMap[TEvent]
      : never;
  };
};

export type EmptyObject = Record<string, never>;

export type MessageType = InternalMessage | "revocation" | "notification";

export type InternalMessage = (typeof internalMessage)[number];

export type ValidSubscription = (typeof availableSubscriptions)[number];

type Prettify<T> = { [K in keyof T]: T[K] } & {};

export type RevocationReason =
  | "user_removed"
  | "authorization_revoked"
  | "version_removed";

// -------------- API ----------------
export type CreateSubResponse = {
  data: {
    id: string;
  }[];
};

export type GetSubscriptionsResponse = {
  data: {
    id: string;
    type: ValidSubscription;
    version: string;
    condition: any;
  }[];
};

export type BadResponse = {
  error: string;
  status: number;
  message: string;
};

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

export type Condition<T extends ValidSubscription> = Prettify<
  GeneralCondition<T>
>;

export interface CreateSubscriptionRequest<T extends ValidSubscription> {
  type: T;
  version: string;

  condition: Condition<T>;

  transport: {
    method: "websocket";
    session_id: string;
  };
}

type Without<T, K extends keyof T> = {
  [L in Exclude<keyof T, K>]: T[L];
};

// ---------- LISTENERS --------------
export type ConnectedListener = (sessionId: string) => void;

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

// --------- Events ------------

type Tier = {
  tier: "1000" | "2000" | "3000";
};

type Anonymous = {
  is_anonymous: boolean;
};

type SessionInfo = {
  started_at: string;
  session_id: string;
};

type GuestInfo = {
  [K in `guest_user_${"id" | "login" | "name"}`]: string;
};

type BroadcasterInfo = {
  [K in `broadcaster_user_${"id" | "login" | "name"}`]: string;
};

type ModeratorInfo = {
  [K in `moderator_user_${"id" | "login" | "name"}`]: string;
};

type UserInfo = {
  [K in `user_${"id" | "login" | "name"}`]: string;
};

type UserAndBroadcasterInfo = Prettify<UserInfo & BroadcasterInfo>;

type Category = {
  category_id: string;
  category_name: string;
};

export type EventDataMap = Prettify<
  ChannelUpdateEvent &
    ChannelFollowEvent &
    ChannelSubEvent &
    ChannelSubEndEvent &
    ChannelSubGiftEvent &
    ChannelSubMessageEvent &
    ChannelCheerEvent &
    ChannelRaidEvent &
    ChannelBanEvent &
    ChannelUnBanEvent &
    ChannelModEvent &
    ChannelGuestStarSessionBegin &
    ChannelGuestStarSessionEnd &
    ChannelGuestStarGuestUpdate &
    ChannelGuestStarSlotUpdate &
    ChannelGuestStarSettingsUpdate &
    ChannelPointsCustomRewardAdd &
    ChannelPointsCustomRewardUpdate &
    ChannelPointsCustomRewardRemove &
    ChannelPointsCustomRewardRedemptionAdd &
    ChannelPointsCustomRewardRedemptionUpdate &
    ChannelPollBeginAndProgressEvent &
    ChannelPollEndEvent &
    ChannelPredBeginAndProgressAndLockEvent &
    ChannelPredEndEvent &
    CharityDonationEvent &
    CharityCampaignStartEvent &
    CharityCampaignProgressEvent &
    CharityCampaignStopEvent &
    DropEntitlementGrantEvent &
    ExtensionBitsTransitionCreate &
    GoalsBeginAndProgressEvent &
    GoalsEndEvent &
    HypeTrainBeginAndProgressEvent &
    HypeTrainEndEvent &
    StreamOfflineEvent &
    StreamOnlineEvent &
    UserAuthGrantEvent &
    UserAuthRevokeEvent &
    UserUpdateEvent &
    ShieldModeBeginEvent &
    ShieldModeEndEvent &
    ShoutoutCreateEvent &
    ShoutoutReceiveEvent
>;

type ChannelBanEvent = {
  "channel.ban": Prettify<
    UserAndBroadcasterInfo &
      ModeratorInfo & {
        reason: string;
        banned_at: string;
        ends_at: string;
        is_permanent: boolean;
      }
  >;
};

type ChannelSubEvent = {
  "channel.subscribe": Prettify<
    UserAndBroadcasterInfo &
      Tier & {
        is_gift: boolean;
      }
  >;
};

type ChannelCheerEvent = {
  "channel.cheer": Prettify<
    UserAndBroadcasterInfo &
      Anonymous & {
        message: string;
        bits: number;
      }
  >;
};

type ChannelUpdateEvent = {
  "channel.update": Prettify<
    BroadcasterInfo &
      Category & {
        title: string;
        language: string;
        content_classification_labels: string[];
      }
  >;
};

type ChannelUnBanEvent = {
  "channel.unban": Prettify<UserAndBroadcasterInfo & ModeratorInfo>;
};

type ChannelFollowEvent = {
  "channel.follow": Prettify<UserAndBroadcasterInfo & { followed_at: string }>;
};

type ChannelRaidEvent = {
  "channel.raid": Prettify<
    {
      [K in keyof BroadcasterInfo as `${
        | "from"
        | "to"}_${K}`]: BroadcasterInfo[K];
    } & { viewers: number }
  >;
};

type ChannelModEvent = {
  [K in `channel.moderator.${"add" | "remove"}`]: UserAndBroadcasterInfo;
};

type ChannelGuestStarSessionBegin = {
  "channel.guest_star_session.begin": Prettify<BroadcasterInfo & SessionInfo>;
};
type ChannelGuestStarSessionEnd = {
  "channel.guest_star_session.end": Prettify<
    BroadcasterInfo & SessionInfo & { ended_at: string }
  >;
};

type ChannelGuestStarGuestUpdate = {
  "channel.guest_star_guest.update": Prettify<
    BroadcasterInfo &
      ModeratorInfo &
      GuestInfo & {
        session_id: string;
        slot_id: string;
        state: "invited" | "ready" | "backstage" | "live" | "removed";
      }
  >;
};

type ChannelGuestStarSlotUpdate = {
  "channel.guest_star_slot.update": Prettify<
    Without<
      ChannelGuestStarGuestUpdate["channel.guest_star_guest.update"],
      "state"
    > & {
      host_video_enabled: boolean;
      host_audio_enabled: boolean;
      host_volume: number;
    }
  >;
};

type ChannelGuestStarSettingsUpdate = {
  "channel.guest_star_settings.update": Prettify<
    BroadcasterInfo & {
      is_moderator_send_live_enabled: boolean;
      is_browser_source_audio_enabled: boolean;
      slot_count: number;
      group_layout: "tiled" | "screenshare";
    }
  >;
};

type Choice = {
  id: string;
  title: string;
  bits_votes: number;
  channel_points_votes: number;
  votes: number;
};

type ChannelPointsVoting = {
  is_enabled: boolean;
  amount_per_vote: number;
};

type ChannelPollBeginAndProgressEvent = {
  [K in `channel.poll.${"begin" | "progress"}`]: Prettify<
    BroadcasterInfo & {
      title: string;
      choices: Choice[];
      channel_points_voting: ChannelPointsVoting;
      started_at: string;
      ends_at: string;
    }
  >;
};

type ChannelPollEndEvent = {
  "channel.poll.end": ChannelPollBeginAndProgressEvent["channel.poll.begin"] & {
    status: "terminated" | "completed" | "archived";
  };
};

type MaxPerStream = {
  is_enabled: boolean;
  value: number;
};

type GlobalCooldown = {
  is_enabled: boolean;
  seconds: number;
};

type Image = {
  [K in `url_${"1" | "2" | "4"}x`]: string;
};

type ChannelPointsCustomRewardAdd = {
  "channel.channel_points_custom_reward.add": Prettify<
    {
      id: string;
      title: string;
      cost: number;
      prompt: string;
      should_redemptions_skip_request_queue: boolean;
      max_per_stream: MaxPerStream;
      max_per_user_per_stream: MaxPerStream;
      background_color: `#${string}`;
      image: Image | null;
      default_image: Image;
      global_cooldown: GlobalCooldown;
      cooldown_expires_at: string | null;
      redemptions_redeemed_current_stream: number | null;
    } & BroadcasterInfo & {
        [K in `is_${
          | "enabled"
          | "paused"
          | "in_stock"
          | "user_input_required"}`]: boolean;
      }
  >;
};

type ChannelPointsCustomRewardUpdate = {
  "channel.channel_points_custom_reward.update": ChannelPointsCustomRewardAdd["channel.channel_points_custom_reward.add"];
};

type ChannelPointsCustomRewardRemove = {
  "channel.channel_points_custom_reward.remove": ChannelPointsCustomRewardAdd["channel.channel_points_custom_reward.add"];
};

type Reward = {
  id: string;
  title: string;
  cost: number;
  prompt: string;
};

type ChannelPointsCustomRewardRedemptionAdd = {
  "channel.channel_points_custom_reward_redemption.add": Prettify<
    {
      id: string;
      user_input: string;
      status: "unknown" | "fulfilled" | "canceled";
      reward: Reward;
      redeemed_at: string;
    } & UserAndBroadcasterInfo
  >;
};

type ChannelPointsCustomRewardRedemptionUpdate = {
  "channel.channel_points_custom_reward_redemption.update": ChannelPointsCustomRewardRedemptionAdd["channel.channel_points_custom_reward_redemption.add"];
};

type Predictor = Prettify<
  UserInfo & {
    channel_points_won: number;
    channel_points_used: number;
  }
>;

type Outcome = {
  id: string;
  title: string;
  color: "pink" | "blue";
  users: number;
  channel_points: number;
  top_predictors: Predictor[];
};

type ChannelPredBeginAndProgressAndLockEvent = {
  [K in `channel.prediction.${"begin" | "progress" | "lock"}`]: Prettify<
    BroadcasterInfo & {
      id: string;
      title: string;
      outcomes: Outcome[];
      started_at: string;
      locks_at: string;
    }
  >;
};

type ChannelPredEndEvent = {
  "channel.prediction.end": Prettify<
    ChannelPredBeginAndProgressAndLockEvent["channel.prediction.begin"] & {
      winning_outcome_id: string;
    }
  >;
};

type ChannelSubEndEvent = {
  "channel.subscription.end": Prettify<
    UserAndBroadcasterInfo &
      Tier & {
        is_gift: boolean;
      }
  >;
};

type ChannelSubGiftEvent = {
  "channel.subscription.gift": Prettify<
    UserAndBroadcasterInfo &
      Tier & {
        total: number;
        cumulative_total: number;
        is_anonymous: boolean;
      }
  >;
};

type Message = {
  text: string;
  emotes: {
    begin: number;
    end: number;
    id: string;
  }[];
};

type ChannelSubMessageEvent = {
  "channel.subscription.message": Prettify<
    UserAndBroadcasterInfo &
      Tier & {
        message: Message;
        cumulative_months: number;
        streak_months: number | null;
        duration_months: number;
      }
  >;
};

type CharityInfo = {
  [K in `charity_${"name" | "logo" | "description" | "website"}`]: string;
};

type Amount = {
  value: number;
  decimal_places: number;
  currency: string;
};

type CharityDonationEvent = {
  "channel.charity_campaign.donate": Prettify<
    UserAndBroadcasterInfo &
      CharityInfo & {
        id: string;
        amount: Amount;
      }
  >;
};

type CharityCampaignStartEvent = {
  "channel.charity_campaign.start": Prettify<
    UserAndBroadcasterInfo &
      CharityInfo & {
        id: string;
        current_amount: Amount;
        target_amount: Amount;
        started_at: string;
      }
  >;
};

type CharityCampaignProgressEvent = {
  "channel.charity_campaign.progress": Prettify<
    Without<
      CharityCampaignStartEvent["channel.charity_campaign.start"],
      "started_at"
    >
  >;
};

type CharityCampaignStopEvent = {
  "channel.charity_campaign.stop": Prettify<
    CharityCampaignProgressEvent["channel.charity_campaign.progress"] & {
      stopped_at: string;
    }
  >;
};

type DropEntitlementGrantEvent = {
  "drop.entitlement.grant": {
    id: string;
    data: Prettify<
      UserInfo &
        Category & {
          organization_id: string;
          campaign_id: string;
          entitlement_id: string;
          benefit_id: string;
          created_at: string;
        }
    >[];
  };
};

type Product = {
  name: string;
  bits: number;
  sku: string;
  in_development: boolean;
};

type ExtensionBitsTransitionCreate = {
  "extension.bits_transaction.create": Prettify<
    UserAndBroadcasterInfo & {
      id: string;
      extension_client_id: string;
      product: Product;
    }
  >;
};

type GoalsBeginAndProgressEvent = {
  [K in `channel.goal.${"begin" | "progress"}`]: Prettify<
    BroadcasterInfo & {
      id: string;
      type:
        | "follow"
        | "subscription"
        | "subscription_count"
        | "new_subscription"
        | "new_subscription_count";
      description: string;
      current_amount: number;
      target_amount: number;
      started_at: number;
    }
  >;
};

type GoalsEndEvent = {
  "channel.goal.end": GoalsBeginAndProgressEvent["channel.goal.begin"] & {
    is_achieved: boolean;
    ended_at: string;
  };
};

type Contribution = UserInfo & {
  type: "bits" | "subscription" | "other";
  total: number;
};

type HypeTrainBeginAndProgressEvent = {
  [K in `channel.hype_train.${"begin" | "progress"}`]: Prettify<
    BroadcasterInfo & {
      id: string;
      total: number;
      progress: number;
      goal: number;
      top_contributions: Contribution[];
      last_contribution: Contribution;
      level: number;
      started_at: string;
      expires_at: string;
    }
  >;
};

type HypeTrainEndEvent = {
  "channel.hype_train.end": Prettify<
    Without<
      HypeTrainBeginAndProgressEvent["channel.hype_train.begin"],
      "progress" | "goal" | "last_contribution" | "expires_at"
    > & {
      cooldown_ends_at: string;
      ended_at: string;
    }
  >;
};

type StreamOnlineEvent = {
  "stream.online": Prettify<
    BroadcasterInfo & {
      id: string;
      type: "live" | "playlist" | "watch_party" | "premiere" | "rerun";
      started_at: string;
    }
  >;
};

type StreamOfflineEvent = {
  "stream.offline": BroadcasterInfo;
};

type UserAuthGrantEvent = {
  "user.authorization.grant": Prettify<
    UserInfo & {
      client_id: string;
    }
  >;
};

type UserAuthRevokeEvent = {
  "user.authorization.revoke": Prettify<
    UserAuthGrantEvent["user.authorization.grant"] & {
      user_login: string | null;
      user_name: string | null;
    }
  >;
};

type UserUpdateEvent = {
  "user.update": Prettify<
    UserInfo & {
      email: string;
      email_verified: boolean;
      description: string;
    }
  >;
};

type ShieldModeBeginEvent = {
  "channel.shield_mode.begin": Prettify<
    BroadcasterInfo &
      ModeratorInfo & {
        started_at: string;
      }
  >;
};
type ShieldModeEndEvent = {
  "channel.shield_mode.end": Prettify<
    BroadcasterInfo &
      ModeratorInfo & {
        ended_at: string;
      }
  >;
};

type ShoutoutCreateEvent = {
  "channel.shoutout.create": Prettify<
    BroadcasterInfo &
      ModeratorInfo & {
        [K in keyof BroadcasterInfo as `to_${K}`]: string;
      } & {
        viewer_count: number;
        started_at: string;
        cooldown_ends_at: string;
        target_cooldown_ends_at: string;
      }
  >;
};

type ShoutoutReceiveEvent = {
  "channel.shoutout.receive": Prettify<
    BroadcasterInfo & {
      [K in keyof BroadcasterInfo as `from_${K}`]: string;
    } & {
      viewer_count: number;
      started_at: string;
    }
  >;
};
