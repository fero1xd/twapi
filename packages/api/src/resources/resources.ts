import { ApiClient } from "../client";
import { BitsApi, BitsApiEndpoints } from "./bits/bits.api";
import { ChannelApi, ChannelApiEndPoints } from "./channel/channel.api";
import {
  ChannelPointsApi,
  ChannelPointsApiEndpoints,
} from "./channelPoints/channelPoints.api";
import { CharityApi, CharityApiEndpoints } from "./charity/charity.api";
import { ChatApi, ChatApiEndpoints } from "./chat/chat.api";
import { ClipApi, ClipApiEndpoints } from "./clip/clip.api";
import {
  EntitlementsApi,
  EntitlementsApiEndpoints,
} from "./entitlements/entitlements.api";
import { EventSubApi, EventSubApiEndpoints } from "./eventsub/eventsub.api";
import { UsersApi, UsersApiEndpoints } from "./users/users.api";
import { WhisperEndpoints, WhispersApi } from "./whispers/whispers.api";

export class Resources {
  private _channel: ChannelApiEndPoints;
  private _bits: BitsApiEndpoints;
  private _channelPoints: ChannelPointsApiEndpoints;
  private _charity: CharityApiEndpoints;
  private _chat: ChatApiEndpoints;
  private _clip: ClipApiEndpoints;
  private _entitlements: EntitlementsApiEndpoints;
  private _whispers: WhisperEndpoints;
  private _users: UsersApiEndpoints;
  private _eventsub: EventSubApiEndpoints;

  constructor(_client: ApiClient) {
    this._channel = new ChannelApi(_client);
    this._bits = new BitsApi(_client);
    this._channelPoints = new ChannelPointsApi(_client);
    this._charity = new CharityApi(_client);
    this._chat = new ChatApi(_client);
    this._clip = new ClipApi(_client);
    this._entitlements = new EntitlementsApi(_client);
    this._whispers = new WhispersApi(_client);
    this._users = new UsersApi(_client);
    this._eventsub = new EventSubApi(_client);
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

  get whispers() {
    return this._whispers;
  }

  get users() {
    return this._users;
  }

  get eventsub() {
    return this._eventsub;
  }
}
