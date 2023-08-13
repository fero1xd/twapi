import { type LoggerType, createLogger } from "@twapi/logger";
import { RateLimiter } from "./internal/queue/ratelimiter";
import callApi, { transformTwitchApiResponse } from "./internal/api";
import { RequestConfig } from "./internal/interfaces";
import { Resources } from "./resources/resources";
import { AuthProvider } from "@twapi/auth";
import retry from "retry";

export class ApiClient {
  private _log: LoggerType;

  private _rateLimiter: RateLimiter;
  private _appRateLimiter: RateLimiter;

  private _resources: Resources;
  private _authProvider: AuthProvider;

  constructor(authProvider: AuthProvider) {
    this._log = createLogger("twapi:api");

    this._rateLimiter = this._createGeneralRateLimiter();
    this._appRateLimiter = this._createGeneralRateLimiter();

    this._resources = new Resources(this);
    this._authProvider = authProvider;
  }

  private _createGeneralRateLimiter() {
    return new RateLimiter({
      gap: 75,
      performRequest: async (config) => {
        return await callApi(
          config,
          this._authProvider.getClientId(),
          await this._authProvider.getAppAccessToken(),
          config.oauth
            ? await this._authProvider.getUserAccessToken()
            : undefined
        );
      },
    });
  }

  async enqueueCall<T = unknown>(config: RequestConfig) {
    const op = retry.operation({
      retries: 3,
      minTimeout: 500,
      factor: 2,
    });

    return new Promise<T>(async (resolve, reject) => {
      op.attempt(async () => {
        try {
          op.attempts() > 1 &&
            this._log.warn(`Retrying request ${op.attempts() - 1} times`);
          const result = config.oauth
            ? await this._rateLimiter.request(config)
            : await this._appRateLimiter.request(config);

          resolve(await transformTwitchApiResponse<T>(result as Response));
        } catch (e) {
          if (op.retry(e as Error)) {
            return;
          }

          reject(op.mainError()!);
        }
      });
    });
  }

  public async getUserId() {
    return await this._authProvider.getUserId();
  }

  public async getUserName() {
    return await this._authProvider.getUserName();
  }

  public get channel() {
    return this._resources.channel;
  }

  public get bits() {
    return this._resources.bits;
  }

  public get channelPoints() {
    return this._resources.channelPoints;
  }

  public get charity() {
    return this._resources.charity;
  }

  public get chat() {
    return this._resources.chat;
  }

  public get clip() {
    return this._resources.clip;
  }

  public get entitlements() {
    return this._resources.entitlements;
  }

  public get whispers() {
    return this._resources.whispers;
  }

  public get users() {
    return this._resources.users;
  }

  public get eventsub() {
    return this._resources.eventsub;
  }

  public get games() {
    return this._resources.games;
  }

  public get analytics() {
    return this._resources.analytics;
  }

  public get goals() {
    return this._resources.goals;
  }

  public get guestStar() {
    return this._resources.guestStars;
  }

  public get moderation() {
    return this._resources.moderation;
  }

  public get polls() {
    return this._resources.polls;
  }

  public get predictions() {
    return this._resources.predictions;
  }

  public get raids() {
    return this._resources.raids;
  }

  public get schedule() {
    return this._resources.schedule;
  }

  public get search() {
    return this._resources.search;
  }

  public get streams() {
    return this._resources.streams;
  }

  public get subscriptions() {
    return this._resources.subscriptions;
  }

  public get videos() {
    return this._resources.videos;
  }

  public get teams() {
    return this._resources.teams;
  }
}
