import { describe, expect, test } from 'vitest';
import { getAlternativeUxOffer, UX_OFFERS } from '../src/data/uxOffers';

describe('UX offer navigation', () => {
  test('each offer points visitors to the other level of help', () => {
    expect(getAlternativeUxOffer('review')).toEqual(UX_OFFERS.engagement);
    expect(getAlternativeUxOffer('engagement')).toEqual(UX_OFFERS.review);
  });
});
