import "dotenv/config";
import { ApiClient, ApiCredentials } from "@twapi/api";

const credentials = new ApiCredentials(
  process.env.SAMPLE_OAUTH_TOKEN!,
  process.env.CLIENT_ID!,
  process.env.SAMPLE_APP_ACCESS_TOKEN!
);

const main = async () => {
  const client = new ApiClient(credentials);

  const games = await client.games.getTopGames();

  for await (const game of games) {
    console.log(game);
  }
};

main();
