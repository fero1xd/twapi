import { BroadcasterInfo, Prettify } from "../../internal/types";

export type ChannelInformation = Prettify<
  BroadcasterInfo & {
    game_id: string;
    game_name: string;
    broadcaster_language: string;
    title: string;
    delay: number;
    tags: string[];
    content_classification_labels: string[];
    is_branded_content: boolean;
  }
>;
