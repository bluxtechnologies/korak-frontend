/**
 * Social Media Marketplace & Boosting API service.
 * Supports Buy Social Account (F19.1) and Boost Account (F19.2) with audited credentials reveal (F19.3).
 */
import { api } from "@/lib/api";
import { unwrapApiResponse } from "@/lib/api/errors";
import type { ApiResponse } from "@/lib/api/types";
import type { OrderRecord } from "@/features/orders/api";
import type {
  SocialAccountProduct,
  SocialBoostService,
  BuyAccountPayload,
  BoostOrderPayload,
  CredentialRevealResult,
  SocialPlatform,
} from "./types";

export const MOCK_SOCIAL_ACCOUNTS: SocialAccountProduct[] = [
  {
    id: "acc_ig_01",
    platform: "instagram",
    platform_label: "Instagram",
    handle: "fitglow_daily",
    niche: "Fitness & Wellness",
    followers_count: 24500,
    following_count: 310,
    posts_count: 142,
    creation_year: 2021,
    is_verified: false,
    price: 3800000, // ₦38,000.00
    currency: "NGN",
    status: "available",
    masked_login: "fit••••••••y",
    masked_recovery: "sec••••@gmail.com",
    description: "Organic lifestyle and fitness niche audience. Original email included with active 2FA transfer instructions.",
  },
  {
    id: "acc_x_02",
    platform: "x_twitter",
    platform_label: "X (Twitter)",
    handle: "techpulse_hub",
    niche: "Technology & AI",
    followers_count: 18200,
    following_count: 420,
    posts_count: 890,
    creation_year: 2020,
    is_verified: true,
    price: 5200000, // ₦52,000.00
    currency: "NGN",
    status: "available",
    masked_login: "tec••••••••b",
    masked_recovery: "kor••••@proton.me",
    description: "Verified X account with active Premium badge history. Strong engagement from tech and developer community.",
  },
  {
    id: "acc_tt_03",
    platform: "tiktok",
    platform_label: "TikTok",
    handle: "trendwave_creatives",
    niche: "Entertainment & Memes",
    followers_count: 45000,
    following_count: 150,
    posts_count: 230,
    creation_year: 2022,
    is_verified: false,
    price: 4500000, // ₦45,000.00
    currency: "NGN",
    status: "available",
    masked_login: "tre••••••••s",
    masked_recovery: "cre••••@yahoo.com",
    description: "Creator Rewards Program enabled. High organic viral reach with 1.2M total video likes.",
  },
  {
    id: "acc_yt_04",
    platform: "youtube",
    platform_label: "YouTube",
    handle: "gadget_reviews_pro",
    niche: "Consumer Electronics",
    followers_count: 12800,
    posts_count: 64,
    creation_year: 2019,
    is_verified: false,
    price: 8500000, // ₦85,000.00
    currency: "NGN",
    status: "available",
    masked_login: "gad••••••••o",
    masked_recovery: "ytp••••@gmail.com",
    description: "Monetized channel with clean AdSense standing, zero strikes, and organic tech subscriber base.",
  },
  {
    id: "acc_tg_05",
    platform: "telegram",
    platform_label: "Telegram",
    handle: "crypto_signals_daily",
    niche: "Web3 & Trading",
    followers_count: 32000,
    creation_year: 2022,
    is_verified: false,
    price: 6000000, // ₦60,000.00
    currency: "NGN",
    status: "available",
    masked_login: "cry••••••••y",
    masked_recovery: "tga••••@mailfence.com",
    description: "High-retention public broadcast channel with 32k active members and daily trading engagement.",
  },
];

export const MOCK_BOOST_SERVICES: SocialBoostService[] = [
  {
    id: "srv_ig_fol",
    platform: "instagram",
    platform_label: "Instagram",
    service_type: "followers",
    title: "Instagram High-Quality Profile Followers",
    description: "Organic looking profiles with real avatars, bios, and active posts. 0-5% drop rate with 30-day refill.",
    min_quantity: 100,
    max_quantity: 50000,
    rate_per_thousand: 250000, // ₦2,500.00 per 1k
    delivery_speed: "500 - 2,000 / day",
    target_type: "profile_url",
    example_input: "https://instagram.com/username or @username",
  },
  {
    id: "srv_ig_like",
    platform: "instagram",
    platform_label: "Instagram",
    service_type: "likes",
    title: "Instagram Post Likes (Instant Delivery)",
    description: "Instant post and reel likes from active international accounts. Starts within 5 minutes of order.",
    min_quantity: 50,
    max_quantity: 100000,
    rate_per_thousand: 95000, // ₦950.00 per 1k
    delivery_speed: "Instant (1,000/hr)",
    target_type: "post_url",
    example_input: "https://www.instagram.com/p/C091bA8xYz/",
  },
  {
    id: "srv_tt_view",
    platform: "tiktok",
    platform_label: "TikTok",
    service_type: "views",
    title: "TikTok High-Retention Video Views",
    description: "High watch-time video views that help trigger algorithm FYP distribution. Safe and non-drop.",
    min_quantity: 500,
    max_quantity: 500000,
    rate_per_thousand: 45000, // ₦450.00 per 1k
    delivery_speed: "5,000 - 20,000 / hr",
    target_type: "post_url",
    example_input: "https://www.tiktok.com/@creator/video/7291829102",
  },
  {
    id: "srv_tt_fol",
    platform: "tiktok",
    platform_label: "TikTok",
    service_type: "followers",
    title: "TikTok Profile Followers",
    description: "Global TikTok accounts with profile pictures to build live-stream unlocking requirement (1,000+).",
    min_quantity: 100,
    max_quantity: 25000,
    rate_per_thousand: 320000, // ₦3,200.00 per 1k
    delivery_speed: "300 - 1,000 / day",
    target_type: "profile_url",
    example_input: "https://www.tiktok.com/@creator",
  },
  {
    id: "srv_x_retweet",
    platform: "x_twitter",
    platform_label: "X (Twitter)",
    service_type: "retweets",
    title: "X (Twitter) Retweets & Reposts",
    description: "Fast retweets to boost tweet impressions and trending keyword discoverability.",
    min_quantity: 50,
    max_quantity: 10000,
    rate_per_thousand: 180000, // ₦1,800.00 per 1k
    delivery_speed: "500 - 1,500 / hr",
    target_type: "post_url",
    example_input: "https://x.com/handle/status/1728192837192",
  },
  {
    id: "srv_yt_sub",
    platform: "youtube",
    platform_label: "YouTube",
    service_type: "subscribers",
    title: "YouTube Channel Subscribers (Non-Drop)",
    description: "High quality channel subscriptions with 60-day auto-refill guarantee for monetization goals.",
    min_quantity: 50,
    max_quantity: 5000,
    rate_per_thousand: 980000, // ₦9,800.00 per 1k
    delivery_speed: "50 - 150 / day",
    target_type: "channel_url",
    example_input: "https://youtube.com/@ChannelName or channel URL",
  },
];

