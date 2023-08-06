import { ApiClient } from "../../client";
import {
  HelixPaginatedResponse,
  HelixResponse,
  RequestConfig,
} from "../../internal/interfaces";
import { HelixPaginatedResponseIterator } from "../HelixPaginatedResponse";
import { createBroadcasterQuery } from "../common.data";
import {
  ActiveExtension,
  BasicUser,
  BlockUserQuery,
  Extension,
  UpdateExtensionBody,
  User,
} from "./users.data";

export interface UsersApiEndpoints {
  /**
   * Gets information about one or more users.
   *
   * @param userId The ID of the user to get.
   *
   * @returns Found user with the same user id
   */
  getUserbyId(userId: string): Promise<User>;

  /**
   * Gets information about one or more users.
   *
   * @param userIds The list of IDs of the user to get.
   *
   * @returns The list of users
   */
  getUsersbyId(userIds: string[]): Promise<User[]>;

  /**
   * Gets information about one or more users.
   *
   * @param login The login name of the user to get.
   *
   * @returns Found user with the same login
   */
  getUserByName(login: string): Promise<User>;

  /**
   * Gets information about one or more users.
   *
   * @param logins The login names of the user to get.
   *
   * @returns The list of users
   */
  getUsersByName(logins: string[]): Promise<User[]>;

  /**
   * Updates the specified user’s information. The user ID in the OAuth token identifies the user whose information you want to update.
   *
   * @param description The string to update the channel’s description to. The description is limited to a maximum of 300 characters.
   *
   * @retusn The updated user
   */
  updateUser(description?: string): Promise<User>;

  /**
   * Gets the list of users that the broadcaster has blocked.
   *
   * @param broadcasterId The ID of the broadcaster whose list of blocked users you want to get.
   *
   * @returns The list of blocked users
   */
  getBlockedList(
    broadcasterId: string
  ): Promise<HelixPaginatedResponseIterator<BasicUser>>;

  /**
   * Blocks the specified user from interacting with or having contact with the broadcaster. The user ID in the OAuth token identifies the broadcaster who is blocking the user.
   *
   * @param query Data related to ban a user
   */
  blockUser(query: BlockUserQuery): Promise<void>;

  /**
   * Removes the user from the broadcaster’s list of blocked users. The user ID in the OAuth token identifies the broadcaster who’s removing the block.
   *
   * @param userId The ID of the user to remove from the broadcaster’s list of blocked users. The API ignores the request if the broadcaster hasn’t blocked the user.
   */
  unblockUser(userId: string): Promise<void>;

  /**
   * Gets a list of all extensions (both active and inactive) that the broadcaster has installed. The user ID in the access token identifies the broadcaster.
   *
   * @returns The list of extensions that the user has installed.
   */
  getUserExtensions(): Promise<Extension[]>;

  /**
   * Gets the active extensions that the broadcaster has installed for each configuration.
   *
   * @returns The active extensions that the broadcaster has installed.
   */
  getUserActiveExtensions(): Promise<ActiveExtension>;

  /**
   * Updates an installed extension’s information. You can update the extension’s activation state, ID, and version number. The user ID in the access token identifies the broadcaster whose extensions you’re updating.
   *
   * @param data The extensions to update
   *
   * @returns The Updated Extension
   */
  updateUserExtension(data: UpdateExtensionBody): Promise<ActiveExtension>;
}

export class UsersApi implements UsersApiEndpoints {
  constructor(private _client: ApiClient) {}

  async getUserbyId(userId: string) {
    const res = await this._client.enqueueCall<HelixResponse<User>>({
      url: "users",
      method: "GET",
      query: { id: userId },
      oauth: false,
    });

    return res.data[0];
  }

  async getUsersbyId(userIds: string[]) {
    const res = await this._client.enqueueCall<HelixResponse<User>>({
      url: "users",
      method: "GET",
      query: { id: userIds },
      oauth: false,
    });

    return res.data;
  }

  async getUserByName(login: string) {
    const res = await this._client.enqueueCall<HelixResponse<User>>({
      url: "users",
      method: "GET",
      query: { login: login },
      oauth: false,
    });

    return res.data[0];
  }

  async getUsersByName(logins: string[]) {
    const res = await this._client.enqueueCall<HelixResponse<User>>({
      url: "users",
      method: "GET",
      query: { login: logins },
      oauth: false,
    });

    return res.data;
  }

  async updateUser(description?: string) {
    const res = await this._client.enqueueCall<HelixResponse<User>>({
      url: "users",
      method: "PUT",
      query: { description: description ?? "" },
      oauth: true,
    });

    return res.data[0];
  }

  async getBlockedList(broadcasterId: string) {
    const config: RequestConfig = {
      url: "users/blocks",
      method: "GET",
      query: createBroadcasterQuery(broadcasterId),
      oauth: true,
    };

    const res = await this._client.enqueueCall<
      HelixPaginatedResponse<BasicUser>
    >(config);
    return new HelixPaginatedResponseIterator(res, this._client, config);
  }

  async blockUser(query: BlockUserQuery) {
    await this._client.enqueueCall({
      url: "users/blocks",
      query,
      oauth: true,
      method: "PUT",
    });
  }

  async unblockUser(userId: string) {
    await this._client.enqueueCall({
      url: "users/blocks",
      query: { target_user_id: userId },
      oauth: true,
      method: "PUT",
    });
  }

  async getUserExtensions() {
    const res = await this._client.enqueueCall<HelixResponse<Extension>>({
      url: "users/extensions/list",
      method: "GET",
      oauth: true,
    });

    return res.data;
  }
  async getUserActiveExtensions() {
    const res = await this._client.enqueueCall<{ data: ActiveExtension }>({
      url: "users/extensions",
      method: "GET",
      oauth: true,
    });

    return res.data;
  }

  async updateUserExtension(
    data: UpdateExtensionBody
  ): Promise<ActiveExtension> {
    const res = await this._client.enqueueCall<{ data: ActiveExtension }>({
      url: "users/extensions",
      method: "PUT",
      body: { data },
      oauth: true,
    });

    return res.data;
  }
}
