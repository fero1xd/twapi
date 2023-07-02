import { EventSub } from "@twapi/eventsub";

const client = new EventSub(["a"]);

client.run();
