import "dotenv/config";
import { ApiClient, ApiCredentials } from "@twapi/api";

const credentials = new ApiCredentials(
  process.env.SAMPLE_OAUTH_TOKEN!,
  process.env.CLIENT_ID!,
  process.env.SAMPLE_APP_ACCESS_TOKEN!
);

const main = async () => {
  const client = new ApiClient(credentials);

  const q = {
    moderator_id: "642902413",
    broadcaster_id: "642902413",
  };

  const res = await client.channel.getChannelsInformation([
    "70225218",
    "642902413",
  ]);

  console.log(res);
};

main();
