import { ApiClient } from "../client";
import { BitsApi } from "./bits/bits.api";
import { ChannelApi } from "./channel/channel.api";

export class Resources {
  private _channel: ChannelApi;
  private _bits: BitsApi;

  constructor(_client: ApiClient) {
    this._channel = new ChannelApi(_client);
    this._bits = new BitsApi(_client);
  }

  get channel() {
    return this._channel;
  }

  get bits() {
    return this._bits;
  }
}
