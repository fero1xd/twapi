export interface RequestConfig {
  url: string;

  method: "GET" | "DELETE" | "POST" | "PUT" | "PATCH" | "DELETE";

  query?: Record<string, any>;

  body?: unknown;

  oauth: boolean;
}

export interface QueueItem {
  req: RequestConfig;
  resolve: (res: any) => void;
  reject: (err: Error) => void;
}

export interface HelixResponse<T> {
  data: T[];
}

// The Pagination object is empty if there are no more pages to return in the direction you’re paging.
export interface HelixPaginatedResponse<T> extends HelixResponse<T> {
  pagination?: {
    cursor?: string;
  };
}

export interface ValidateTokenResponse {
  client_id: string;
  login: string;
  scopes: string[];
  user_id: string;
  expires_in: number;
}
