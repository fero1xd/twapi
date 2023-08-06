import { ApiClient } from "../../client";
import { RequestConfig } from "../../internal/interfaces";
import { createBroadcasterQuery } from "../common.data";
import { HelixScheduleResponseIterator } from "./HelixScheduleResponse";
import {
  CreateChannelStreamScheduleSegmentBody,
  GetChannelStreamScheduleQuery,
  HelixScheduleResponse,
  HelixScheduleResponseData,
  UpdateChannelStreamScheduleQuery,
  UpdateChannelStreamScheduleSegmentBody,
} from "./schedule.data";

export interface ScheduleApiEndpoints {
  /**
   * Gets the broadcaster’s streaming schedule. You can get the entire schedule or specific segments of the schedule.
   *
   * @param query Query required to get stream schedule
   *
   * @returns A paginated list of broadcasts in the broadcaster’s streaming schedule.
   */
  getChannelStreamSchedule(
    query: GetChannelStreamScheduleQuery
  ): Promise<HelixScheduleResponseIterator>;

  /**
   * Gets the broadcaster’s streaming schedule as an iCalendar.
   *
   * @param broadcasterId The ID of the broadcaster that owns the streaming schedule you want to get.
   *
   * @returns Broadcaster's streaming schedule as an iCalendar
   */
  getChannelICalendar(broadcasterId: string): Promise<string>;

  /**
   * Updates the broadcaster’s schedule settings, such as scheduling a vacation.
   *
   * @param query Data related to update stream schedule
   */
  updateChannelStreamSchedule(
    query: UpdateChannelStreamScheduleQuery
  ): Promise<void>;

  /**
   * Adds a single or recurring broadcast to the broadcaster’s streaming schedule.
   *
   * @param broadcasterId The ID of the broadcaster that owns the schedule to add the broadcast segment to. This ID must match the user ID in the user access token.
   * @param body Data related to create a channel stream schedule segment
   *
   * @returns The broadcaster’s streaming scheduled.
   */
  createChannelStreamScheduleSegment(
    broadcasterId: string,
    body: CreateChannelStreamScheduleSegmentBody
  ): Promise<HelixScheduleResponseData>;

  /**
   * Updates a scheduled broadcast segment.
     For recurring segments, updating a segment’s title, category, duration, and timezone, changes all segments in the recurring schedule, not just the specified segment.

   * @param broadcasterId The ID of the broadcaster who owns the broadcast segment to update. This ID must match the user ID in the user access token.
   * @param id The ID of the broadcast segment to update.
   * @param body Data to update
   * 
   * @returns The broadcaster’s streaming scheduled.
   */
  updateChannelStreamScheduleSegment(
    broadcasterId: string,
    id: string,
    body: UpdateChannelStreamScheduleSegmentBody
  ): Promise<HelixScheduleResponseData>;

  /**
   * Removes a broadcast segment from the broadcaster’s streaming schedule.
   *
   * @param broadcasterId The ID of the broadcaster that owns the streaming schedule. This ID must match the user ID in the user access token.
   * @param id The ID of the broadcast segment to remove.
   */
  deleteChannelStreamScheduleSegment(
    broadcasterId: string,
    id: string
  ): Promise<void>;
}

export class ScheduleApi implements ScheduleApiEndpoints {
  constructor(private _client: ApiClient) {}

  async getChannelStreamSchedule(query: GetChannelStreamScheduleQuery) {
    const config: RequestConfig = {
      url: "schedule",
      method: "GET",
      oauth: false,
      query,
    };
    const res = await this._client.enqueueCall<HelixScheduleResponse>(config);

    return new HelixScheduleResponseIterator(res, this._client, config);
  }

  async getChannelICalendar(broadcasterId: string) {
    return await this._client.enqueueCall<string>({
      url: "schedule/icalendar",
      method: "GET",
      oauth: false,
      query: createBroadcasterQuery(broadcasterId),
    });
  }

  async updateChannelStreamSchedule(query: UpdateChannelStreamScheduleQuery) {
    await this._client.enqueueCall({
      url: "schedule/settings",
      oauth: true,
      query,
      method: "PATCH",
    });
  }

  async createChannelStreamScheduleSegment(
    broadcasterId: string,
    body: CreateChannelStreamScheduleSegmentBody
  ) {
    const res = await this._client.enqueueCall<{
      data: HelixScheduleResponseData;
    }>({
      url: "schedule/segment",
      method: "POST",
      oauth: true,
      query: createBroadcasterQuery(broadcasterId),
      body,
    });

    return res.data;
  }

  async updateChannelStreamScheduleSegment(
    broadcasterId: string,
    id: string,
    body: UpdateChannelStreamScheduleSegmentBody
  ) {
    const res = await this._client.enqueueCall<{
      data: HelixScheduleResponseData;
    }>({
      url: "schedule/segment",
      method: "PATCH",
      oauth: true,
      query: { ...createBroadcasterQuery(broadcasterId), id },
      body,
    });

    return res.data;
  }

  async deleteChannelStreamScheduleSegment(broadcasterId: string, id: string) {
    await this._client.enqueueCall({
      url: "schedule/segment",
      method: "DELETE",
      oauth: true,
      query: { ...createBroadcasterQuery(broadcasterId), id },
    });
  }
}
