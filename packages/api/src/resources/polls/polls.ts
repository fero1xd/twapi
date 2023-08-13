export const createGetPollsQuery = (broadcasterId?: string, ids?: string[]) => {
  return {
    broadcaster_id: broadcasterId,
    id: ids,
  };
};
