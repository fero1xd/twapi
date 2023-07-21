import { Logger, createLogger } from "@twapi/logger";
import { ApiCredentials } from "./credentials";
import { RateLimiter } from "./internal/queue/ratelimiter";
import "cross-fetch/polyfill";
import callApi from "./internal/api";

export class ApiClient {
  private _credentials: ApiCredentials;

  private _log: Logger;

  private _rateLimiter: RateLimiter;

  constructor(credentials: ApiCredentials) {
    this._credentials = credentials;
    this._log = createLogger("twapi:api");

    this._rateLimiter = new RateLimiter({
      gap: 75,
      performRequest: async (config) => {
        return await callApi(
          config,
          this._credentials.clientId,
          config.auth ? credentials.oauthToken : undefined
        );
      },
    });
  }
}
