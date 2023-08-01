import { createLogger } from "@twapi/logger";
import { HelixError } from "../errors";
import { RequestConfig, ValidateTokenResponse } from "./interfaces";
import fetch, { Headers } from "cross-fetch";

const HELIX_URL = "https://api.twitch.tv/helix/";
const log = createLogger("twapi:api");

export default async function callApi(
  config: RequestConfig,
  clientId: string,
  appAccessToken: string,
  oauthToken?: string
) {
  const { oauth, method, url, body } = config;

  const headers = new Headers();

  headers.set("Client-Id", clientId);
  if (body) {
    headers.set("Content-Type", "application/json");
  }

  headers.set("Authorization", `Bearer ${oauth ? oauthToken : appAccessToken}`);

  let parsedUrl = url;
  if (config.query) {
    parsedUrl += "?";
    Object.entries(config.query).forEach((v, i) => {
      parsedUrl += `${i > 0 ? "&" : ""}${v[0]}=${v[1]}`;
    });
  }

  const response = await fetch(encodeURI(`${HELIX_URL}${parsedUrl}`), {
    method: method,
    body: JSON.stringify(body),
    headers,
  });
  await handlerApiError(response, config);

  return response;
}

const handlerApiError = async (response: Response, config: RequestConfig) => {
  // TODO: Throw seperate errors for scopes
  if (!response.ok) {
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");

    const text = isJson
      ? JSON.stringify(await response.json(), null, 2)
      : await response.text();

    throw new HelixError(
      response.status,
      config.method ?? "GET",
      response.statusText,
      response.url,
      text,
      isJson == undefined ? false : isJson
    );
  }
};

export async function transformTwitchApiResponse<T>(
  response: Response
): Promise<T> {
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const text = await response.text();

  if (!text) {
    return undefined as unknown as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch (_) {
    log.warn("JSON.parse() failed returning raw text");
    return text as T;
  }
}

export async function validateToken(accessToken: string) {
  const config: RequestConfig = {
    url: "https://id.twitch.tv/oauth2/validate",
    method: "GET",
    oauth: true,
  };

  const res = await fetch(config.url, {
    headers: {
      Authorization: `OAuth ${accessToken}`,
    },
  });

  await handlerApiError(res, config);

  return transformTwitchApiResponse<ValidateTokenResponse>(res);
}
