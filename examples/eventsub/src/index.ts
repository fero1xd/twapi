import { EventSub } from "@twapi/eventsub";
import "dotenv/config";

const client = new EventSub(
  process.env.SAMPLE_OAUTH_TOKEN!,
  process.env.CLIENT_ID!
);

client.run(() => {
  console.log("[*] Successfuly connected on client");
  // const channelUpdate = client.register("channelBan", {
  //   broadcaster_user_id: "123456",
  // });

  // channelUpdate.onTrigger((d) => {
  //   console.log(d);
  // });

  // channelUpdate.onError((e) => {
  //   console.log("[*] Subscription creation failed");
  //   console.log(e.getResponse());
  // });
});
