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

export type TopicDataMap = {
  [K in Topics]: {
    test: true;
  };
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
  onRevocation: (handler: () => void) => void;
  unsubscribe: () => void;
};
