import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { verifyPaidSession } from '../lib/verifySession.js';
import { loadTierConfigsFromEnv } from '../lib/tiers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, reason: 'method_not_allowed' });
    return;
  }

  const sessionId = typeof req.query.session_id === 'string' ? req.query.session_id : undefined;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const tiers = loadTierConfigsFromEnv(process.env);

  const result = await verifyPaidSession(sessionId, stripe, tiers);
  res.status(result.ok ? 200 : 400).json(result);
}
