export const createGetPollsQuery = (broadcasterId: string, id?: string) => {
  return id
    ? {
        broadcaster_id: broadcasterId,
        id,
      }
    : {
        broadcaster_id: broadcasterId,
      };
};
