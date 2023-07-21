export class ApiCredentials {
  private _oauthToken: string;

  private _clientId: string;
  private _appAccessToken: string;

  constructor(oauthToken: string, clientId: string, appAccessToken: string) {
    this._oauthToken = oauthToken;
    this._clientId = clientId;
    this._appAccessToken = appAccessToken;
  }

  public get oauthToken() {
    return this._oauthToken;
  }

  public get clientId() {
    return this._clientId;
  }

  public get appAccessToken() {
    return this._appAccessToken;
  }
}
