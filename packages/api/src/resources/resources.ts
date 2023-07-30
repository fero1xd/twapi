import { ApiClient } from "../client";
import { AnalyticsApi, AnalyticsApiEndpoints } from "./analytics/analytics.api";
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
import { GamesApi, GamesApiEndpoints } from "./games/games.api";
import { GoalsApi, GoalsApiEndpoints } from "./goals/goals.api";
import { GuestStarApi, GuestStarApiEndpoints } from "./guestStar/guestStar.api";
import {
  ModerationApi,
  ModerationApiEndpoints,
} from "./moderation/moderation.api";
import { PollsApi, PollsApiEndpoints } from "./polls/polls.api";
import {
  PredictionsApi,
  PredictionsApiEndpoints,
} from "./predictions/predictions.api";
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
  private _games: GamesApiEndpoints;
  private _analytics: AnalyticsApiEndpoints;
  private _goals: GoalsApiEndpoints;
  private _guestStar: GuestStarApiEndpoints;
  private _moderation: ModerationApiEndpoints;
  private _polls: PollsApiEndpoints;
  private _predictions: PredictionsApiEndpoints;

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
    this._games = new GamesApi(_client);
    this._analytics = new AnalyticsApi(_client);
    this._goals = new GoalsApi(_client);
    this._guestStar = new GuestStarApi(_client);
    this._moderation = new ModerationApi(_client);
    this._polls = new PollsApi(_client);
    this._predictions = new PredictionsApi(_client);
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

  get games() {
    return this._games;
  }

  get analytics() {
    return this._analytics;
  }

  get goals() {
    return this._goals;
  }

  get guestStars() {
    return this._guestStar;
  }

  get moderation() {
    return this._moderation;
  }

  get polls() {
    return this._polls;
  }

  get predictions() {
    return this._predictions;
  }
}
