import { ApiClient } from "../../client";
import {
  HelixPaginatedResponse,
  HelixResponse,
  RequestConfig,
} from "../../internal/interfaces";
import { HelixPaginatedResponseIterator } from "../HelixPaginatedResponse";
import {
  ChannelPrediction,
  CreatePredictionBody,
  EndPredictionBody,
  GetPredictionsQuery,
} from "./predictions.data";

export interface PredictionsApiEndpoints {
  /**
   * Gets a list of Channel Points Predictions that the broadcaster created.
   *
   * @param query The broadcaster's id and optional prediction id to get
   *
   * @returns A paginated list of channel points prediction
   */
  getPredictions(
    query: GetPredictionsQuery
  ): Promise<HelixPaginatedResponseIterator<ChannelPrediction>>;

  /**
   * Creates a Channel Points Prediction.
     With a Channel Points Prediction, the broadcaster poses a question and viewers try to predict the outcome. The prediction runs as soon as it’s created. The broadcaster may run only one prediction at a time.
   
   * @param body Data related to create a prediction
     
   * @returns The created prediction
   */
  createPrediction(body: CreatePredictionBody): Promise<ChannelPrediction>;

  /**
   * Locks, resolves, or cancels a Channel Points Prediction.
   *
   * @param body Data related to end a prediction
   *
   * @returns The ended prediction
   */
  endPrediction(body: EndPredictionBody): Promise<ChannelPrediction>;
}

export class PredictionsApi implements PredictionsApiEndpoints {
  constructor(private _client: ApiClient) {}

  async getPredictions(query: GetPredictionsQuery) {
    const config: RequestConfig = {
      url: "predictions",
      method: "GET",
      oauth: true,
      query,
    };

    const res = await this._client.enqueueCall<
      HelixPaginatedResponse<ChannelPrediction>
    >(config);

    return new HelixPaginatedResponseIterator(res, this._client, config);
  }

  async createPrediction(body: CreatePredictionBody) {
    const res = await this._client.enqueueCall<
      HelixResponse<ChannelPrediction>
    >({
      url: "predictions",
      method: "POST",
      oauth: true,
      body,
    });

    return res.data[0];
  }

  async endPrediction(body: EndPredictionBody) {
    const res = await this._client.enqueueCall<
      HelixResponse<ChannelPrediction>
    >({
      url: "predictions",
      method: "PATCH",
      oauth: true,
      body,
    });

    return res.data[0];
  }
}
