import { describe, it, expect } from 'vitest';
import { verifyPaidSession } from './verifySession';
import type { TierConfig } from './tiers';

const tiers: TierConfig[] = [
  { slug: 'vibe-coder', priceId: 'price_a' },
  { slug: 'small-company', priceId: 'price_b' },
];

function fakeStripe(session: unknown, shouldThrow = false) {
  return {
    checkout: {
      sessions: {
        retrieve: async () => {
          if (shouldThrow) throw new Error('not found');
          return session;
        },
      },
    },
  };
}

describe('verifyPaidSession', () => {
  it('rejects a missing session id', async () => {
    const result = await verifyPaidSession(undefined, fakeStripe({}), tiers);
    expect(result).toEqual({ ok: false, reason: 'missing_id' });
  });

  it('rejects when Stripe lookup fails', async () => {
    const result = await verifyPaidSession('sess_1', fakeStripe({}, true), tiers);
    expect(result).toEqual({ ok: false, reason: 'not_found' });
  });

  it('rejects an unpaid session', async () => {
    const session = { id: 'sess_1', payment_status: 'unpaid', line_items: { data: [] } };
    const result = await verifyPaidSession('sess_1', fakeStripe(session), tiers);
    expect(result).toEqual({ ok: false, reason: 'unpaid' });
  });

  it('rejects a paid session with an unrecognized price id', async () => {
    const session = {
      id: 'sess_1',
      payment_status: 'paid',
      line_items: { data: [{ price: { id: 'price_unknown' } }] },
    };
    const result = await verifyPaidSession('sess_1', fakeStripe(session), tiers);
    expect(result).toEqual({ ok: false, reason: 'unknown_tier' });
  });

  it('returns the verified session for a paid, known-tier session', async () => {
    const session = {
      id: 'sess_1',
      payment_status: 'paid',
      amount_total: 25000,
      customer_details: { email: 'client@example.com' },
      line_items: { data: [{ price: { id: 'price_b' } }] },
    };
    const result = await verifyPaidSession('sess_1', fakeStripe(session), tiers);
    expect(result).toEqual({
      ok: true,
      session: {
        sessionId: 'sess_1',
        tier: 'small-company',
        amountTotal: 25000,
        customerEmail: 'client@example.com',
      },
    });
  });
});
