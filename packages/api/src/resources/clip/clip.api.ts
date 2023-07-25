import { ApiClient } from "../../client";
import {
  HelixPaginatedResponse,
  HelixResponse,
  RequestConfig,
} from "../../internal/interfaces";
import { HelixPaginatedResponseIterator } from "../HelixPaginatedResponse";
import { createClipQuery, createGetClipsByBroadcasterQuery } from "./clip";
import { Clip, CreateClipResponse, GetClipsFilter } from "./clip.data";

interface ClipApiEndpoints {
  /**
   * Creates a clip from the broadcaster’s stream.
   *
   * @param broadcasterId The ID of the broadcaster whose stream you want to create a clip from.
   * @param hasDelay A Boolean value that determines whether the API captures the clip at the moment the viewer requests it or after a delay. If false (default), Twitch captures the clip at the moment the viewer requests it (this is the same clip experience as the Twitch UX). If true, Twitch adds a delay before capturing the clip (this basically shifts the capture window to the right slightly).
   * @returns The edit url and id of the clip
   */
  createClip(
    broadcasterId: string,
    hasDelay?: boolean
  ): Promise<CreateClipResponse>;

  /**
   * Gets one or more video clips that were captured from streams.
   *
   * @param broadcasterId An ID that identifies the broadcaster whose video clips you want to get. Use this parameter to get clips that were captured from the broadcaster’s streams.
   * @param filter Optional Started At and Ended At field
   *
   * @returns A Paginated list of found clips
   */
  getBroadcasterClips(
    broadcasterId: string,
    filter?: GetClipsFilter
  ): Promise<HelixPaginatedResponseIterator<Clip>>;

  /**
   * Gets one or more video clips that were captured from streams.
   *
   * @param clipId Id of the clip
   *
   * @returns The found clip
   */
  getClipById(clipId: string): Promise<Clip>;
}

export class ClipApi implements ClipApiEndpoints {
  constructor(private _client: ApiClient) {}

  async createClip(
    broadcasterId: string,
    hasDelay?: boolean | undefined
  ): Promise<CreateClipResponse> {
    const res = await this._client.enqueueCall<
      HelixResponse<CreateClipResponse>
    >({
      url: "clips",
      method: "POST",
      query: createClipQuery(broadcasterId, hasDelay),
      oauth: true,
    });

    return res.data[0];
  }

  async getBroadcasterClips(broadcasterId: string, filter?: GetClipsFilter) {
    const config: RequestConfig = {
      url: "clips",
      method: "GET",
      oauth: false,
      query: createGetClipsByBroadcasterQuery(broadcasterId, filter),
    };
    const res = await this._client.enqueueCall<HelixPaginatedResponse<Clip>>(
      config
    );

    return new HelixPaginatedResponseIterator(res, this._client, config);
  }

  async getClipById(clipId: string) {
    const res = await this._client.enqueueCall<HelixResponse<Clip>>({
      url: "clips",
      method: "GET",
      oauth: false,
      query: { id: clipId },
    });

    return res.data[0];
  }
}
