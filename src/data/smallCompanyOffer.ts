// Offer facts for the $500 Small Company concept page.
// Deliberately separate from checkoutTiers.ts for the same reason as
// vibeCoderOffer.ts and startupOffer.ts: that module reads (and requires) the
// Stripe env vars, so importing it would make these marketing pages unbuildable
// anywhere the Stripe keys aren't present. The concept page sends traffic to the
// existing checkout page, which owns the payment link.
export const SMALL_COMPANY_OFFER = {
  name: 'Small Company',
  price: 500,
  priceLabel: '$500',
  persona: 'Let\'s work together',
  // Points straight at the live Stripe Payment Link rather than the
  // /checkout/small-company review page, so buttons go directly to payment.
  // Same URL that page's own "Proceed to payment" button already sends
  // people to (STRIPE_PAYMENT_LINK_SMALL_COMPANY on Vercel) — hardcoded here
  // because this file must build without the Stripe env vars present.
  checkoutHref: 'https://buy.stripe.com/dRmeVdfz13Vl7po7ImfUQ03',
  turnaround: '5 business days',
} as const;
