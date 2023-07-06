import { EventSub } from "@twapi/eventsub";
import "dotenv/config";

const client = new EventSub(
  process.env.SAMPLE_OAUTH_TOKEN!,
  process.env.CLIENT_ID!
);

client.run(() => {
  console.log("[*] Successfuly connected on client");
  const channelUpdate = client.register("channelUpdate", {
    broadcaster_user_id: "123456",
  });

  channelUpdate.onTrigger((d) => {
    console.log(d);
  });

  channelUpdate.onError(() => {
    console.log("[*] Subscription creation failed");
  });
});
