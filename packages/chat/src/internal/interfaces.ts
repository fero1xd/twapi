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
}

export interface ParsedMessage {
  tags: MessageTags | null;
  source: MessageSource | null;
  command: MessageCommand | null;
  parameters: string | null;
}
