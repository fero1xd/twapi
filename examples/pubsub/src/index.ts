import { PubSub } from "@twapi/pubsub";
import "dotenv/config";

const pubusb = new PubSub(process.env.SAMPLE_OAUTH_TOKEN!);

pubusb.run(() => {
  const listener = pubusb.register("whispers", {
    user_id: 642902413,
  });

  listener.onTrigger((d) => {
    console.log(d);
    listener.unsubscribe();
  });

  listener.onRevocation(() => {
    console.log("revoked");
  });

  listener.onError((error) => {
    console.log(error);
  });
});
