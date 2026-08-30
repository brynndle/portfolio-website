export const UX_OFFERS = {
  review: {
    id: 'review',
    name: 'UX Review',
    priceLabel: '$500',
    href: '/ux-audit',
    ctaLabel: 'See the UX Review',
  },
  engagement: {
    id: 'engagement',
    name: 'UX Engagement',
    priceLabel: 'From $3,000',
    href: '/ux-engagement',
    ctaLabel: 'See the UX Engagement',
  },
} as const;

export type UxOfferId = keyof typeof UX_OFFERS;

export function getAlternativeUxOffer(offerId: UxOfferId) {
  return offerId === 'review' ? UX_OFFERS.engagement : UX_OFFERS.review;
}
