import { describe, it, expect } from 'vitest';
import { getTierSlugByPriceId, loadTierConfigsFromEnv } from './tiers';

describe('getTierSlugByPriceId', () => {
  it('returns the matching tier slug', () => {
    const tiers = [
      { slug: 'vibe-coder', priceId: 'price_a' },
      { slug: 'small-company', priceId: 'price_b' },
    ];
    expect(getTierSlugByPriceId('price_b', tiers)).toBe('small-company');
  });

  it('returns undefined when no tier matches', () => {
    const tiers = [{ slug: 'vibe-coder', priceId: 'price_a' }];
    expect(getTierSlugByPriceId('price_z', tiers)).toBeUndefined();
  });
});

describe('loadTierConfigsFromEnv', () => {
  it('reads the three tier price IDs from env', () => {
    const env = {
      STRIPE_PRICE_ID_VIBE_CODER: 'price_a',
      STRIPE_PRICE_ID_SMALL_COMPANY: 'price_b',
      STRIPE_PRICE_ID_STARTUP: 'price_c',
    } as NodeJS.ProcessEnv;

    const tiers = loadTierConfigsFromEnv(env);

    expect(tiers).toEqual([
      { slug: 'vibe-coder', priceId: 'price_a' },
      { slug: 'small-company', priceId: 'price_b' },
      { slug: 'startup', priceId: 'price_c' },
    ]);
  });
});
