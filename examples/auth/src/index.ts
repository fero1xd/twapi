import { AuthProvider, Credentials } from "@twapi/auth";
import "dotenv/config";

const main = async () => {
  const credentials = new Credentials(
    process.env.SAMPLE_OAUTH_TOKEN!,
    process.env.CLIENT_ID!,
    process.env.CLIENT_SECRET!
  );

  const auth = new AuthProvider(credentials);

  console.log(await auth.getUserAccessToken());

  console.log(auth.getUserName());
};

main();
