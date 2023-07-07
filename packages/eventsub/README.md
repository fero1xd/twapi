# @twapi/eventsub

This package allows you to listen to events like

- A broadcaster came online
- A broadcaster changes stream title, game etc.
- An user got banned in a channel

Refer to the twitch's official [documentation](https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types) for more events

## Usage

1. You first have to get an oauth access token to use the eventsub system as we use websocket that requires an user access token to listen on any event
2. Read our [documentation](https://twapi-docs.vercel.app) for the eventsub system
