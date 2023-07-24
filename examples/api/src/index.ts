import "dotenv/config";
import { ApiClient, ApiCredentials } from "@twapi/api";

const credentials = new ApiCredentials(
  process.env.SAMPLE_OAUTH_TOKEN!,
  process.env.CLIENT_ID!,
  process.env.SAMPLE_APP_ACCESS_TOKEN!
);

const main = async () => {
  const client = new ApiClient(credentials);

  const chatters = await client.chat.getChatters("64290213", "642902413");

  for await (const ch of chatters) {
    console.log(ch);
  }
};

main();
