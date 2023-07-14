import { PubSub } from "@twapi/pubsub";
import "dotenv/config";

const pubusb = new PubSub(process.env.SAMPLE_OAUTH_TOKEN!);

pubusb.run(async () => {
  try {
    const listener = await pubusb.register("whispers", {
      user_id: 642902413,
    });

    listener.onTrigger(console.log);

    listener.onRevocation(() => {
      console.log("revoked");
    });

    listener.onError((error) => {
      console.log(error);
    });
  } catch (err) {
    console.log(err);
  }
});
