import { EventSub } from "@twapi/eventsub";
import "dotenv/config";
import { Credentials, AuthProvider } from "@twapi/auth";

const credentials = new Credentials(
  process.env.SAMPLE_OAUTH_TOKEN!,
  process.env.CLIENT_ID!,
  process.env.CLIENT_SECRET!
);

const authProvider = new AuthProvider(credentials);

const client = new EventSub(authProvider);

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
