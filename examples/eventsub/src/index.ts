import { EventSub } from "@twapi/eventsub";
import "dotenv/config";

const client = new EventSub(
  process.env.SAMPLE_OAUTH_TOKEN!,
  process.env.CLIENT_ID!
);

client.run(() => {
  const c = client.register("streamOnline", {
    broadcaster_user_id: "642902413",
  });

  c.onTrigger((data) => {
    console.log(data.type);
  });
});
