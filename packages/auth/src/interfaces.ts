export interface GetAppAccessTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export interface GetUserAccessTokenInfoResponse {
  client_id: string;
  login: string;
  scopes: string[];
  user_id: string;
  expires_in: number;
}

export interface GetAppAccessTokenInfoResponse {
  client_id: string;
  scopes: null;
  expires_in: number;
}

export interface RefreshUserAccessTokenResponse
  extends GetAppAccessTokenResponse {
  scopes: string[];
}

export interface IAuthProvider {
  getUserAccessToken(): Promise<string | undefined>;
  getAppAccessToken(): Promise<string | undefined>;

  getUserId(): Promise<string | undefined>;
  getUserName(): Promise<string | undefined>;
  getScopes(): Promise<string[] | undefined>;

  getClientId(): string;
  getClientSecret(): string;
}
