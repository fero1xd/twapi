export interface RequestConfig {
  url: string;

  method: "GET" | "DELETE" | "POST" | "PUT" | "PATCH" | "DELETE";

  query?: Record<string, string | undefined>;

  body?: unknown;

  oauth?: boolean;
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
  total: number;
  pagination?: {
    cursor?: string;
  };
}
