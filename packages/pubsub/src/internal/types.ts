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
export type ParsedTopics = ParseTopic<GetBeforeDot<Topics>>;

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

export type ParsedMap = {
  [K in Topics as ParseTopic<GetBeforeDot<K>>]: K;
};

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
  {
    [K in Topics as K]: {
      test: true;
    };
  } & WhisperEvent &
    UserModerationNotification &
    AutoModQueueMessage
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
  "whispers.<user_id>": {
    type: "whisper_sent" | "whisper_received";
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
        emotes: Emote[];
      };
      nonce: string;
    };
  };
};

type UserModerationNotification = {
  "user-moderation-notifications.<current_user_id>.<channel_id>": {
    type: "automod_caught_message";
    data: {
      message_id: string;
      status: "DENIED" | "PENDING" | "ALLOWED" | "EXPIRED";
    };
  };
};

type AutoModQueueMessage = {
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
