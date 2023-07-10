import {
  CreateSubResponse,
  CreateSubscriptionRequest,
  ValidSubscription,
} from "./types";
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
  const res = await axios.post<CreateSubResponse>(
    "https://api.twitch.tv/helix/eventsub/subscriptions",
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": clientId,
      },
    }
  );

  return res.data.data[0].id;
};

/**
 *
 * Use this function to delete a subscription
 *
 * @param id Subscription Id
 * @param sub Name of a valid subscription. See ValidSubscription type
 * @param clientId Application id
 */
export const deleteSubscription = async (
  id: string,
  token: string,
  clientId: string
) => {
  await axios.delete(
    `https://api.twitch.tv/helix/eventsub/subscriptions?id=${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": clientId,
      },
    }
  );
};
