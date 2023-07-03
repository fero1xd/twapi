import { CreateSubscriptionRequest, ValidSubscription } from "./types";
import axios from "axios";

/**
 *
 * Use this function to create a subscription
 *
 * @param token A user token
 * @param sub Name of a valid subscription. See ValidSubscription type
 * @param clientId Application id
 */
export const createSubscription = async <TSub extends ValidSubscription>(
  token: string,
  clientId: string,
  body: CreateSubscriptionRequest<TSub>
) => {
  try {
    const res = await axios.post(
      "https://api.twitch.tv/helix/eventsub/subscriptions",
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Client-Id": clientId,
        },
      }
    );
    console.log(res.data);
  } catch (e) {
    console.log(e);
  }
};
