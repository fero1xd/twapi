export const splitIrcMessage = (payload: string) => {
  const messages = payload.split("\r\n");
  if (messages[messages.length - 1] === "") {
    messages.pop();
  }

  return messages;
};

export const parseIrcMessage = (message: string) => {};
