# @twapi/pubsub

PubSub enables you to subscribe to a topic, for updates (e.g. when a user cheers in a channel).

The Twitch PubSub system allows back-end services to broadcast realtime messages to clients. Example applications include:

- An instant messaging service sending instant messages between friends.
- A back-end video system pushing real-time viewer count updates to video players.
- A presence system broadcasting users’ online status to all their friends.

Refer to the twitch's official [documentation](https://dev.twitch.tv/docs/pubsub/) for more information

## Documentation

Read our [documentation](https://twapi-docs.vercel.app/pubsub/quickstart) for the pubsub system

## Quickstart

#### 1. Add the following dependency

```bash
pnpm add @twapi/pubsub
```

#### 2. Instantiate Client instance

```javascript
const pubsub = new PubSub(process.env.SAMPLE_OAUTH_TOKEN);

pubsub.run(() => {
  console.log("[+] Successfully connected");
});
```

#### 3. Listen on events

```javascript
const listener = pubusb.register("chatModeratorActions", {
  channel_id: 1234567,
  user_id: 1234567,
});

listener.onTrigger((data) => {
  console.log(data.type);

  listener.unsubscribe();
});

listener.onError((error) => {
  console.log(error);
});

listener.onRevocation(() => {
  console.log("[-] Listener revoked");
});

listener.onTimeout(() => {
  console.log("[-] Timed out");
});
```
