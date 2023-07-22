import "dotenv/config";
import { ApiClient, ApiCredentials } from "@twapi/api";

const credentials = new ApiCredentials(
  process.env.SAMPLE_OAUTH_TOKEN!,
  process.env.CLIENT_ID!,
  "dawd"
);

const main = async () => {
  const client = new ApiClient(credentials);

  const res = await client.channel.getChannelInformation("64202413");
  console.log(res);
};

main();
