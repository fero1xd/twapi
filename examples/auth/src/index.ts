import { AuthProvider, Credentials } from "@twapi/auth";
import "dotenv/config";

const main = async () => {
  const credentials = new Credentials(
    process.env.SAMPLE_OAUTH_TOKEN!,
    process.env.CLIENT_ID!,
    process.env.CLIENT_SECRET!
  );

  const auth = new AuthProvider(credentials);

  console.log(await auth.getUserName());

  console.log(await auth.getUserId());
  console.log(await auth.getUserId());
};

main();
