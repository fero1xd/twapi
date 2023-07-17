import { ParsedMap } from "./types";

export const topics = [
  "channel-bits-events-v2.<channel_id>",
  "channel-bits-badge-unlocks.<channel_id>",
  "channel-points-channel-v1.<channel_id>",
  "channel-subscribe-events-v1.<channel_id>",
  "automod-queue.<moderator_id>.<channel_id>",
  "chat_moderator_actions.<user_id>.<channel_id>",
  "low-trust-users.<channel_id>.<suspicious_user_id>",
  "user-moderation-notifications.<current_user_id>.<channel_id>",
  "whispers.<user_id>",
] as const;

// @ts-ignore
export const topicsMap: ParsedMap = {};

for (const t of topics) {
  const beforeDot = t.split(".")[0];
  const beforeEvent = beforeDot.split("-events")[0];

  let parsedTopic = "";

  for (let i = 0; i < beforeEvent.length; i++) {
    if (beforeEvent.charAt(i) === "-" || beforeEvent.charAt(i) === "_") {
      const nextWord = beforeEvent.substring(i + 1).split("_")[0];

      parsedTopic += beforeEvent.charAt(i + 1).toUpperCase();
      i += 2;
    }

    parsedTopic += beforeEvent.charAt(i);
  }

  // @ts-ignore
  topicsMap[parsedTopic] = t;
}

topicsMap["channelRedemption"] = topics[2];
