export const splitIrcMessage = (payload: string) => {
  const messages = payload.split('\r\n');
  if (messages[messages.length - 1] === '') {
    messages.pop();
  }

  return messages;
};

export enum MessageCodes {
  LOGIN_SUCCESSFUL = '001',
  GLOBALUSERSTATE = 'GLOBALUSERSTATE',
  JOIN = 'JOIN',
}
