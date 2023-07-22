import { Logger, createLogger } from "@twapi/logger";
import { ApiCredentials } from "./credentials";
import { RateLimiter } from "./internal/queue/ratelimiter";
import callApi, { transformTwitchApiResponse } from "./internal/api";
import { ChannelApi } from "./categories/channel/channel";
import { RequestConfig } from "./internal/interfaces";

export class ApiClient {
  private _credentials: ApiCredentials;

  private _log: Logger;

  private _rateLimiter: RateLimiter;

  private _channel: ChannelApi;

  constructor(credentials: ApiCredentials) {
    this._credentials = credentials;
    this._log = createLogger("twapi:api");

    this._rateLimiter = new RateLimiter({
      gap: 75,
      performRequest: async (config) => {
        return await callApi(
          config,
          this._credentials.clientId,
          this._credentials.appAccessToken,
          config.auth ? credentials.oauthToken : undefined
        );
      },
    });

    this._channel = new ChannelApi(this);
  }

  async callApi<T = unknown>(config: RequestConfig) {
    const result = await this._rateLimiter.request(config);

    return await transformTwitchApiResponse<T>(result as Response);
  }

  public get channel() {
    return this._channel;
  }
}
