/**
 * Social Media Services & Growth Marketplace Types (Roadmap F19 & B19).
 * Complies with docs/05-design-system.md, docs/08-security-standards.md, and docs/12-audit-logging.md.
 */

export type SocialPlatform =
  | "instagram"
  | "tiktok"
  | "x_twitter"
  | "facebook"
  | "youtube"
  | "telegram"
  | "linkedin";

export interface PlatformMeta {
  id: SocialPlatform;
  label: string;
  tagline: string;
}

export const SOCIAL_PLATFORMS: PlatformMeta[] = [
  { id: "instagram", label: "Instagram", tagline: "Profiles, followers, & engagement" },
  { id: "tiktok", label: "TikTok", tagline: "Accounts, views, & followers" },
  { id: "x_twitter", label: "X (Twitter)", tagline: "Aged profiles & tweet interactions" },
  { id: "youtube", label: "YouTube", tagline: "Monetized channels & subscribers" },
  { id: "facebook", label: "Facebook", tagline: "Pages & group engagement" },
  { id: "telegram", label: "Telegram", tagline: "Channels & community members" },
];

export interface SocialAccountProduct {
  id: string;
  platform: SocialPlatform;
  platform_label: string;
  handle: string;
  niche: string;
  followers_count: number;
  following_count?: number;
  posts_count?: number;
  creation_year: number;
  is_verified: boolean;
  price: number; // minor units (kobo)
  currency: string;
  status: "available" | "reserved" | "sold";
  masked_login: string;
  masked_recovery: string;
  description: string;
}

export type BoostServiceType =
  | "followers"
  | "likes"
  | "views"
  | "comments"
  | "retweets"
  | "subscribers"
  | "members";

export interface SocialBoostService {
  id: string;
  platform: SocialPlatform;
  platform_label: string;
  service_type: BoostServiceType;
  title: string;
  description: string;
  min_quantity: number;
  max_quantity: number;
  rate_per_thousand: number; // minor units (kobo per 1,000 units)
  delivery_speed: string;
  target_type: "profile_url" | "post_url" | "channel_url" | "handle";
  example_input: string;
}

export interface BuyAccountPayload {
  product_id: string;
  idempotency_key: string;
  pin?: string;
}

export interface BoostOrderPayload {
  service_id: string;
  platform: SocialPlatform;
  target_link: string;
  quantity: number;
  drip_feed?: {
    runs: number;
    interval_minutes: number;
  };
  idempotency_key: string;
}

export interface CredentialRevealResult {
  order_id: string;
  product_id?: string;
  username: string;
  password: string;
  recovery_email: string;
  two_factor_backup_key?: string;
  audit_id: string;
  revealed_at: string;
}
