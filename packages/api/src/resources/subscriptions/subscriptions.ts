export const createGetSubscriptionsQuery = (
  broadcasterId: string,
  userIds?: string | string[]
) => {
  return userIds
    ? {
        broadcaster_id: broadcasterId,
        user_id: userIds,
      }
    : {
        broadcaster_id: broadcasterId,
      };
};
