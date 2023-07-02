import { CreateSubscriptionRequest, ValidSubscription } from "./types";
import axios from "axios";

/**
 *
 * Use this function to create a subscription
 *
 * @param sub Name of a valid subscription. See ValidSubscription type
 */
export const createSubscription = async <TSub extends ValidSubscription>(
  body: CreateSubscriptionRequest<TSub>
) => {
  try {
    axios.post("https://api.twitch.tv/helix/eventsub/subscriptions", body);
  } catch (e) {}
};
