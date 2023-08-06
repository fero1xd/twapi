export const createGetPollsQuery = (broadcasterId: string, ids?: string[]) => {
  return ids
    ? {
        broadcaster_id: broadcasterId,
        id: ids,
      }
    : {
        broadcaster_id: broadcasterId,
      };
};
