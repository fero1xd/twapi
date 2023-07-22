import { ApiClient } from "../../client";
import { HelixResponse } from "../../internal/interfaces";
import { ChannelInformation } from "./channel.data";

interface ChannelApiPoints {
  getChannelInformation(broadcasterId: string): void;
}

export class ChannelApi implements ChannelApiPoints {
  private readonly _client: ApiClient;

  constructor(client: ApiClient) {
    this._client = client;
  }

  /**
   * Gets information about one or more channels.
   *
   * @param broadcasterId The ID of the broadcaster whose channel you want to get
   */
  async getChannelInformation(broadcasterId: string) {
    const res = await this._client.callApi<HelixResponse<ChannelInformation>>({
      url:
        "https://api.twitch.tv/helix/channels?broadcaster_id=" + broadcasterId,
      method: "GET",
      auth: true,
    });

    return res.data[0];
  }
}
