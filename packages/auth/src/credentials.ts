export class Credentials {
  private _oauthToken: string;
  private _oauthTokenExpires?: Date;
  private _refreshToken?: string;

  private _clientId: string;
  private _clientSecret: string;

  private _appAccessToken?: string;
  private _appAccessTokenExpires?: Date;

  constructor(
    oauthToken: string,
    clientId: string,
    clientSecret: string,
    refreshToken?: string
  ) {
    this._oauthToken = oauthToken;
    this._refreshToken = refreshToken;
    this._clientId = clientId;
    this._clientSecret = clientSecret;
  }

  public get oauthToken() {
    return this._oauthToken;
  }

  public get refreshToken() {
    return this._refreshToken;
  }

  public get clientId() {
    return this._clientId;
  }

  public get appAccessToken() {
    return this._appAccessToken;
  }

  public get appAccessTokenExpires() {
    return this._appAccessTokenExpires;
  }

  public get oauthTokenExpires() {
    return this._oauthTokenExpires;
  }

  public get clientSecret() {
    return this._clientSecret;
  }

  public setOAuthToken(newToken: string) {
    this._oauthToken = newToken;
  }

  public setOAuthTokenExpires(newExp: Date) {
    this._oauthTokenExpires = newExp;
  }

  public setAppAccessToken(newToken: string) {
    this._appAccessToken = newToken;
  }

  public setAppAccessTokenExpiration(newExp: Date) {
    this._appAccessTokenExpires = newExp;
  }
}
