export const createGetSubscriptionsQuery = (
  broadcasterId: string,
  userId?: string
) => {
  return userId
    ? {
        broadcaster_id: broadcasterId,
        user_id: userId,
      }
    : {
        broadcaster_id: broadcasterId,
      };
};
