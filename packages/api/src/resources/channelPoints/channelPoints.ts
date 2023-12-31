export const createDeleteUpdateRewardQuery = (
  broadcasterId: string | undefined,
  rewardId: string
) => {
  return {
    broadcaster_id: broadcasterId,
    id: rewardId,
  };
};

export const createGetRewardQuery = (
  broadcasterId?: string,
  id?: string | string[],
  onlyManageableRewards?: boolean
) => {
  const map = new Map<string, any>();
  map.set("broadcaster_id", broadcasterId);
  id && map.set("id", id);
  onlyManageableRewards !== undefined &&
    map.set("only_manageable_rewards", onlyManageableRewards);

  return Object.fromEntries(map.entries());
};
