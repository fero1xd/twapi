import "dotenv/config";
import { ApiClient, ApiCredentials } from "@twapi/api";

const credentials = new ApiCredentials(
  process.env.SAMPLE_OAUTH_TOKEN!,
  process.env.CLIENT_ID!,
  "dawd"
);

const main = async () => {
  const client = new ApiClient(credentials);

  // const channels = await client.channel.getFollowedChannels("642902413");

  const leaderboard = await client.channelPoints.getCustomRewardRedemption({
    broadcaster_id: "642902413",
    reward_id: "dwad",
    status: "CANCELED",
  });
  console.log(leaderboard);
};

main();
