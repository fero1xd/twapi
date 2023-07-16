import { PubSub } from "@twapi/pubsub";
import "dotenv/config";

const pubusb = new PubSub(process.env.SAMPLE_OAUTH_TOKEN!);

const listener = pubusb.register("automodQueue", {
  moderator_id: 894734139,
  channel_id: 894734139,
});

listener.onTrigger((d) => {});

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
