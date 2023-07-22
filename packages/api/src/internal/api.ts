import { HelixError } from "./errors";
import { RequestConfig } from "./interfaces";
import fetch, { Headers } from "cross-fetch";

export default async function callApi(
  config: RequestConfig,
  clientId: string,
  appAccessToken: string,
  oauthToken?: string
) {
  const { auth, method, url, body } = config;

  const headers = new Headers();

  headers.set("Client-Id", clientId);

  if (auth) {
    headers.set(
      "Authorization",
      `Bearer ${auth ? oauthToken : appAccessToken}`
    );
  }

  const response = await fetch(url, {
    method: method,
    body: JSON.stringify(body),
    headers,
  });
  await handlerApiError(response, config);

  return response;
}

const handlerApiError = async (response: Response, config: RequestConfig) => {
  if (!response.ok) {
    const isJson = response.headers.get("Content-Type") === "application/json";
    const text = isJson
      ? JSON.stringify(await response.json(), null, 2)
      : await response.text();

    throw new HelixError(
      response.status,
      config.method ?? "GET",
      response.statusText,
      config.url,
      text,
      isJson
    );
  }
};

export async function transformTwitchApiResponse<T>(
  response: Response
): Promise<T> {
  if (response.status === 204) {
    return undefined as unknown as T; // oof
  }

  const text = await response.text();

  if (!text) {
    return undefined as unknown as T; // mega oof - Twitch doesn't return a response when it should
  }

  return JSON.parse(text) as T;
}
