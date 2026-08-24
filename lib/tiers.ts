export interface TierConfig {
  slug: string;
  priceId: string;
}

export function getTierSlugByPriceId(priceId: string, tiers: TierConfig[]): string | undefined {
  return tiers.find((t) => t.priceId === priceId)?.slug;
}

export function loadTierConfigsFromEnv(env: NodeJS.ProcessEnv): TierConfig[] {
  return [
    { slug: 'vibe-coder', priceId: env.STRIPE_PRICE_ID_VIBE_CODER ?? '' },
    { slug: 'small-company', priceId: env.STRIPE_PRICE_ID_SMALL_COMPANY ?? '' },
    { slug: 'startup', priceId: env.STRIPE_PRICE_ID_STARTUP ?? '' },
  ];
}
