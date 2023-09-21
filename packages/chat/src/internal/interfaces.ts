export type MessageTags = {
  [x: string]: any;
};

export type Maybe<T> = T | null;

export interface MessageSource {
  nick: Maybe<string>;
  host: string;
}

export interface MessageCommand {
  command: string;
  channel?: string;
  numeric?: boolean;
}

export interface ParsedMessage {
  tags: MessageTags | null;
  source: MessageSource | null;
  command: MessageCommand | null;
  parameters: string | null;
}

export interface UserState {
  badges: MessageTags | null;
  'badges-info': MessageTags | null;
  color: string;
  'display-name': string;
  'emote-sets': string[] | null;
  'user-id': string;
  'user-type': '' | 'admin' | 'global_mod' | 'staff';
  turbo: boolean;
}
