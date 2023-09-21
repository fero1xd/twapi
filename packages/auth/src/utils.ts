import { type LoggerType } from '@twapi/logger';
import { Credentials } from './credentials';
import {
  GetAppAccessTokenInfoResponse,
  GetAppAccessTokenResponse,
  GetUserAccessTokenInfoResponse,
  RefreshUserAccessTokenResponse,
} from './interfaces';
import { fetch, Headers } from 'cross-fetch';

export const fetchAppAccessToken = async (
  credentials: Credentials,
  _log: LoggerType
) => {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');

  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      grant_type: 'client_credentials',
    }),
  });

  if (!res.ok) {
    _log.error(`Fetch App access token failed.`);
    console.log(await res.text());
    return;
  }

  const text = await res.text();

  if (!text) {
    return;
  }

  return JSON.parse(text) as GetAppAccessTokenResponse;
};

export const fetchAccessTokenInfo = async <
  T extends GetUserAccessTokenInfoResponse | GetAppAccessTokenInfoResponse
>(
  token: string,
  app: boolean,
  _log: LoggerType
) => {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.set('Authorization', `${app ? 'Bearer' : 'OAuth'} ${token}`);

  const res = await fetch('https://id.twitch.tv/oauth2/validate', {
    headers,
  });

  if (!res.ok) {
    _log.error(`Fetch ${app ? 'App' : 'User'} Access token info failed.`);
    console.log(await res.text());
    return;
  }

  const text = await res.text();

  if (!text) {
    return;
  }

  return JSON.parse(text) as T;
};

export const refreshUserAccessToken = async (
  credentials: Credentials,
  _log: LoggerType
) => {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');

  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: credentials.refreshToken,
    }),
  });

  if (!res.ok) {
    _log.error('Refresh user access token request failed.');
    console.log(await res.text());
    return;
  }

  const text = await res.text();

  if (!text) {
    return;
  }

  return JSON.parse(text) as RefreshUserAccessTokenResponse;
};

export const getExpirationDate = (exp: number) => {
  const d = new Date();

  d.setSeconds(d.getSeconds() + exp);
  return d;
};
