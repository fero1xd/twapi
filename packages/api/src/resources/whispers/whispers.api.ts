import { ApiClient } from "../../client";

export interface WhisperEndpoints {
  /**
     * Sends a whisper message to the specified user.
     * NOTE: The user sending the whisper must have a verified phone number (see the Phone Number setting in your Security and Privacy settings).

     * NOTE: The API may silently drop whispers that it suspects of violating Twitch policies. (The API does not indicate that it dropped the whisper; it returns a 204 status code as if it succeeded.)

     * **Rate Limits**: You may whisper to a maximum of 40 unique recipients per day. Within the per day limit, you may whisper a maximum of 3 whispers per second and a maximum of 100 whispers per minute.
     
     * @param to The ID of the user to receive the whisper.
     * @param message The whisper message to send. The message must not be empty.
        The maximum message lengths are:
        500 characters if the user you're sending the message to hasn't whispered you before.
        10,000 characters if the user you're sending the message to has whispered you before.
        Messages that exceed the maximum length are truncated.
     */
  sendWhisper(to: string, message: string): Promise<void>;
}

export class WhispersApi implements WhisperEndpoints {
  constructor(private _client: ApiClient) {}

  async sendWhisper(to: string, message: string) {
    const from = await this._client.getUserId();

    await this._client.enqueueCall({
      url: "whispers",
      method: "POST",
      oauth: true,
      query: { from_user_id: from, to_user_id: to },
      body: { message },
    });
  }
}
