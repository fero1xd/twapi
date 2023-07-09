import { EventSub } from "@twapi/eventsub";
import "dotenv/config";

const client = new EventSub(
  process.env.SAMPLE_OAUTH_TOKEN!,
  process.env.CLIENT_ID!
);

client.run(() => {
  setTimeout(() => {
    const channelUpdate = client.register("channelUpdate", {
      broadcaster_user_id: "642902413",
    });
    channelUpdate.onTrigger((d) => {
      console.log(d);
    });
  }, 2000);
});
