import { GetClipsFilter } from "./clip.data";

export const createClipQuery = (broadcasterId: string, hasDelay?: boolean) => {
  return hasDelay
    ? {
        broadcaster_id: broadcasterId,
        has_delay: hasDelay,
      }
    : {
        broadcaster_id: broadcasterId,
      };
};

const parseFilter = (filter: GetClipsFilter) => {
  const map = new Map<string, string>();

  filter.started_at && map.set("started_at", filter.started_at);
  filter.ended_at && map.set("ended_at", filter.ended_at);

  return Object.fromEntries(map.entries());
};

export const createGetClipsByBroadcasterQuery = (
  broadcasterId: string,
  filter?: GetClipsFilter
) => {
  return filter
    ? {
        broadcaster_id: broadcasterId,
        ...parseFilter(filter),
      }
    : {
        broadcaster_id: broadcasterId,
      };
};
