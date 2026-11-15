/**
 * Guest Copy and Content Dictionary
 *
 * All guest-facing copy lives in this file.
 * Following project requirements:
 * - Every sentence is marked as [DRAFT].
 * - No invented statistics, customer counts, testimonials, or uptime/speed promises.
 * - No prices or payment method names.
 * - Security claims limited strictly to verified Doc 08 protections.
 * - Privacy & Terms drafts cover verified architecture; unconfirmed items are marked [TO BE CONFIRMED: ...].
 */

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  iconName: "Phone" | "Wifi" | "Shield" | "Users" | "TrendingUp";
}

export interface HowItWorksStep {
  step: number;
  title: string;
  description: string;
}

export interface SecurityProtection {
  id: string;
  title: string;
  description: string;
  iconName: "ShieldCheck" | "KeyRound" | "EyeOff";
}

export interface LegalSection {
  id: string;
  title: string;
  paragraphs: string[];
}

export interface LegalDocument {
  title: string;
  lastUpdated: string;
  description: string;
  sections: LegalSection[];
}

export interface GuestContent {
  brand: {
    name: string;
    tagline: string;
  };
  navigation: {
    servicesLabel: string;
    howItWorksLabel: string;
    securityLabel: string;
    loginLabel: string;
    registerLabel: string;
  };
  hero: {
    h1: string;
    support: string;
    ctaPrimary: string;
    ctaSecondary: string;
    photoSlot: {
      fileName: string;
      pixelSize: string;
      aspectRatio: string;
      subject: string;
      altText: string;
    };
  };
  services: {
    sectionTitle: string;
    sectionDescription: string;
    items: ServiceItem[];
  };
  howItWorks: {
    sectionTitle: string;
    sectionDescription: string;
    steps: HowItWorksStep[];
  };
  security: {
    sectionTitle: string;
    sectionDescription: string;
    items: SecurityProtection[];
  };
  closingCta: {
    title: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  footer: {
    description: string;
    copyright: string;
    links: {
      services: string;
      howItWorks: string;
      security: string;
      terms: string;
      privacy: string;
      login: string;
      register: string;
    };
  };
  legalReviewed: boolean;
  legalDraftNotice: {
    title: string;
    message: string;
  };
  privacyPolicy: LegalDocument;
  termsOfService: LegalDocument;
}

export const GUEST_CONTENT: GuestContent = {
  brand: {
    name: "Korak Digitals",
    tagline: "[DRAFT] Digital Services & Marketplace",
  },
  navigation: {
    servicesLabel: "Services",
    howItWorksLabel: "How it works",
    securityLabel: "Security & Trust",
    loginLabel: "Log in",
    registerLabel: "Create account",
  },
  hero: {
    h1: "[DRAFT] Digital telecom services, encrypted bandwidth, and social account growth.",
    support:
      "[DRAFT] Manage mobile connectivity bundles, private VPN tokens, and social profile services through a unified account balance.",
    ctaPrimary: "Create account",
    ctaSecondary: "Log in",
    photoSlot: {
      fileName: "hero-dashboard-preview.png",
      pixelSize: "1280x800",
      aspectRatio: "16:10",
      subject: "Clean dashboard interface showing service catalog and orders overview",
      altText: "Korak Digitals account dashboard showing available services and wallet overview",
    },
  },
  services: {
    sectionTitle: "[DRAFT] Services",
    sectionDescription:
      "[DRAFT] Five essential digital services provided through a single verified platform.",
    items: [
      {
        id: "airtime",
        title: "Airtime",
        description:
          "[DRAFT] Mobile airtime top-ups available across supported telecommunications carriers.",
        iconName: "Phone",
      },
      {
        id: "data",
        title: "Data",
        description:
          "[DRAFT] Cellular data packages for personal and business mobile devices.",
        iconName: "Wifi",
      },
      {
        id: "vpn",
        title: "VPN",
        description:
          "[DRAFT] Encrypted virtual private network connections with masked credentials.",
        iconName: "Shield",
      },
      {
        id: "buy-social",
        title: "Buy social media accounts",
        description:
          "[DRAFT] Established social media account profiles delivered through secure credential transfer.",
        iconName: "Users",
      },
      {
        id: "boost-social",
        title: "Boost social media accounts",
        description:
          "[DRAFT] Audience growth and visibility enhancements across major social platforms.",
        iconName: "TrendingUp",
      },
    ],
  },
  howItWorks: {
    sectionTitle: "[DRAFT] How it works",
    sectionDescription:
      "[DRAFT] Three simple steps to order and manage digital services.",
    steps: [
      {
        step: 1,
        title: "Create an account",
        description:
          "[DRAFT] Register with a username or email and establish a strong password.",
      },
      {
        step: 2,
        title: "Add funds to your wallet",
        description:
          "[DRAFT] Fund your personal account balance before placing service orders.",
      },
      {
        step: 3,
        title: "Choose a service and place your order",
        description:
          "[DRAFT] Select your desired service, enter delivery details, and monitor status updates.",
      },
    ],
  },
  security: {
    sectionTitle: "[DRAFT] Security and trust",
    sectionDescription:
      "[DRAFT] Technical protections built directly into the account and order workflow.",
    items: [
      {
        id: "verification-new-devices",
        title: "Verification on new devices",
        description:
          "[DRAFT] Sign-ins from unrecognised devices or browsers require one-time verification codes sent to your registered email.",
        iconName: "ShieldCheck",
      },
      {
        id: "repeated-login-protection",
        title: "Protection against repeated login attempts",
        description:
          "[DRAFT] Account access is safeguarded with automatic rate limits and temporary lockouts after repeated failed attempts.",
        iconName: "KeyRound",
      },
      {
        id: "sensitive-details-masked",
        title: "Sensitive details hidden by default",
        description:
          "[DRAFT] Order credentials, vouchers, and VPN connection tokens remain masked until you explicitly reveal them.",
        iconName: "EyeOff",
      },
    ],
  },
  closingCta: {
    title: "[DRAFT] Ready to place your order?",
    description:
      "[DRAFT] Create an account to get started, or sign in to access your existing wallet balance and active orders.",
    ctaPrimary: "Register",
    ctaSecondary: "Log in",
  },
  footer: {
    description:
      "[DRAFT] Centralised digital services, connectivity packages, and account management.",
    copyright: "© 2026 Korak Digitals. All rights reserved.",
    links: {
      services: "Services",
      howItWorks: "How it works",
      security: "Security & Trust",
      terms: "Terms of Service",
      privacy: "Privacy Policy",
      login: "Log in",
      register: "Create account",
    },
  },
  legalReviewed: false,
  legalDraftNotice: {
    title: "Draft, pending legal review",
    message:
      "This document is a technical draft reflecting current system architecture and security standards. It has not been reviewed by legal counsel and contains unconfirmed items awaiting formal review.",
  },
  privacyPolicy: {
    title: "[DRAFT] Privacy Policy",
    lastUpdated: "[TO BE CONFIRMED: Last updated date]",
    description:
      "[DRAFT] Information on how Korak Digitals collects, handles, and protects your personal and operational account data.",
    sections: [
      {
        id: "account-data",
        title: "1. Account Data We Collect",
        paragraphs: [
          "[DRAFT] When you register an account, we collect your chosen username, registered email address, and a securely salted bcrypt hash of your password. We never store or transmit your plaintext password.",
          "[DRAFT] If you optionally update your account profile, we store your full name and display preferences solely to personalize your dashboard interface.",
        ],
      },
      {
        id: "device-verification",
        title: "2. Device Information Used for Verification",
        paragraphs: [
          "[DRAFT] In accordance with our security standards, we collect device identifiers, browser user-agent details, and IP addresses when you sign in.",
          "[DRAFT] This telemetry is used strictly to identify unrecognised devices or browsers and prompt for one-time verification codes (OTP) before granting access, protecting your account from unauthorised takeover.",
        ],
      },
      {
        id: "orders-transactions",
        title: "3. Order and Transaction Records",
        paragraphs: [
          "[DRAFT] We maintain records of all customer transactions, including wallet balance funding, service order references, transaction amounts, timestamps, and order lifecycle states.",
          "[DRAFT] For fulfilled orders (such as airtime recharges, data packages, VPN bandwidth allocations, and social media account services), we record service-specific delivery metadata in an immutable ledger.",
        ],
      },
      {
        id: "security-audit-logs",
        title: "4. Security and Audit Logs",
        paragraphs: [
          "[DRAFT] To maintain system integrity and detect fraudulent activity, our application logs authentication events, failed login attempts, lockout events, password reset requests, and active device sessions.",
          "[DRAFT] These logs are append-only and accessible exclusively by authorised operational services for security investigation.",
        ],
      },
      {
        id: "cookies",
        title: "5. Cookies and Local Storage",
        paragraphs: [
          "[DRAFT] We use only essential session cookies and cross-site request forgery (CSRF) tokens necessary to establish and authenticate your encrypted session with the application API.",
          "[TO BE CONFIRMED: Policy regarding any non-essential cookies, analytics, or third-party tracking technologies]",
        ],
      },
      {
        id: "data-retention",
        title: "6. Data Retention",
        paragraphs: [
          "[TO BE CONFIRMED: Specific retention periods for user profile data, financial ledger entries, and security audit logs]",
        ],
      },
      {
        id: "contact",
        title: "7. Contact and Inquiries",
        paragraphs: [
          "[TO BE CONFIRMED: Official corporate entity name, registered address, and designated privacy contact email]",
        ],
      },
    ],
  },
  termsOfService: {
    title: "[DRAFT] Terms of Service",
    lastUpdated: "[TO BE CONFIRMED: Last updated date]",
    description:
      "[DRAFT] Terms governing your access to and use of the Korak Digitals platform, wallet, and marketplace services.",
    sections: [
      {
        id: "account-responsibilities",
        title: "1. Account Responsibilities",
        paragraphs: [
          "[DRAFT] You must provide accurate and verifiable account information during registration. You are responsible for safeguarding your login credentials and maintaining the secrecy of your password and verification codes.",
          "[DRAFT] Any actions, orders, or transactions initiated through your authenticated account session are presumed to be authorised by you.",
        ],
      },
      {
        id: "acceptable-use",
        title: "2. Acceptable Use",
        paragraphs: [
          "[DRAFT] You agree to use Korak Digitals solely for legitimate commercial and personal digital services. Prohibited conduct includes attempting unauthorized system access, reverse engineering, automated scraping, API rate-limit evasion, and fraudulent order placement.",
          "[DRAFT] Violation of acceptable use standards may result in immediate account suspension, access revocation, or permanent termination.",
        ],
      },
      {
        id: "wallet-orders",
        title: "3. Wallet and Orders",
        paragraphs: [
          "[DRAFT] Orders are executed against your available digital wallet balance. You must ensure your wallet contains sufficient funds prior to submitting an order.",
          "[DRAFT] Once an order is confirmed, the corresponding amount is deducted from your balance and recorded in the immutable transaction ledger.",
        ],
      },
      {
        id: "refunds",
        title: "4. Refunds and Adjustments",
        paragraphs: [
          "[TO BE CONFIRMED: Official refund policy, criteria for failed order reversals, and dispute resolution timeframes per Doc 14 (OPEN)]",
        ],
      },
      {
        id: "service-availability",
        title: "5. Service Availability",
        paragraphs: [
          "[DRAFT] We endeavor to provide reliable service operation, but services may be subject to interruptions, delays, or outages originating from telecommunications carriers, network providers, or scheduled system maintenance.",
          "[DRAFT] We do not warrant uninterrupted or error-free transmission across third-party cellular or social platform networks.",
        ],
      },
      {
        id: "limitation-liability",
        title: "6. Limitation of Liability",
        paragraphs: [
          "[TO BE CONFIRMED: Statutory limitation of liability, exclusion of indirect damages, and maximum liability caps]",
        ],
      },
      {
        id: "governing-law",
        title: "7. Governing Law",
        paragraphs: [
          "[TO BE CONFIRMED: Legal jurisdiction, applicable governing law, and dispute resolution forum]",
        ],
      },
      {
        id: "contact",
        title: "8. Contact Information",
        paragraphs: [
          "[TO BE CONFIRMED: Formal legal contact address and inquiries email]",
        ],
      },
    ],
  },
};
