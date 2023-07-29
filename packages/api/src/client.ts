import { Logger, createLogger } from "@twapi/logger";
import { ApiCredentials } from "./credentials";
import { RateLimiter } from "./internal/queue/ratelimiter";
import callApi, {
  transformTwitchApiResponse,
  validateToken,
} from "./internal/api";
import { RequestConfig } from "./internal/interfaces";
import { Resources } from "./resources/resources";
import { AuthenticationError, HelixError } from "./errors";
import retry from "retry";

export class ApiClient {
  private _credentials: ApiCredentials;

  private _log: Logger;

  private _rateLimiter: RateLimiter;
  private _appRateLimiter: RateLimiter;

  private _resources: Resources;
  private _authDone: boolean = false;
  private _onAuthDone: { handler: () => void }[] = [];

  private _userId?: string;

  constructor(credentials: ApiCredentials) {
    this._credentials = credentials;
    this._log = createLogger("twapi:api");

    this._rateLimiter = this._createGeneralRateLimiter();
    this._appRateLimiter = this._createGeneralRateLimiter();

    this._authenticate();

    this._resources = new Resources(this);
  }

  private _createGeneralRateLimiter() {
    return new RateLimiter({
      gap: 75,
      performRequest: async (config) => {
        return await callApi(
          config,
          this._credentials.clientId,
          this._credentials.appAccessToken,
          config.oauth ? this._credentials.oauthToken : undefined
        );
      },
    });
  }

  private _addOnAuthDone(handler: () => void) {
    const item = { handler };
    this._onAuthDone.push(item);

    return () => {
      this._onAuthDone.splice(this._onAuthDone.indexOf(item), 1);
    };
  }

  private async _authenticate() {
    try {
      const data = await validateToken(this._credentials.oauthToken);

      if (data.client_id !== this._credentials.clientId) {
        this._log.error(
          "OAuth token's client id doesnt match the provided client id."
        );
        return;
      }

      this._userId = data.user_id;
      this._log.info("Auth successful, user id is " + this._userId);
      this._onAuthDone.forEach((l) => l.handler());
    } catch (e) {
      if (e instanceof HelixError) {
        this._log.error("Authentication failed, invalid access token");
      }
    } finally {
      this._authDone = true;
      this._onAuthDone.forEach((l) => l.handler());
    }
  }

  async enqueueCall<T = unknown>(config: RequestConfig) {
    if (config.oauth && !this._authDone) {
      this._log.warn("Pending authentication");
      await this._waitForAuth();
    }

    if (config.oauth && !this.userId) {
      throw new AuthenticationError();
    }

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

  private _waitForAuth() {
    return new Promise((res, rej) => {
      let timeout: NodeJS.Timeout;

      const unsub = this._addOnAuthDone(() => {
        if (timeout) clearTimeout(timeout);
        unsub();

        this._userId ? res(true) : rej(new AuthenticationError());
      });

      timeout = setTimeout(() => {
        this._log.error("Auth timed out");
        unsub();
        rej(new AuthenticationError());
      }, 3000);
    });
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

  public get userId() {
    return this._userId;
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
}
