import { describe, it, expect } from 'vitest';
import { buildIntakeRow } from './intakeForm';
import type { VerifiedSession } from './verifySession';

const session: VerifiedSession = {
  sessionId: 'sess_1',
  tier: 'small-company',
  amountTotal: 50000,
  customerEmail: 'stripe-known@example.com',
};

describe('buildIntakeRow', () => {
  it('uses the submitted email when provided', () => {
    const row = buildIntakeRow(
      session,
      {
        companyName: 'Acme',
        clientName: 'Jane Client',
        email: 'jane@acme.com',
        description: 'Checkout converts poorly.',
        links: ['https://acme.com'],
        fileUrls: [],
      },
      new Date('2026-08-24T00:00:00.000Z')
    );

    expect(row).toEqual({
      timestamp: '2026-08-24T00:00:00.000Z',
      sessionId: 'sess_1',
      tier: 'small-company',
      amount: 50000,
      companyName: 'Acme',
      clientName: 'Jane Client',
      email: 'jane@acme.com',
      description: 'Checkout converts poorly.',
      links: ['https://acme.com'],
      fileUrls: [],
    });
  });

  it('falls back to the Stripe session email when the form email is blank', () => {
    const row = buildIntakeRow(
      session,
      {
        companyName: 'Acme',
        clientName: 'Jane Client',
        email: '',
        description: 'Checkout converts poorly.',
        links: [],
        fileUrls: [],
      },
      new Date('2026-08-24T00:00:00.000Z')
    );

    expect(row.email).toBe('stripe-known@example.com');
  });
});
