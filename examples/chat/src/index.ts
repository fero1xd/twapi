import { AuthProvider, Credentials } from '@twapi/auth';
import { ChatClient } from '@twapi/chat';
import 'dotenv/config';

const credentials = new Credentials(
  process.env.SAMPLE_OAUTH_TOKEN!,
  process.env.CLIENT_ID!,
  process.env.CLIENT_SECRET!
);

const main = async () => {
  const authProvider = new AuthProvider(credentials);

  const chat = new ChatClient(authProvider);

  chat.connect(() => {
    chat.join('shanks_ttv', () => {
      console.log('leaving shanks ttv');

      chat.leave('shanks_ttv');
    });
  });
};

main();
