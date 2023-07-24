export class HelixError extends Error {
  constructor(
    private readonly _status: number,
    private readonly _method: string,
    private readonly _statusText: string,
    private readonly _url: string,
    private readonly _body: string,
    private _isJson: boolean
  ) {
    super(
      `Encountered HTTP status code ${_status}: ${_statusText}\n\nURL: ${_url}\nMethod: ${_method}\nBody:\n${
        !_isJson && _body.length > 150 ? `${_body.slice(0, 147)}...` : _body
      }`
    );
  }

  /**
   * The HTTP status code of the error.
   */
  get statusCode(): number {
    return this._status;
  }

  /**
   * The URL that was requested.
   */
  get url(): string {
    return this._url;
  }

  /**
   * The HTTP method that was used for the request.
   */
  get method(): string {
    return this._method;
  }

  /**
   * The body that was used for the request, as a string.
   */
  get body(): string {
    return this._body;
  }
}

export class AuthenticationError extends Error {
  constructor() {
    super("Cannot authenticate with your access token");
  }
}
