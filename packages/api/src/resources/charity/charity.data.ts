import { BroadcasterInfo, UserInfo } from "../../internal/types";

interface CampaignAmount {
  value: number;
  decimal_places: number;
  currency: string;
}

export interface CharityCampaign extends BroadcasterInfo {
  id: string;
  charity_name: string;
  charity_description: string;
  charity_logo: string;
  charity_website: string;
  current_amount: CampaignAmount;
  target_amount: CampaignAmount;
}

export interface CharityDonation extends UserInfo {
  id: string;
  campaign_id: string;
  amount: CampaignAmount;
}
