import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { sendNextStepsEmail } from '../lib/email';
import { readRawBody } from '../lib/rawBody';

// Note: `readRawBody` works because Vercel's Node runtime buffers and replays
// the request body stream, not because of any `bodyParser` config (that's a
// Next.js API-route convention that @vercel/node does not read). Do not
// re-add a `config.api.bodyParser` export expecting it to affect this.

const DEFAULT_EMAIL_FROM = 'Brynn Caputo <hi@brynncaputo.com>';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const signature = req.headers['stripe-signature'];
  const rawBody = await readRawBody(req);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature as string, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch {
    console.error('Stripe webhook signature verification failed');
    res.status(400).send('Webhook signature verification failed');
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email;
    if (email) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY as string);
        const siteUrl = process.env.SITE_URL ?? 'https://brynncaputo.com';
        const confirmUrl = `${siteUrl}/confirm?session_id=${session.id}`;
        const emailFrom = process.env.EMAIL_FROM ?? DEFAULT_EMAIL_FROM;
        await sendNextStepsEmail(resend, { to: email, confirmUrl, from: emailFrom });
      } catch (error) {
        // Best-effort second channel — /confirm's own flow is the primary path.
        // Don't fail the webhook so Stripe doesn't retry and risk duplicate emails.
        console.error('Failed to send next-steps email', error);
      }
    }
  }

  res.status(200).json({ received: true });
}
