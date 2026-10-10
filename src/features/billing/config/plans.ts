export interface PlanConfig {
  key: string;
  name: string;
  price: number;
  stripePriceId: string;
  credits: number;
  unit?: string;
  features: string[];
}

export const PLANS: Record<string, PlanConfig> = {
  free: {
    key: "free",
    name: process.env.NEXT_PUBLIC_PLAN_FREE_NAME || "Free",
    price: 0,
    stripePriceId: "",
    credits: 100,
    unit: "credits",
    features: [
      "1 workspace seat",
      "Core API & dashboard access",
      "Community support",
      "Standard rate limits",
    ],
  },
  pro: {
    key: "pro",
    name: process.env.NEXT_PUBLIC_PLAN_PRO_NAME || "Pro",
    price: Number(process.env.NEXT_PUBLIC_PLAN_PRO_PRICE || 49),
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || "price_pro_default",
    credits: 5000,
    unit: "credits",
    features: [
      "Up to 10 workspace seats",
      "Full API & webhooks access",
      "Priority asynchronous queues",
      "GitHub & third-party integrations",
      "Email engineering support",
    ],
  },
  enterprise: {
    key: "enterprise",
    name: process.env.NEXT_PUBLIC_PLAN_ENTERPRISE_NAME || "Enterprise",
    price: Number(process.env.NEXT_PUBLIC_PLAN_ENTERPRISE_PRICE || 299),
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || "price_enterprise_default",
    credits: 50000,
    unit: "credits",
    features: [
      "Unlimited workspace seats",
      "Dedicated worker capacity",
      "Custom SLA & audit export",
      "SAML / Enterprise SSO",
      "24/7 dedicated account manager",
    ],
  },
};

export type PlanKey = "free" | "pro" | "enterprise";

export const PLAN_KEYS: PlanKey[] = ["free", "pro", "enterprise"];

export const PLAN_RANK: Record<string, number> = {
  free: 0,
  pro: 1,
  enterprise: 2,
};
