import { BroadcasterInfo, Prettify } from "../../internal/types";

export interface GetChannelStreamScheduleQuery {
  broadcaster_id: string;
  id?: string | string[];
  start_time?: string;
  utc_offset?: string;
}

export interface ScheduleVacation {
  start_time: string;
  end_time: string;
}

export type HelixScheduleResponseData = Prettify<
  {
    segments: ScheduleSegment[] | null;
    vacation: ScheduleVacation | null;
  } & BroadcasterInfo
>;

export interface HelixScheduleResponse {
  data: HelixScheduleResponseData;
  pagination?: {
    cursor?: string;
  };
}

export interface ScheduleSegment {
  id: string;
  start_time: string;
  end_time: string;
  title: string;
  canceled_until: string | null;
  category: {
    id: string;
    name: string;
  } | null;

  is_recurring: boolean;
}

export interface UpdateChannelStreamScheduleQuery {
  is_vacation_enabled?: boolean;
  vacation_start_time?: string;
  vacation_end_time?: string;
  timezone?: string;
}

export interface CreateChannelStreamScheduleSegmentBody {
  start_time: string;
  timezone: string;
  duration: string;
  is_recurring?: boolean;
  category_id?: string;
  title?: string;
}

export interface UpdateChannelStreamScheduleSegmentBody {
  start_time?: string;
  duration?: string;
  category_id?: string;
  title?: string;
  is_canceled?: boolean;
  timezone?: string;
}
