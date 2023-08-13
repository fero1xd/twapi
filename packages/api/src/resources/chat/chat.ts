import { ChatColor } from "./chat.data";

export const createBroadModQuery = (broadcasterId: string, modId?: string) => {
  return modId
    ? {
        broadcaster_id: broadcasterId,
        moderator_id: modId,
      }
    : {
        broadcaster_id: broadcasterId,
      };
};

export const createGetEmoteSetsQuery = (emoteSetId: string | string[]) => {
  return {
    emote_set_id: emoteSetId,
  };
};

export const createSendShoutoutQuery = (
  from: string,
  to: string,
  modId?: string
) => {
  return {
    from_broadcaster_id: from,
    to_broadcaster_id: to,
    moderator_id: modId,
  };
};

export const createUpdateChatColorQuery = (
  userId: string | undefined,
  color: ChatColor
) => {
  return {
    user_id: userId,
    color,
  };
};
