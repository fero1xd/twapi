import { PubSub } from "@twapi/pubsub";
import "dotenv/config";

const pubusb = new PubSub(process.env.SAMPLE_OAUTH_TOKEN!);

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

listener.onError((error) => {
  console.log(error);
});

listener.onTimeout(() => {
  console.log("timed out");
});
pubusb.run();
