import { ApiClient } from "../client";
import { BitsApi } from "./bits/bits.api";
import { ChannelApi } from "./channel/channel.api";
import { ChannelPointsApi } from "./channelPoints/channelPoints.api";
import { CharityApi } from "./charity/charity.api";
import { ChatApi } from "./chat/chat.api";
import { ClipApi } from "./clip/clip.api";
import { EntitlementsApi } from "./entitlements/entitlements.api";

export class Resources {
  private _channel: ChannelApi;
  private _bits: BitsApi;
  private _channelPoints: ChannelPointsApi;
  private _charity: CharityApi;
  private _chat: ChatApi;
  private _clip: ClipApi;
  private _entitlements: EntitlementsApi;

  constructor(_client: ApiClient) {
    this._channel = new ChannelApi(_client);
    this._bits = new BitsApi(_client);
    this._channelPoints = new ChannelPointsApi(_client);
    this._charity = new CharityApi(_client);
    this._chat = new ChatApi(_client);
    this._clip = new ClipApi(_client);
    this._entitlements = new EntitlementsApi(_client);
  }

  get channel() {
    return this._channel;
  }

  get bits() {
    return this._bits;
  }

  get channelPoints() {
    return this._channelPoints;
  }

  get charity() {
    return this._charity;
  }

  get chat() {
    return this._chat;
  }
  get clip() {
    return this._clip;
  }

  get entitlements() {
    return this._entitlements;
  }
}
