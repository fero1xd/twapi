export interface Report {
  extension_id: string;
  URL: string;
  type: string;
  date_range: {
    started_at: string;
    ended_at: string;
  };
}

export interface GameReport extends Omit<Report, "extension_id"> {
  game_id: string;
}

export interface GetExtensionAnalyticsQuery {
  extension_id?: string;
  type?: "overview_v2";
  started_at?: string;
  ended_at?: string;
}

export interface GetGameAnalyticsQuery
  extends Omit<GetExtensionAnalyticsQuery, "extension_id"> {
  game_id?: string;
}
