# @twapi/api

The Twitch API provides the tools and data used to develop Twitch integrations.

## Documentation

Read our [documentation](https://twapi-docs.vercel.app/api/quickstart) for the package usage

## Quickstart

#### 1. Add the following dependencies

```bash
pnpm add @twapi/auth @twapi/api
```

#### 2. Create a new Api Client

```javascript
const credentials = new Credentials(oauthToken, clientId, clientSecret);

const authProvider = new AuthProvider(credentials);
const apiClient = new ApiClient(authProvider);
```

#### 3. Access different resources

```js
const status = await client.moderation.checkAutomodStatus({
  msg_id: "a unique id",
  msg_text: "Check this message please",
});

const chatters = await client.chat.getChatters("broadcaster_id");

for await (const chatter of chatters) {
  console.log(chatter.user_id);
}
```
