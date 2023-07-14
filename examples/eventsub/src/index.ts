import { EventSub } from "@twapi/eventsub";
import "dotenv/config";

const client = new EventSub(
  process.env.SAMPLE_OAUTH_TOKEN!,
  process.env.CLIENT_ID!
);

const c = client.register("channelUpdate", {
  broadcaster_user_id: "642902413",
});

c.onTrigger((data) => {
  console.log(data.category_name);
  c.unsubscribe();
});

c.onError((error) => {
  console.log(error.getResponse());
});

client.run();
