export const createStreamMarkerQuery = (
  userId?: string,
  description?: string
) => {
  return {
    user_id: userId,
    description,
  };
};

export const createGetStreamMarkersQuery = (
  userId: string | undefined,
  videoId: string
) => {
  return {
    user_id: userId,
    video_id: videoId,
  };
};
