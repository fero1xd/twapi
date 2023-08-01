import { ApiClient } from "../../client";
import {
  HelixPaginatedResponse,
  HelixResponse,
  RequestConfig,
} from "../../internal/interfaces";
import { HelixPaginatedResponseIterator } from "../HelixPaginatedResponse";
import { GetVideosQuery, PublishedVideo } from "./videos.data";

export interface VideosApiEndpoints {
  /**
   * Gets information about one or more published videos. You may get videos by ID, by user, or by game/category.
   *
   * @param query Data related to get videos
   *
   * @returns A paginated list of published videos
   */
  getVideos(
    query: GetVideosQuery
  ): Promise<HelixPaginatedResponseIterator<PublishedVideo>>;

  /**
   * Deletes one or more videos. You may delete past broadcasts, highlights, or uploads.
   *
   * @param id The list of videos to delete.
   *
   * @returns The list of IDs of the videos that were deleted.
   */
  deleteVideos(id: string): Promise<string[]>;
}

export class VideosApi implements VideosApiEndpoints {
  constructor(private _client: ApiClient) {}

  async getVideos(query: GetVideosQuery) {
    const config: RequestConfig = {
      url: "videos",
      oauth: true,
      query,
      method: "GET",
    };

    const res = await this._client.enqueueCall<
      HelixPaginatedResponse<PublishedVideo>
    >(config);

    return new HelixPaginatedResponseIterator(res, this._client, config);
  }

  async deleteVideos(id: string) {
    const res = await this._client.enqueueCall<HelixResponse<string>>({
      url: "videos",
      method: "DELETE",
      oauth: true,
      query: { id },
    });

    return res.data;
  }
}
