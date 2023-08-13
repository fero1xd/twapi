export const createGetPredictionsQuery = (
  broadcasterId?: string,
  id?: string | string[]
) => {
  return {
    broadcaster_id: broadcasterId,
    id,
  };
};
