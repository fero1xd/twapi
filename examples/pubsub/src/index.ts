import { PubSub } from "@twapi/pubsub";
import "dotenv/config";

import { AuthProvider, Credentials } from "@twapi/auth";

const credentials = new Credentials(
  process.env.SAMPLE_OAUTH_TOKEN!,
  process.env.CLIENT_ID!,
  process.env.CLIENT_SECRET!
);

const pubusb = new PubSub(new AuthProvider(credentials));

const listener = pubusb.register("chatModeratorActions", {
  channel_id: 642902413,
  user_id: 642902413,
});

listener.onTrigger((d) => {
  console.log(d.data);
  listener.unsubscribe();
});

listener.onRevocation(() => {
  console.log("revoked");
});

listener.onRegistered(() => {
  console.log("registered");
});

listener.onTimeout(() => {
  console.log("timed out");
});
pubusb.run();
