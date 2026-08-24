import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { verifyPaidSession } from '../lib/verifySession';
import { loadTierConfigsFromEnv } from '../lib/tiers';
import { buildIntakeRow, type IntakeFormFields } from '../lib/intakeForm';
import { appendIntakeRow } from '../lib/sheets';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, reason: 'method_not_allowed' });
    return;
  }

  const body = req.body as Partial<{ sessionId: unknown } & Record<keyof IntakeFormFields, unknown>>;

  const isStringArray = (value: unknown): value is string[] =>
    Array.isArray(value) && value.every((item) => typeof item === 'string');

  if (
    typeof body?.sessionId !== 'string' ||
    body.sessionId.length === 0 ||
    typeof body.companyName !== 'string' ||
    typeof body.clientName !== 'string' ||
    typeof body.email !== 'string' ||
    typeof body.description !== 'string' ||
    !isStringArray(body.links) ||
    !isStringArray(body.fileUrls)
  ) {
    res.status(400).json({ ok: false, reason: 'invalid_body' });
    return;
  }

  const { sessionId, ...fields } = body as { sessionId: string } & IntakeFormFields;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const tiers = loadTierConfigsFromEnv(process.env);
  const verifyResult = await verifyPaidSession(sessionId, stripe, tiers);

  if (!verifyResult.ok) {
    res.status(400).json({ ok: false, reason: verifyResult.reason });
    return;
  }

  const row = buildIntakeRow(verifyResult.session, fields);

  try {
    await appendIntakeRow(
      { fetch },
      process.env.GOOGLE_SHEETS_WEBAPP_URL as string,
      process.env.GOOGLE_SHEETS_WEBAPP_SECRET as string,
      row
    );
  } catch {
    res.status(502).json({ ok: false, reason: 'sheet_write_failed' });
    return;
  }

  res.status(200).json({ ok: true });
}
