export const createFollowedQuery = (
  userId?: string,
  broadcasterId?: string
) => {
  return {
    user_id: userId,
    broadcaster_id: broadcasterId,
  };
};
export const createFollowersQuery = (
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

export const createCommercialQuery = (
  broadcasterId: string | undefined,
  length: number
) => {
  return {
    broadcaster_id: broadcasterId,
    length: length.toString(),
  };
};

export const createQuery = (queries: string[][]) => {
  const result: Record<string, string> = {};

  for (const q of queries) {
    result[q[0]] = q[1];
  }
};
