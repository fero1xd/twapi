export interface RequestConfig {
  url: string;

  method: "GET" | "DELETE" | "POST" | "PUT" | "PATCH" | "DELETE";

  query?: Record<string, string>;

  body?: unknown;

  auth?: boolean;
}

export interface QueueItem {
  req: RequestConfig;
  resolve: (res: any) => void;
  reject: (err: Error) => void;
}

export interface HelixResponse<T> {
  data: T[];
}
