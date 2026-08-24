import { getTierSlugByPriceId, type TierConfig } from './tiers';

export interface VerifiedSession {
  sessionId: string;
  tier: string;
  amountTotal: number;
  customerEmail: string | null;
}

export type VerifySessionResult =
  | { ok: true; session: VerifiedSession }
  | { ok: false; reason: 'missing_id' | 'not_found' | 'unpaid' | 'unknown_tier' };

export interface StripeCheckoutClient {
  checkout: {
    sessions: {
      retrieve: (id: string, params?: Record<string, unknown>) => Promise<any>;
    };
  };
}

export async function verifyPaidSession(
  sessionId: string | undefined | null,
  stripeClient: StripeCheckoutClient,
  tierConfigs: TierConfig[]
): Promise<VerifySessionResult> {
  if (!sessionId) return { ok: false, reason: 'missing_id' };

  let session: any;
  try {
    session = await stripeClient.checkout.sessions.retrieve(sessionId, { expand: ['line_items'] });
  } catch {
    return { ok: false, reason: 'not_found' };
  }

  if (session.payment_status !== 'paid') return { ok: false, reason: 'unpaid' };

  const priceId = session.line_items?.data?.[0]?.price?.id;
  const tier = priceId ? getTierSlugByPriceId(priceId, tierConfigs) : undefined;
  if (!tier) return { ok: false, reason: 'unknown_tier' };

  return {
    ok: true,
    session: {
      sessionId: session.id,
      tier,
      amountTotal: session.amount_total ?? 0,
      customerEmail: session.customer_details?.email ?? null,
    },
  };
}
