export interface SearchCategoriesResponse {
  box_art_url: string;
  id: string;
  name: string;
}

export interface SearchChannelResponse {
  broadcaster_login: string;
  broadcaster_language: string;
  display_name: string;
  game_id: string;
  game_name: string;
  id: string;
  is_live: boolean;

  /**
   * @deprecated Use `tags` field instead
   */
  tag_ids: string[];

  tags: string[];

  thumbnail_url: string;
  title: string;
  started_at: string;
}
