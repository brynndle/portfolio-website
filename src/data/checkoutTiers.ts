export interface CheckoutTier {
  slug: string;
  name: string;
  price: number;
  paymentLinkUrl: string;
  persona: string;
  blurb: string;
}

export const CHECKOUT_TIERS: CheckoutTier[] = [
  {
    slug: 'vibe-coder',
    name: 'Vibe Coder',
    price: 250,
    paymentLinkUrl: import.meta.env.STRIPE_PAYMENT_LINK_VIBE_CODER ?? '',
    persona: 'For independent builders',
    blurb:
      "One hour, screen shared, no deck. I'll point out what's broken, what's confusing, and what to fix first.",
  },
  {
    slug: 'small-company',
    name: 'Small Company',
    price: 500,
    paymentLinkUrl: import.meta.env.STRIPE_PAYMENT_LINK_SMALL_COMPANY ?? '',
    persona: 'For small teams',
    blurb:
      'A full audit of your product or site: copy, accessibility, and the friction points costing you customers.',
  },
  {
    slug: 'startup',
    name: 'Startup+',
    price: 3000,
    paymentLinkUrl: import.meta.env.STRIPE_PAYMENT_LINK_STARTUP ?? '',
    persona: 'For startups and up',
    blurb:
      'A deep audit plus prioritized recommendations your team can act on immediately.',
  },
];
