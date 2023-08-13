import { type LoggerType, createLogger } from "@twapi/logger";
import { Credentials } from "./credentials";
import { GetUserAccessTokenInfoResponse, IAuthProvider } from "./interfaces";
import {
  fetchAccessTokenInfo,
  fetchAppAccessToken,
  getExpirationDate,
  refreshUserAccessToken,
} from "./utils";

export class AuthProvider implements IAuthProvider {
  private readonly _credentials: Credentials;
  private readonly _log: LoggerType;

  private _scopes?: string[];

  private _userId?: string;
  private _userLogin?: string;

  private _initialUserTokenRequest = false;

  constructor(credentials: Credentials) {
    this._credentials = credentials;
    this._log = createLogger("twapi:auth");
  }

  async getScopes() {
    if (!this._initialUserTokenRequest) {
      await this.getUserAccessToken();
    }
    return this._scopes;
  }

  async getUserId() {
    if (!this._initialUserTokenRequest) {
      await this.getUserAccessToken();
    }
    return this._userId;
  }

  async getUserName() {
    if (!this._initialUserTokenRequest) {
      await this.getUserAccessToken();
    }
    return this._userLogin;
  }

  getClientId() {
    return this._credentials.clientId;
  }

  getClientSecret() {
    return this._credentials.clientSecret;
  }

  async getUserAccessToken() {
    const expiresIn = this._credentials.oauthTokenExpires;
    const oauthToken = this._credentials.oauthToken;
    const refreshToken = this._credentials.refreshToken;

    // Everything is good !
    if (expiresIn && expiresIn > new Date()) {
      return oauthToken;
    }

    // First time calling this method
    if (!expiresIn) {
      const tokenInfo =
        await fetchAccessTokenInfo<GetUserAccessTokenInfoResponse>(
          oauthToken,
          false,
          this._log
        );

      // If token was valid and not expired
      if (tokenInfo) {
        this._initialUserTokenRequest = true;

        if (tokenInfo.client_id !== this._credentials.clientId) {
          this._log.error(
            "Client id in the user access token doesnt matches the client id passed in."
          );

          return oauthToken;
        }

        this._log.info("Got user access token for the first time.");

        this._userId = tokenInfo.user_id;
        this._userLogin = tokenInfo.login;
        this._scopes = tokenInfo.scopes;
        this._credentials.setOAuthTokenExpires(
          getExpirationDate(tokenInfo.expires_in)
        );

        return oauthToken;
      }

      if (refreshToken) {
        const accessToken = await this._refreshUserAccessToken();
        this._initialUserTokenRequest = true;
        if (accessToken) {
          return accessToken;
        } else {
          this._log.warn(
            "No refresh token provided, cannot refresh user access token."
          );
        }
      }

      this._initialUserTokenRequest = true;
      return oauthToken;
    }

    // User Access token expired
    if (new Date() > this._credentials.oauthTokenExpires!) {
      // If refresh token was provided, just refresh the token
      if (refreshToken) {
        const accessToken = await this._refreshUserAccessToken();
        if (accessToken) {
          return accessToken;
        } else {
          this._log.warn(
            "Tried to refresh user access token but didnt get any response."
          );
        }
      } else {
        this._log.warn(
          "No refresh token provided, cannot refresh user access token."
        );
      }
    }

    // Return old oauth token
    return oauthToken;
  }

  async getAppAccessToken() {
    const expiresIn = this._credentials.appAccessTokenExpires;
    const appAccessToken = this._credentials.appAccessToken;

    // Everything is good !
    if (appAccessToken && expiresIn && expiresIn > new Date()) {
      return this._credentials.appAccessToken;
    }

    // First time calling this method
    if (!appAccessToken || !expiresIn) {
      const newAppToken = await this._fetchAppAccessToken();
      if (newAppToken) {
        this._log.info("Got app access token for this first time.");
        return newAppToken;
      }
    }

    // App access token expired !
    if (expiresIn && new Date() > expiresIn) {
      this._log.warn("App access token expired, trying to get a new one.");

      const newAppToken = await this._fetchAppAccessToken();
      if (newAppToken) return newAppToken;
    }
  }

  private async _refreshUserAccessToken() {
    const newToken = await refreshUserAccessToken(this._credentials, this._log);
    if (newToken) {
      this._log.info("Successfully got a new user access token.");

      this._credentials.setOAuthToken(newToken.access_token);
      this._credentials.setOAuthTokenExpires(
        getExpirationDate(newToken.expires_in)
      );

      return newToken.access_token;
    }
  }

  private async _fetchAppAccessToken() {
    const newAppToken = await fetchAppAccessToken(this._credentials, this._log);
    if (newAppToken) {
      this._credentials.setAppAccessToken(newAppToken.access_token);

      this._credentials.setAppAccessTokenExpiration(
        getExpirationDate(newAppToken.expires_in)
      );
      return newAppToken.access_token;
    }
  }
}
