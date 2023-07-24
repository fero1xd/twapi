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

export const createGetEmoteSetsQuery = (emoteSetId: string) => {
  return {
    emote_set_id: emoteSetId,
  };
};
