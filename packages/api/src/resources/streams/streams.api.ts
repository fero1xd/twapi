import { ApiClient } from "../../client";
import {
  HelixPaginatedResponse,
  HelixResponse,
  RequestConfig,
} from "../../internal/interfaces";
import { HelixPaginatedResponseIterator } from "../HelixPaginatedResponse";
import { createBroadcasterQuery } from "../common.data";
import {
  createGetStreamMarkersQuery,
  createStreamMarkerQuery,
} from "./streams";
import {
  GetStreamKeyResponse,
  GetStreamMarkersResponse,
  GetStreamsQuery,
  Stream,
  StreamKey,
  StreamMarker,
} from "./streams.data";

export interface StreamsApiEndpoints {
  /**
   * Gets the channel’s stream key.
   *
   * @returns The stream’s key.
   */
  getStreamKey(): Promise<StreamKey>;

  /**
   * Gets a list of all streams. The list is in descending order by the number of viewers watching the stream. Because viewers come and go during a stream, it’s possible to find duplicate or missing streams in the list as you page through the results.
   *
   * @param query Data related to get streams
   *
   * @returns A paginated list of streams
   */
  getStreams(
    query: GetStreamsQuery
  ): Promise<HelixPaginatedResponseIterator<Stream>>;

  /**
   * Gets the list of broadcasters that the user follows and that are streaming live.
   *
   * @returns A paginated list of live streams
   */
  getFollowedStreams(): Promise<HelixPaginatedResponseIterator<Stream>>;

  /**
   * Adds a marker to a live stream. A marker is an arbitrary point in a live stream that the broadcaster or editor wants to mark, so they can return to that spot later to create video highlights (see Video Producer, Highlights in the Twitch UX).
   *
   * @param description A short description of the marker to help the user remember why they marked the location. The maximum length of the description is 140 characters.
   *
   * @returns The marker that you added.
   */
  createStreamMarker(description?: string): Promise<StreamMarker>;

  /**
   * Gets a list of markers from the user’s most recent stream or from the specified VOD/video. A marker is an arbitrary point in a live stream that the broadcaster or editor marked, so they can return to that spot later to create video highlights (see Video Producer, Highlights in the Twitch UX).
   *
   * @returns A paginated list of markers grouped by the user that created the marks.
   */
  getUserStreamMarkers(): Promise<
    HelixPaginatedResponseIterator<GetStreamMarkersResponse>
  >;

  /**
   * Gets a list of markers from the user’s most recent stream or from the specified VOD/video. A marker is an arbitrary point in a live stream that the broadcaster or editor marked, so they can return to that spot later to create video highlights (see Video Producer, Highlights in the Twitch UX).
   *
   * @param videoId A video on demand (VOD)/video ID. The request returns the markers from this VOD/video. The user in the access token must own the video or the user must be one of the broadcaster’s editors.
   *
   * @returns A paginated list of markers grouped by the user that created the marks.
   */
  getVideoStreamMarkers(
    videoId: string
  ): Promise<HelixPaginatedResponseIterator<GetStreamMarkersResponse>>;
}

export class StreamsApi implements StreamsApiEndpoints {
  constructor(private _client: ApiClient) {}

  async getStreamKey() {
    const broadcasterId = await this._client.getUserId();

    const res = await this._client.enqueueCall<
      HelixResponse<GetStreamKeyResponse>
    >({
      url: "streams/key",
      oauth: true,
      method: "GET",
      query: createBroadcasterQuery(broadcasterId),
    });

    return res.data[0]?.stream_key;
  }

  async getStreams(query: GetStreamsQuery) {
    const config: RequestConfig = {
      url: "streams",
      method: "GET",
      oauth: false,
      query,
    };

    const res = await this._client.enqueueCall<HelixPaginatedResponse<Stream>>(
      config
    );

    return new HelixPaginatedResponseIterator(res, this._client, config);
  }

  async getFollowedStreams() {
    const userId = await this._client.getUserId();

    const config: RequestConfig = {
      url: "streams/followed",
      method: "GET",
      oauth: false,
      query: { user_id: userId },
    };

    const res = await this._client.enqueueCall<HelixPaginatedResponse<Stream>>(
      config
    );

    return new HelixPaginatedResponseIterator(res, this._client, config);
  }

  async createStreamMarker(description?: string | undefined) {
    const userId = await this._client.getUserId();

    const res = await this._client.enqueueCall<HelixResponse<StreamMarker>>({
      url: "streams/markers",
      oauth: true,
      method: "POST",
      query: createStreamMarkerQuery(userId, description),
    });

    return res.data[0];
  }

  async getUserStreamMarkers() {
    const userId = await this._client.getUserId();

    const config: RequestConfig = {
      url: "streams/markers",
      method: "GET",
      oauth: true,
      query: { user_id: userId },
    };

    const res = await this._client.enqueueCall<
      HelixPaginatedResponse<GetStreamMarkersResponse>
    >(config);

    return new HelixPaginatedResponseIterator(res, this._client, config);
  }

  async getVideoStreamMarkers(videoId: string) {
    const userId = await this._client.getUserId();

    const config: RequestConfig = {
      url: "streams/markers",
      method: "GET",
      oauth: true,
      query: createGetStreamMarkersQuery(userId, videoId),
    };

    const res = await this._client.enqueueCall<
      HelixPaginatedResponse<GetStreamMarkersResponse>
    >(config);

    return new HelixPaginatedResponseIterator(res, this._client, config);
  }
}
