import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { sendNextStepsEmail } from '../lib/email';
import { readRawBody } from '../lib/rawBody';

export const config = { api: { bodyParser: false } };

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
    res.status(400).send('Webhook signature verification failed');
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email;
    if (email) {
      const resend = new Resend(process.env.RESEND_API_KEY as string);
      const confirmUrl = `https://brynncaputo.com/confirm?session_id=${session.id}`;
      await sendNextStepsEmail(resend, { to: email, confirmUrl, from: 'Brynn Caputo <hi@brynncaputo.com>' });
    }
  }

  res.status(200).json({ received: true });
}
