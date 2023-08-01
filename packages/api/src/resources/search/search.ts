export const createSearchChannelQuery = (query: string, liveOnly: boolean) => {
  return {
    query,
    live_only: liveOnly,
  };
};
