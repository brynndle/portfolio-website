import { describe, expect, test } from 'vitest';
import { loadCheckoutTiers } from '../src/data/checkoutTiers';

describe('loadCheckoutTiers', () => {
  test('keeps checkout pages buildable when payment links are not configured', () => {
    const tiers = loadCheckoutTiers({});

    expect(tiers).toHaveLength(3);
    expect(tiers.every((tier) => tier.paymentLinkUrl === undefined)).toBe(true);
  });

  test('uses configured payment links when they are available', () => {
    const tiers = loadCheckoutTiers({
      STRIPE_PAYMENT_LINK_VIBE_CODER: 'https://buy.stripe.com/vibe',
      STRIPE_PAYMENT_LINK_SMALL_COMPANY: 'https://buy.stripe.com/small',
      STRIPE_PAYMENT_LINK_STARTUP: 'https://buy.stripe.com/startup',
    });

    expect(tiers.map((tier) => tier.paymentLinkUrl)).toEqual([
      'https://buy.stripe.com/vibe',
      'https://buy.stripe.com/small',
      'https://buy.stripe.com/startup',
    ]);
  });
});
