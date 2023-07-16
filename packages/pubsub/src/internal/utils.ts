import { Listener } from "./listener";
import { Fn, ListenerWrap, ParseArgs, Topics } from "./types";

export const replacePlaceholders = <T extends Topics>(
  topic: T,
  values: ParseArgs<T>
) => {
  let readyTopic = "";

  for (let i = 0; i < topic.length; i++) {
    const ch = topic.charAt(i);

    if (ch === "<") {
      const placeholder = topic.slice(
        i + 1,
        topic.indexOf(">", i)
      ) as keyof ParseArgs<T>;
      readyTopic += values[placeholder];

      i = topic.indexOf(">", i);
    } else {
      readyTopic += ch;
    }
  }

  return readyTopic;
};
