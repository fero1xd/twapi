import { PubSub } from "@twapi/pubsub";
import "dotenv/config";

import { AuthProvider, Credentials } from "@twapi/auth";

const credentials = new Credentials(
  process.env.SAMPLE_OAUTH_TOKEN!,
  process.env.CLIENT_ID!,
  process.env.CLIENT_SECRET!
);

const pubusb = new PubSub(new AuthProvider(credentials));

pubusb.run(async () => {
  const listener = pubusb.register("whispers", {
    user_id: 642902413,
  });

  listener.onTrigger(async (d) => {
    console.log(d.data_object.recipient);

    await listener.unsubscribe();
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
});
