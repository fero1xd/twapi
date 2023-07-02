export type Subscribtion = string;

export type InitialSubscribtions = [string, ...string[]];

export type WebsocketMessage = {
  metadata: {
    message_id: string;
    message_type: string;
    message_timestamp: string;
  };
  payload: {
    session?: {
      id: string;
      status: string;
      keepalive_timeout_seconds: string;
      reconnectUrl: string | null;
      connected_at: string;
    };
  };
};
