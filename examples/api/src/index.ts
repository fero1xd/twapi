import "dotenv/config";
import { ApiClient, ApiCredentials } from "@twapi/api";

const credentials = new ApiCredentials(
  process.env.SAMPLE_OAUTH_TOKEN!,
  process.env.CLIENT_ID!,
  "dawd"
);

const main = async () => {
  const client = new ApiClient(credentials);

  const status = await client.channel.startCommerical("642902413", 60);
  console.log(status);
};

main();
