export const createGetBannedUsersQuery = (
  broadcasterId?: string,
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

export const createGetModeratorsQuery = createGetBannedUsersQuery;

export const createAddModeratorQuery = createGetBannedUsersQuery;
export const createRemoveModeratorQuery = createGetBannedUsersQuery;
export const createGetVipsQuery = createGetBannedUsersQuery;
export const createAddVipQuery = createGetBannedUsersQuery;
export const createRemoveVipQuery = createGetBannedUsersQuery;

export const createUnbanQuery = (
  broadcasterId: string,
  userId: string,
  modId?: string
) => {
  return {
    broadcaster_id: broadcasterId,
    user_id: userId,
    moderator_id: modId,
  };
};
