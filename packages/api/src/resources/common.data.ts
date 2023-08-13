import { HelixPaginatedResponse } from "../internal/interfaces";

export type Image = {
  [K in `url_${"1" | "2" | "4"}x`]: string;
};

export interface HelixPaginatedResponseWithTotal<T>
  extends HelixPaginatedResponse<T> {
  total: number;
}

export const createBroadcasterQuery = (id?: string | string[]) => {
  return {
    broadcaster_id: id,
  };
};

export const createModeratorQuery = (id?: string) => {
  return {
    moderator_id: id,
  };
};
