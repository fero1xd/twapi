import "dotenv/config";
import { ApiClient } from "@twapi/api";
import { AuthProvider, Credentials } from "@twapi/auth";

const credentials = new Credentials(
  process.env.SAMPLE_OAUTH_TOKEN!,
  process.env.CLIENT_ID!,
  process.env.CLIENT_SECRET!
);

const main = async () => {
  const authProvider = new AuthProvider(credentials);
  const client = new ApiClient(authProvider);

  const res = await client.moderation.checkAutomodStatus({
    msg_id: "2424",
    msg_text: "242424242424",
  });

  console.log(res);
};

main();
