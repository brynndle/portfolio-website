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
  persona: 'For independent creators',
  checkoutHref: '/checkout/small-company',
  turnaround: '5 business days',
} as const;
