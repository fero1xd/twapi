import { Logger, createLogger } from "@twapi/logger";
import { ApiCredentials } from "./credentials";
import { RateLimiter } from "./internal/queue/ratelimiter";
import callApi, { transformTwitchApiResponse } from "./internal/api";
import { ChannelApi } from "./resources/channel/channel.api";
import { RequestConfig } from "./internal/interfaces";
import { Resources } from "./resources/resources";

export class ApiClient {
  private _credentials: ApiCredentials;

  private _log: Logger;

  private _rateLimiter: RateLimiter;

  private _resources: Resources;

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
          config.oauth ? credentials.oauthToken : undefined
        );
      },
    });

    this._resources = new Resources(this);
  }

  async enqueueCall<T = unknown>(config: RequestConfig) {
    const result = await this._rateLimiter.request(config);

    return await transformTwitchApiResponse<T>(result as Response);
  }

  public get channel() {
    return this._resources.channel;
  }

  public get bits() {
    return this._resources.bits;
  }
}
