import { CreateSubscriptionRequestFailed, EventSub } from "@twapi/eventsub";
import "dotenv/config";

const client = new EventSub(
  process.env.SAMPLE_OAUTH_TOKEN!,
  process.env.CLIENT_ID!
);

client.run(() => {
  const channelUpdate = client.register("channelUpdate", {
    broadcaster_user_id: "642902413",
  });

  channelUpdate.onTrigger((d) => {
    console.log(d.category_name);
  });

  channelUpdate.onError((e) => {
    console.log(e.getMessage());
    console.log(e.getResponse());
  });

  channelUpdate.onRevocation((reason) => {
    console.log(reason);
  });
});
