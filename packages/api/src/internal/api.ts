import { RequestConfig } from "./interfaces";

export default async function callApi(
  config: RequestConfig,
  clientId: string,
  oauthToken?: string
) {
  const { auth, method, url, body } = config;

  const headers = new Headers();

  headers.set("Client-Id", clientId);

  if (auth) {
    headers.set("Authorization", `Bearer ${oauthToken}`);
  }

  return await fetch(url, {
    method: method,
    body: JSON.stringify(body),
    headers,
  });
}
