export const createGetSubscriptionsQuery = (
  broadcasterId?: string,
  userIds?: string | string[]
) => {
  return {
    broadcaster_id: broadcasterId,
    user_id: userIds,
  };
};
