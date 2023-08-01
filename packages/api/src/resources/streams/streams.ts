export const createStreamMarkerQuery = (
  userId: string,
  description?: string
) => {
  return description
    ? {
        user_id: userId,
      }
    : {
        user_id: userId,
        description,
      };
};

export const createGetStreamMarkersQuery = (
  userId: string,
  videoId: string
) => {
  return {
    user_id: userId,
    video_id: videoId,
  };
};