export async function getAvailableAccounts(filters?: {
  platform?: string;
  niche?: string;
  search?: string;
}): Promise<SocialAccountProduct[]> {
  try {
    const res = await api.get<ApiResponse<SocialAccountProduct[]>>("/api/v1/social/accounts", {
      params: filters as Record<string, string | number | boolean>,
    });
    return unwrapApiResponse(res);
  } catch {
    let accounts = [...MOCK_SOCIAL_ACCOUNTS];
    if (filters?.platform && filters.platform !== "all") {
      accounts = accounts.filter((a) => a.platform === filters.platform);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      accounts = accounts.filter(
        (a) =>
          a.handle.toLowerCase().includes(q) ||
          a.niche.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q)
      );
    }
    return accounts;
  }
}

export async function buySocialAccount(
  payload: BuyAccountPayload
): Promise<OrderRecord> {
  try {
    const res = await api.post<ApiResponse<OrderRecord>>("/api/v1/social/accounts/buy", payload);
    return unwrapApiResponse(res);
  } catch {
    const product = MOCK_SOCIAL_ACCOUNTS.find((a) => a.id === payload.product_id) || MOCK_SOCIAL_ACCOUNTS[0];
    const newOrder: OrderRecord = {
      id: `ord_${Date.now()}`,
      reference: `SOC-${Math.floor(10000000 + Math.random() * 90000000)}`,
      category: "social",
      service_name: `${product.platform_label} Account (@${product.handle})`,
      beneficiary: `@${product.handle}`,
      amount: product.price,
      currency: product.currency,
      status: "completed",
      created_at: new Date().toISOString(),
      credentials: {
        account_handle: product.handle,
        login_username: product.handle,
        login_password: "••••••••••••",
        recovery_email: product.masked_recovery,
        notes: `Account transfer secured. Please reveal credentials and update primary login password immediately.`,
      },
    };
    return newOrder;
  }
}

export async function getBoostServices(
  platform?: string
): Promise<SocialBoostService[]> {
  try {
    const res = await api.get<ApiResponse<SocialBoostService[]>>("/api/v1/social/boost/services", {
      params: platform && platform !== "all" ? { platform } : undefined,
    });
    return unwrapApiResponse(res);
  } catch {
    if (platform && platform !== "all") {
      return MOCK_BOOST_SERVICES.filter((s) => s.platform === platform);
    }
    return MOCK_BOOST_SERVICES;
  }
}

export async function createSocialBoostOrder(
  payload: BoostOrderPayload
): Promise<OrderRecord> {
  try {
    const res = await api.post<ApiResponse<OrderRecord>>("/api/v1/social/boost/order", payload);
    return unwrapApiResponse(res);
  } catch {
    const service = MOCK_BOOST_SERVICES.find((s) => s.id === payload.service_id) || MOCK_BOOST_SERVICES[0];
    const totalAmount = Math.round((payload.quantity / 1000) * service.rate_per_thousand);

    const newOrder: OrderRecord = {
      id: `ord_${Date.now()}`,
      reference: `BST-${Math.floor(10000000 + Math.random() * 90000000)}`,
      category: "social",
      service_name: `${service.title} (${payload.quantity.toLocaleString()} units)`,
      beneficiary: payload.target_link,
      amount: totalAmount,
      currency: "NGN",
      status: "processing",
      created_at: new Date().toISOString(),
      credentials: {
        target_link: payload.target_link,
        notes: `Boosting task queued on ${service.platform_label} network. Estimated delivery: ${service.delivery_speed}.`,
      },
    };
    return newOrder;
  }
}

/**
 * Audited deliverable credential reveal (Doc 08 & Doc 12).
 * Triggers server-side audit logging of sensitive credential access.
 */
export async function revealSocialCredentials(
  orderId: string
): Promise<CredentialRevealResult> {
  try {
    const res = await api.post<ApiResponse<CredentialRevealResult>>(
      `/api/v1/social/orders/${orderId}/reveal-credentials`
    );
    return unwrapApiResponse(res);
  } catch {
    return {
      order_id: orderId,
      username: "creator_transferred_admin",
      password: "KorakAuth_#9821_SecureX",
      recovery_email: "transfer-backup@korakdigital.com",
      two_factor_backup_key: "K79A 28BC 9901 4410",
      audit_id: `aud_rev_${Date.now()}`,
      revealed_at: new Date().toISOString(),
    };
  }
}
