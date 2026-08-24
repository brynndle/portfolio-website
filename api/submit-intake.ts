import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { google } from 'googleapis';
import { verifyPaidSession } from '../lib/verifySession';
import { loadTierConfigsFromEnv } from '../lib/tiers';
import { buildIntakeRow, type IntakeFormFields } from '../lib/intakeForm';
import { appendIntakeRow } from '../lib/sheets';

function getSheetsClient() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, reason: 'method_not_allowed' });
    return;
  }

  const { sessionId, ...fields } = req.body as { sessionId: string } & IntakeFormFields;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const tiers = loadTierConfigsFromEnv(process.env);
  const verifyResult = await verifyPaidSession(sessionId, stripe, tiers);

  if (!verifyResult.ok) {
    res.status(400).json({ ok: false, reason: verifyResult.reason });
    return;
  }

  const row = buildIntakeRow(verifyResult.session, fields);

  try {
    await appendIntakeRow(getSheetsClient(), process.env.GOOGLE_SHEET_ID as string, row);
  } catch {
    res.status(502).json({ ok: false, reason: 'sheet_write_failed' });
    return;
  }

  res.status(200).json({ ok: true });
}
