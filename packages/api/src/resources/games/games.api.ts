import { ApiClient } from "../../client";
import {
  HelixPaginatedResponse,
  RequestConfig,
} from "../../internal/interfaces";
import { HelixPaginatedResponseIterator } from "../HelixPaginatedResponse";
import { Game } from "./games.data";

export interface GamesApiEndpoints {
  /**
   * Gets information about all broadcasts on Twitch.
   *
   * @returns A paginated list of games
   */
  getTopGames(): Promise<HelixPaginatedResponseIterator<Game>>;

  /**
   * Gets information about specified categories or games.
   *
   * @param categoryId The ID of the category or game to get.
   *
   * @retuns A paginated list of games
   */
  getGamesbyCategory(
    categoryId: string
  ): Promise<HelixPaginatedResponseIterator<Game>>;

  /**
   * Gets information about specified categories or games.
   *
   * @param name The name of the category or game to get.
   *
   * @retuns A paginated list of games
   */
  getGamesbyName(name: string): Promise<HelixPaginatedResponseIterator<Game>>;

  /**
   * Gets information about specified categories or games.
   *
   * @param igdbId The [IGDB](https://www.igdb.com) ID of the game to get.
   *
   * @retuns A paginated list of games
   */
  getGamesByIgdbId(
    igdbId: string
  ): Promise<HelixPaginatedResponseIterator<Game>>;
}

export class GamesApi implements GamesApiEndpoints {
  constructor(private _client: ApiClient) {}

  async getTopGames(): Promise<HelixPaginatedResponseIterator<Game>> {
    const config: RequestConfig = {
      url: "games/top",
      method: "GET",
      oauth: false,
    };

    const res = await this._client.enqueueCall<HelixPaginatedResponse<Game>>(
      config
    );

    return new HelixPaginatedResponseIterator(res, this._client, config);
  }

  async getGamesbyCategory(categoryId: string) {
    const config: RequestConfig = {
      url: "games/top",
      method: "GET",
      oauth: false,
      query: { id: categoryId },
    };

    const res = await this._client.enqueueCall<HelixPaginatedResponse<Game>>(
      config
    );

    return new HelixPaginatedResponseIterator(res, this._client, config);
  }

  async getGamesbyName(name: string) {
    const config: RequestConfig = {
      url: "games/top",
      method: "GET",
      oauth: false,
      query: { name },
    };

    const res = await this._client.enqueueCall<HelixPaginatedResponse<Game>>(
      config
    );

    return new HelixPaginatedResponseIterator(res, this._client, config);
  }

  async getGamesByIgdbId(igdbId: string) {
    const config: RequestConfig = {
      url: "games/top",
      method: "GET",
      oauth: false,
      query: { igdb_id: igdbId },
    };

    const res = await this._client.enqueueCall<HelixPaginatedResponse<Game>>(
      config
    );

    return new HelixPaginatedResponseIterator(res, this._client, config);
  }
}
