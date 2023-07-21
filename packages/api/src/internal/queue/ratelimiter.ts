import { QueueItem, RequestConfig } from "../interfaces";
import { Logger, createLogger } from "@twapi/logger";

export interface RateLimiterConfig {
  gap: number;
  performRequest: (config: RequestConfig) => any;
}

export class RateLimiter {
  private readonly gap;

  private _working: boolean = false;

  private _queue: QueueItem[] = [];

  private _callback: (config: RequestConfig) => any;

  private _log: Logger;

  constructor({ gap, performRequest }: RateLimiterConfig) {
    this.gap = gap;
    this._callback = performRequest;
    this._log = createLogger("api:ratelimiter");
  }

  public request(req: RequestConfig) {
    return new Promise(async (res, rej) => {
      const queueItem: QueueItem = {
        req,
        resolve: res,
        reject: rej,
      };

      if (!this._working) {
        this._run(queueItem);
      } else {
        this._log.warn("Already an item in queue adding this to the queue.");
        this._queue.push(queueItem);
      }
    });
  }

  private async _run(item: QueueItem) {
    this._log.info(`Performing request`);

    const { resolve, reject, req } = item;
    this._working = true;
    try {
      resolve(await this._callback(req));
    } catch (err) {
      reject(err as Error);
    } finally {
      setTimeout(() => {
        this._runNext();
      }, this.gap);
    }
  }

  private _runNext() {
    const item = this._queue.shift();
    if (item) {
      this._run(item);
    } else {
      this._working = false;
    }
  }

  public isWorking() {
    return this._working;
  }
}
