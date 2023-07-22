export type BroadcasterInfo = {
  [K in `broadcaster_${"id" | "login" | "name"}`]: string;
};

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
