# Checkout Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the three-tier paid consulting checkout flow from issue #1 — pay, verify, collect intake data, email next steps, log to a Google Sheet.

**Architecture:** The Astro site **stays static** (`output: 'static'`, no adapter change) and continues to build fine for GitHub Pages if ever needed again. All dynamic behavior — session verification, form submission, file-upload tokens, the Stripe webhook — lives in plain **Vercel Serverless Functions** in a root-level `/api` directory, which Vercel supports alongside any static frontend framework with zero Astro-side configuration. `/confirm` is a static page shell whose inline client-side script calls `/api/verify-session` to decide whether to show the form or an error — verification itself still happens entirely server-side; the client never self-certifies payment. This is a refinement of the design spec's "server-rendered page" language: same security property (server verifies before any data is accepted), smaller blast radius (zero changes to the ~15 existing static pages), documented in `docs/superpowers/specs/2026-08-24-checkout-flow-design.md` as an implementation note.

**Tech Stack:** Astro 7 (static), Vercel Serverless Functions (Node, TypeScript), Stripe SDK, Resend, googleapis (Sheets), @vercel/blob, Vitest for unit tests.

**Spec:** `docs/superpowers/specs/2026-08-24-checkout-flow-design.md`

## Global Constraints

- No database — Google Sheet is the system of record, append-only.
- `session_id` (Stripe Checkout Session ID) is the only link between a payment and a form submission; it must be re-verified server-side on every write, never trusted from client input alone.
- No persistent accounts/login — `/confirm?session_id=...` is the entire "portal."
- Deploy target for anything in `/api` is Vercel (GitHub Pages cannot run these).
- Match existing site conventions: Tailwind utility classes matching `about.astro`/`ConsultCTA.astro`, no JS framework — plain `<script>` tags for interactivity.
- Never hardcode real Stripe price IDs, Payment Link URLs, or other secrets in source — always env vars, obtained from the Dashboard per Task 12.

---

### Task 1: Add Vitest and shared server-side lib scaffolding

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add `vitest` devDependency, `"test": "vitest run"` script)
- Create: `lib/tiers.ts`
- Test: `lib/tiers.test.ts`

**Interfaces:**
- Produces: `TierConfig { slug: string; priceId: string }`, `loadTierConfigsFromEnv(env: NodeJS.ProcessEnv): TierConfig[]`, `getTierSlugByPriceId(priceId: string, tiers: TierConfig[]): string | undefined` — consumed by Tasks 2 and 6.

- [ ] **Step 1: Install Vitest**

Run: `npm install -D vitest`

- [ ] **Step 2: Add Vitest config**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
  },
});
```

- [ ] **Step 3: Add the `test` script**

In `package.json`, under `"scripts"`, add:

```json
"test": "vitest run"
```

- [ ] **Step 4: Write the failing test for tier lookup**

```ts
// lib/tiers.test.ts
import { describe, it, expect } from 'vitest';
import { getTierSlugByPriceId, loadTierConfigsFromEnv } from './tiers';

describe('getTierSlugByPriceId', () => {
  it('returns the matching tier slug', () => {
    const tiers = [
      { slug: 'vibe-coder', priceId: 'price_a' },
      { slug: 'small-company', priceId: 'price_b' },
    ];
    expect(getTierSlugByPriceId('price_b', tiers)).toBe('small-company');
  });

  it('returns undefined when no tier matches', () => {
    const tiers = [{ slug: 'vibe-coder', priceId: 'price_a' }];
    expect(getTierSlugByPriceId('price_z', tiers)).toBeUndefined();
  });
});

describe('loadTierConfigsFromEnv', () => {
  it('reads the three tier price IDs from env', () => {
    const env = {
      STRIPE_PRICE_ID_VIBE_CODER: 'price_a',
      STRIPE_PRICE_ID_SMALL_COMPANY: 'price_b',
      STRIPE_PRICE_ID_STARTUP: 'price_c',
    } as NodeJS.ProcessEnv;

    const tiers = loadTierConfigsFromEnv(env);

    expect(tiers).toEqual([
      { slug: 'vibe-coder', priceId: 'price_a' },
      { slug: 'small-company', priceId: 'price_b' },
      { slug: 'startup', priceId: 'price_c' },
    ]);
  });
});
```

- [ ] **Step 5: Run test to verify it fails**

Run: `npx vitest run lib/tiers.test.ts`
Expected: FAIL — `lib/tiers.ts` does not exist yet.

- [ ] **Step 6: Implement `lib/tiers.ts`**

```ts
// lib/tiers.ts
export interface TierConfig {
  slug: string;
  priceId: string;
}

export function getTierSlugByPriceId(priceId: string, tiers: TierConfig[]): string | undefined {
  return tiers.find((t) => t.priceId === priceId)?.slug;
}

export function loadTierConfigsFromEnv(env: NodeJS.ProcessEnv): TierConfig[] {
  return [
    { slug: 'vibe-coder', priceId: env.STRIPE_PRICE_ID_VIBE_CODER ?? '' },
    { slug: 'small-company', priceId: env.STRIPE_PRICE_ID_SMALL_COMPANY ?? '' },
    { slug: 'startup', priceId: env.STRIPE_PRICE_ID_STARTUP ?? '' },
  ];
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npx vitest run lib/tiers.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 8: Commit**

```bash
git add vitest.config.ts package.json package-lock.json lib/tiers.ts lib/tiers.test.ts
git commit -m "test: add vitest and tier config lookup"
```

---

### Task 2: Checkout tier pages

**Files:**
- Create: `src/data/checkoutTiers.ts`
- Create: `src/components/CheckoutOffer.astro`
- Create: `src/pages/checkout/vibe-coder.astro`
- Create: `src/pages/checkout/small-company.astro`
- Create: `src/pages/checkout/startup.astro`
- Delete: `src/pages/checkout.astro`
- Modify: `src/data/site.ts` (remove `UX_1HR_CONSULT_CHECKOUT_URL`)

**Interfaces:**
- Produces: `CHECKOUT_TIERS: CheckoutTier[]` with `{ slug, name, price, paymentLinkUrl, persona, blurb }`, consumed by the three page files and `CheckoutOffer.astro`.

- [ ] **Step 1: Remove the old single checkout page and its data export**

```bash
git rm src/pages/checkout.astro
```

In `src/data/site.ts`, delete this line:

```ts
export const UX_1HR_CONSULT_CHECKOUT_URL = 'https://buy.stripe.com/fZu9ATfz18bBeRQ5AefUQ00';
```

- [ ] **Step 2: Add tier data**

```ts
// src/data/checkoutTiers.ts
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
```

- [ ] **Step 3: Add the shared offer component**

```astro
---
// src/components/CheckoutOffer.astro
import type { CheckoutTier } from '../data/checkoutTiers';

interface Props {
  tier: CheckoutTier;
}
const { tier } = Astro.props;
---
<section class="max-width border-b border-rule px-5 py-12 md:px-10">
  <div class="label mb-3 text-blue">{tier.persona}</div>
  <h1 class="max-w-[20ch] text-[2.5rem] font-semibold leading-[1.05] -tracking-[0.02em] text-balance max-md:text-3xl">1-Hour UX Consult</h1>
  <p class="mt-6 max-w-[64ch] text-lg leading-relaxed text-ink-2 text-pretty">{tier.blurb}</p>
  <p class="mt-6 font-mono text-2xl font-bold text-ink">${tier.price}</p>
  <a
    href={tier.paymentLinkUrl}
    class="mt-8 inline-block whitespace-nowrap bg-[#00ff1c] px-[26px] py-4 text-center font-mono text-[0.9375rem] font-bold uppercase tracking-[0.1em] text-ink shadow-[5px_5px_0px_rgba(0,0,0,0.5)]"
  >
    Proceed to payment →
  </a>
</section>
```

- [ ] **Step 4: Add the three tier pages**

```astro
---
// src/pages/checkout/vibe-coder.astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import CheckoutOffer from '../../components/CheckoutOffer.astro';
import { CHECKOUT_TIERS } from '../../data/checkoutTiers';

const tier = CHECKOUT_TIERS.find((t) => t.slug === 'vibe-coder')!;
---
<BaseLayout title={`Checkout — ${tier.name}`} description={tier.blurb}>
  <CheckoutOffer tier={tier} />
</BaseLayout>
```

```astro
---
// src/pages/checkout/small-company.astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import CheckoutOffer from '../../components/CheckoutOffer.astro';
import { CHECKOUT_TIERS } from '../../data/checkoutTiers';

const tier = CHECKOUT_TIERS.find((t) => t.slug === 'small-company')!;
---
<BaseLayout title={`Checkout — ${tier.name}`} description={tier.blurb}>
  <CheckoutOffer tier={tier} />
</BaseLayout>
```

```astro
---
// src/pages/checkout/startup.astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import CheckoutOffer from '../../components/CheckoutOffer.astro';
import { CHECKOUT_TIERS } from '../../data/checkoutTiers';

const tier = CHECKOUT_TIERS.find((t) => t.slug === 'startup')!;
---
<BaseLayout title={`Checkout — ${tier.name}`} description={tier.blurb}>
  <CheckoutOffer tier={tier} />
</BaseLayout>
```

- [ ] **Step 5: Build and verify**

Run: `npm run build`
Expected: build succeeds; `dist/checkout/vibe-coder/index.html`, `dist/checkout/small-company/index.html`, `dist/checkout/startup/index.html` all exist; `dist/checkout/index.html` no longer exists.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: replace single checkout page with three tier pages"
```

---

### Task 3: Session verification (the security boundary)

**Files:**
- Create: `lib/verifySession.ts`
- Test: `lib/verifySession.test.ts`
- Modify: `package.json` (add `stripe` dependency)

**Interfaces:**
- Consumes: `TierConfig`, `getTierSlugByPriceId` from `lib/tiers.ts` (Task 1).
- Produces: `VerifiedSession { sessionId: string; tier: string; amountTotal: number; customerEmail: string | null }`, `VerifySessionResult = { ok: true; session: VerifiedSession } | { ok: false; reason: 'missing_id' | 'not_found' | 'unpaid' | 'unknown_tier' }`, `verifyPaidSession(sessionId, stripeClient, tierConfigs): Promise<VerifySessionResult>` — consumed by Task 6 (`api/verify-session.ts`) and Task 9 (`api/submit-intake.ts`).

- [ ] **Step 1: Install Stripe SDK**

Run: `npm install stripe`

- [ ] **Step 2: Write the failing tests**

```ts
// lib/verifySession.test.ts
import { describe, it, expect } from 'vitest';
import { verifyPaidSession } from './verifySession';
import type { TierConfig } from './tiers';

const tiers: TierConfig[] = [
  { slug: 'vibe-coder', priceId: 'price_a' },
  { slug: 'small-company', priceId: 'price_b' },
];

function fakeStripe(session: unknown, shouldThrow = false) {
  return {
    checkout: {
      sessions: {
        retrieve: async () => {
          if (shouldThrow) throw new Error('not found');
          return session;
        },
      },
    },
  };
}

describe('verifyPaidSession', () => {
  it('rejects a missing session id', async () => {
    const result = await verifyPaidSession(undefined, fakeStripe({}), tiers);
    expect(result).toEqual({ ok: false, reason: 'missing_id' });
  });

  it('rejects when Stripe lookup fails', async () => {
    const result = await verifyPaidSession('sess_1', fakeStripe({}, true), tiers);
    expect(result).toEqual({ ok: false, reason: 'not_found' });
  });

  it('rejects an unpaid session', async () => {
    const session = { id: 'sess_1', payment_status: 'unpaid', line_items: { data: [] } };
    const result = await verifyPaidSession('sess_1', fakeStripe(session), tiers);
    expect(result).toEqual({ ok: false, reason: 'unpaid' });
  });

  it('rejects a paid session with an unrecognized price id', async () => {
    const session = {
      id: 'sess_1',
      payment_status: 'paid',
      line_items: { data: [{ price: { id: 'price_unknown' } }] },
    };
    const result = await verifyPaidSession('sess_1', fakeStripe(session), tiers);
    expect(result).toEqual({ ok: false, reason: 'unknown_tier' });
  });

  it('returns the verified session for a paid, known-tier session', async () => {
    const session = {
      id: 'sess_1',
      payment_status: 'paid',
      amount_total: 25000,
      customer_details: { email: 'client@example.com' },
      line_items: { data: [{ price: { id: 'price_b' } }] },
    };
    const result = await verifyPaidSession('sess_1', fakeStripe(session), tiers);
    expect(result).toEqual({
      ok: true,
      session: {
        sessionId: 'sess_1',
        tier: 'small-company',
        amountTotal: 25000,
        customerEmail: 'client@example.com',
      },
    });
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run lib/verifySession.test.ts`
Expected: FAIL — `lib/verifySession.ts` does not exist yet.

- [ ] **Step 4: Implement `lib/verifySession.ts`**

```ts
// lib/verifySession.ts
import { getTierSlugByPriceId, type TierConfig } from './tiers';

export interface VerifiedSession {
  sessionId: string;
  tier: string;
  amountTotal: number;
  customerEmail: string | null;
}

export type VerifySessionResult =
  | { ok: true; session: VerifiedSession }
  | { ok: false; reason: 'missing_id' | 'not_found' | 'unpaid' | 'unknown_tier' };

export interface StripeCheckoutClient {
  checkout: {
    sessions: {
      retrieve: (id: string, params?: Record<string, unknown>) => Promise<any>;
    };
  };
}

export async function verifyPaidSession(
  sessionId: string | undefined | null,
  stripeClient: StripeCheckoutClient,
  tierConfigs: TierConfig[]
): Promise<VerifySessionResult> {
  if (!sessionId) return { ok: false, reason: 'missing_id' };

  let session: any;
  try {
    session = await stripeClient.checkout.sessions.retrieve(sessionId, { expand: ['line_items'] });
  } catch {
    return { ok: false, reason: 'not_found' };
  }

  if (session.payment_status !== 'paid') return { ok: false, reason: 'unpaid' };

  const priceId = session.line_items?.data?.[0]?.price?.id;
  const tier = priceId ? getTierSlugByPriceId(priceId, tierConfigs) : undefined;
  if (!tier) return { ok: false, reason: 'unknown_tier' };

  return {
    ok: true,
    session: {
      sessionId: session.id,
      tier,
      amountTotal: session.amount_total ?? 0,
      customerEmail: session.customer_details?.email ?? null,
    },
  };
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run lib/verifySession.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json lib/verifySession.ts lib/verifySession.test.ts
git commit -m "feat: add server-side Stripe session verification"
```

---

### Task 4: Next-steps email content and sender

**Files:**
- Create: `lib/email.ts`
- Test: `lib/email.test.ts`
- Modify: `package.json` (add `resend` dependency)

**Interfaces:**
- Produces: `buildNextStepsEmail(confirmUrl: string): { subject: string; html: string }`, `sendNextStepsEmail(resendClient, { to, confirmUrl, from }): Promise<void>` — consumed by Task 7 (`api/stripe-webhook.ts`).

- [ ] **Step 1: Install Resend SDK**

Run: `npm install resend`

- [ ] **Step 2: Write the failing tests**

```ts
// lib/email.test.ts
import { describe, it, expect, vi } from 'vitest';
import { buildNextStepsEmail, sendNextStepsEmail } from './email';

describe('buildNextStepsEmail', () => {
  it('includes the confirm link in the html body', () => {
    const { subject, html } = buildNextStepsEmail('https://brynncaputo.com/confirm?session_id=sess_1');
    expect(subject).toContain('Next steps');
    expect(html).toContain('https://brynncaputo.com/confirm?session_id=sess_1');
  });
});

describe('sendNextStepsEmail', () => {
  it('calls the resend client with the built subject/html', async () => {
    const send = vi.fn().mockResolvedValue({ id: 'email_1' });
    const resendClient = { emails: { send } };

    await sendNextStepsEmail(resendClient, {
      to: 'client@example.com',
      confirmUrl: 'https://brynncaputo.com/confirm?session_id=sess_1',
      from: 'Brynn Caputo <hi@brynncaputo.com>',
    });

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Brynn Caputo <hi@brynncaputo.com>',
        to: 'client@example.com',
        subject: expect.stringContaining('Next steps'),
        html: expect.stringContaining('sess_1'),
      })
    );
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run lib/email.test.ts`
Expected: FAIL — `lib/email.ts` does not exist yet.

- [ ] **Step 4: Implement `lib/email.ts`**

```ts
// lib/email.ts
export interface NextStepsEmailContent {
  subject: string;
  html: string;
}

export function buildNextStepsEmail(confirmUrl: string): NextStepsEmailContent {
  return {
    subject: 'Next steps for your consult',
    html: `<p>Thanks for booking a consult with Brynn Caputo.</p><p>Tell us about your project here: <a href="${confirmUrl}">${confirmUrl}</a></p>`,
  };
}

export interface ResendClient {
  emails: {
    send: (params: { from: string; to: string; subject: string; html: string }) => Promise<unknown>;
  };
}

export async function sendNextStepsEmail(
  resendClient: ResendClient,
  params: { to: string; confirmUrl: string; from: string }
): Promise<void> {
  const { subject, html } = buildNextStepsEmail(params.confirmUrl);
  await resendClient.emails.send({ from: params.from, to: params.to, subject, html });
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run lib/email.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json lib/email.ts lib/email.test.ts
git commit -m "feat: add next-steps email content and sender"
```

---

### Task 5: Google Sheets row writer

**Files:**
- Create: `lib/sheets.ts`
- Test: `lib/sheets.test.ts`
- Modify: `package.json` (add `googleapis` dependency)

**Interfaces:**
- Produces: `IntakeRow { timestamp, sessionId, tier, amount, companyName, clientName, email, description, links: string[], fileUrls: string[] }`, `formatIntakeRowValues(row: IntakeRow): string[]`, `appendIntakeRow(sheetsClient, sheetId, row): Promise<void>` — consumed by Task 8 (`lib/intakeForm.ts` imports `IntakeRow`) and Task 9 (`api/submit-intake.ts`).

- [ ] **Step 1: Install googleapis**

Run: `npm install googleapis`

- [ ] **Step 2: Write the failing tests**

```ts
// lib/sheets.test.ts
import { describe, it, expect, vi } from 'vitest';
import { formatIntakeRowValues, appendIntakeRow, type IntakeRow } from './sheets';

const row: IntakeRow = {
  timestamp: '2026-08-24T00:00:00.000Z',
  sessionId: 'sess_1',
  tier: 'small-company',
  amount: 50000,
  companyName: 'Acme',
  clientName: 'Jane Client',
  email: 'jane@example.com',
  description: 'Our checkout flow converts poorly.',
  links: ['https://acme.com', 'https://acme.com/pricing'],
  fileUrls: ['https://blob.vercel-storage.com/file1.pdf'],
};

describe('formatIntakeRowValues', () => {
  it('flattens the row into a single array of strings, joining links and files', () => {
    expect(formatIntakeRowValues(row)).toEqual([
      '2026-08-24T00:00:00.000Z',
      'sess_1',
      'small-company',
      '50000',
      'Acme',
      'Jane Client',
      'jane@example.com',
      'Our checkout flow converts poorly.',
      'https://acme.com, https://acme.com/pricing',
      'https://blob.vercel-storage.com/file1.pdf',
    ]);
  });
});

describe('appendIntakeRow', () => {
  it('calls values.append with the formatted row', async () => {
    const append = vi.fn().mockResolvedValue({});
    const sheetsClient = { spreadsheets: { values: { append } } };

    await appendIntakeRow(sheetsClient, 'sheet_123', row);

    expect(append).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId: 'sheet_123',
        requestBody: { values: [formatIntakeRowValues(row)] },
      })
    );
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run lib/sheets.test.ts`
Expected: FAIL — `lib/sheets.ts` does not exist yet.

- [ ] **Step 4: Implement `lib/sheets.ts`**

```ts
// lib/sheets.ts
export interface IntakeRow {
  timestamp: string;
  sessionId: string;
  tier: string;
  amount: number;
  companyName: string;
  clientName: string;
  email: string;
  description: string;
  links: string[];
  fileUrls: string[];
}

export function formatIntakeRowValues(row: IntakeRow): string[] {
  return [
    row.timestamp,
    row.sessionId,
    row.tier,
    String(row.amount),
    row.companyName,
    row.clientName,
    row.email,
    row.description,
    row.links.join(', '),
    row.fileUrls.join(', '),
  ];
}

export interface SheetsValuesClient {
  spreadsheets: {
    values: {
      append: (params: Record<string, unknown>) => Promise<unknown>;
    };
  };
}

export async function appendIntakeRow(
  sheetsClient: SheetsValuesClient,
  sheetId: string,
  row: IntakeRow
): Promise<void> {
  await sheetsClient.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'Sheet1!A:J',
    valueInputOption: 'RAW',
    requestBody: { values: [formatIntakeRowValues(row)] },
  });
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run lib/sheets.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json lib/sheets.ts lib/sheets.test.ts
git commit -m "feat: add Google Sheets intake row writer"
```

---

### Task 6: `/api/verify-session`

**Files:**
- Create: `api/verify-session.ts`
- Modify: `package.json` (add `@vercel/node` devDependency, for types)

**Interfaces:**
- Consumes: `verifyPaidSession` (Task 3), `loadTierConfigsFromEnv` (Task 1).
- Produces: `GET /api/verify-session?session_id=...` → `VerifySessionResult` JSON — consumed by Task 11's client script.

- [ ] **Step 1: Install Vercel Node types**

Run: `npm install -D @vercel/node`

- [ ] **Step 2: Implement the handler**

```ts
// api/verify-session.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { verifyPaidSession } from '../lib/verifySession';
import { loadTierConfigsFromEnv } from '../lib/tiers';

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
```

- [ ] **Step 3: Verify locally with the Vercel CLI**

Run: `npx vercel dev` (requires `vercel login` and `vercel link` once, done manually — this step just confirms the function boots)
Then: `curl "http://localhost:3000/api/verify-session?session_id=bogus"`
Expected: `{"ok":false,"reason":"not_found"}` once `STRIPE_SECRET_KEY` is set in `.env` (real test-mode key from Task 12); until then, expect a clear Stripe auth error rather than a crash.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json api/verify-session.ts
git commit -m "feat: add /api/verify-session endpoint"
```

---

### Task 7: `/api/stripe-webhook`

**Files:**
- Create: `lib/rawBody.ts`
- Create: `api/stripe-webhook.ts`

**Interfaces:**
- Consumes: `sendNextStepsEmail` (Task 4).
- Produces: `POST /api/stripe-webhook` — Stripe calls this directly; no other code in this repo consumes it.

- [ ] **Step 1: Add a raw-body reader (Stripe signature verification needs the unparsed body)**

```ts
// lib/rawBody.ts
import type { IncomingMessage } from 'http';

export function readRawBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
```

- [ ] **Step 2: Implement the webhook handler**

```ts
// api/stripe-webhook.ts
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
```

- [ ] **Step 3: Verify with the Stripe CLI**

Run: `stripe listen --forward-to localhost:3000/api/stripe-webhook` (in one terminal, with `npx vercel dev` running in another)
Then: `stripe trigger checkout.session.completed`
Expected: handler logs/returns `{"received":true}`; once `RESEND_API_KEY` is set (Task 12), a test email is sent (Resend's test mode / your own inbox if using a verified domain).

- [ ] **Step 4: Commit**

```bash
git add lib/rawBody.ts api/stripe-webhook.ts
git commit -m "feat: add Stripe webhook handler for next-steps email"
```

---

### Task 8: Intake row builder

**Files:**
- Create: `lib/intakeForm.ts`
- Test: `lib/intakeForm.test.ts`

**Interfaces:**
- Consumes: `VerifiedSession` (Task 3), `IntakeRow` (Task 5).
- Produces: `IntakeFormFields { companyName, clientName, email, description, links: string[], fileUrls: string[] }`, `buildIntakeRow(session: VerifiedSession, fields: IntakeFormFields, now?: Date): IntakeRow` — consumed by Task 9.

- [ ] **Step 1: Write the failing tests**

```ts
// lib/intakeForm.test.ts
import { describe, it, expect } from 'vitest';
import { buildIntakeRow } from './intakeForm';
import type { VerifiedSession } from './verifySession';

const session: VerifiedSession = {
  sessionId: 'sess_1',
  tier: 'small-company',
  amountTotal: 50000,
  customerEmail: 'stripe-known@example.com',
};

describe('buildIntakeRow', () => {
  it('uses the submitted email when provided', () => {
    const row = buildIntakeRow(
      session,
      {
        companyName: 'Acme',
        clientName: 'Jane Client',
        email: 'jane@acme.com',
        description: 'Checkout converts poorly.',
        links: ['https://acme.com'],
        fileUrls: [],
      },
      new Date('2026-08-24T00:00:00.000Z')
    );

    expect(row).toEqual({
      timestamp: '2026-08-24T00:00:00.000Z',
      sessionId: 'sess_1',
      tier: 'small-company',
      amount: 50000,
      companyName: 'Acme',
      clientName: 'Jane Client',
      email: 'jane@acme.com',
      description: 'Checkout converts poorly.',
      links: ['https://acme.com'],
      fileUrls: [],
    });
  });

  it('falls back to the Stripe session email when the form email is blank', () => {
    const row = buildIntakeRow(
      session,
      {
        companyName: 'Acme',
        clientName: 'Jane Client',
        email: '',
        description: 'Checkout converts poorly.',
        links: [],
        fileUrls: [],
      },
      new Date('2026-08-24T00:00:00.000Z')
    );

    expect(row.email).toBe('stripe-known@example.com');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/intakeForm.test.ts`
Expected: FAIL — `lib/intakeForm.ts` does not exist yet.

- [ ] **Step 3: Implement `lib/intakeForm.ts`**

```ts
// lib/intakeForm.ts
import type { VerifiedSession } from './verifySession';
import type { IntakeRow } from './sheets';

export interface IntakeFormFields {
  companyName: string;
  clientName: string;
  email: string;
  description: string;
  links: string[];
  fileUrls: string[];
}

export function buildIntakeRow(session: VerifiedSession, fields: IntakeFormFields, now: Date = new Date()): IntakeRow {
  return {
    timestamp: now.toISOString(),
    sessionId: session.sessionId,
    tier: session.tier,
    amount: session.amountTotal,
    companyName: fields.companyName,
    clientName: fields.clientName,
    email: fields.email || session.customerEmail || '',
    description: fields.description,
    links: fields.links,
    fileUrls: fields.fileUrls,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/intakeForm.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/intakeForm.ts lib/intakeForm.test.ts
git commit -m "feat: add intake row builder with Stripe email fallback"
```

---

### Task 9: `/api/submit-intake`

**Files:**
- Create: `api/submit-intake.ts`

**Interfaces:**
- Consumes: `verifyPaidSession` (Task 3), `loadTierConfigsFromEnv` (Task 1), `buildIntakeRow`, `IntakeFormFields` (Task 8), `appendIntakeRow` (Task 5).
- Produces: `POST /api/submit-intake` → `{ ok: true } | { ok: false; reason: string }` — consumed by Task 11's client script.

- [ ] **Step 1: Implement the handler**

```ts
// api/submit-intake.ts
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
```

- [ ] **Step 2: Verify locally**

With `npx vercel dev` running and a real paid test-mode session ID in hand (from Task 12's manual Stripe test-mode run):

Run: `curl -X POST http://localhost:3000/api/submit-intake -H "Content-Type: application/json" -d '{"sessionId":"cs_test_...","companyName":"Acme","clientName":"Jane","email":"jane@acme.com","description":"test","links":[],"fileUrls":[]}'`
Expected: `{"ok":true}`, and a new row appears in the Google Sheet.

- [ ] **Step 3: Commit**

```bash
git add api/submit-intake.ts
git commit -m "feat: add /api/submit-intake endpoint"
```

---

### Task 10: `/api/blob-upload`

**Files:**
- Create: `api/blob-upload.ts`
- Modify: `package.json` (add `@vercel/blob` dependency)

**Interfaces:**
- Produces: `POST /api/blob-upload` (Vercel Blob client-upload token endpoint) — consumed by Task 11's client script via `@vercel/blob/client`'s `upload()`.

- [ ] **Step 1: Install @vercel/blob**

Run: `npm install @vercel/blob`

- [ ] **Step 2: Implement the handler**

```ts
// api/blob-upload.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const body = req.body as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      // VercelRequest exposes the same `.headers` shape handleUpload needs;
      // it doesn't read the body stream directly since `body` is passed separately.
      request: req as any,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'],
        maximumSizeInBytes: 25 * 1024 * 1024,
      }),
      onUploadCompleted: async () => {},
    });
    res.status(200).json(jsonResponse);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}
```

- [ ] **Step 3: Verify locally**

Run: `npx vercel dev`, then in the browser console on any page served from it:

```js
fetch('/api/blob-upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'blob.generate-client-token', payload: { pathname: 'test.pdf', callbackUrl: 'http://localhost:3000/api/blob-upload' } }) })
  .then((r) => r.json()).then(console.log)
```

Expected: a JSON response containing a client token (once `BLOB_READ_WRITE_TOKEN` is set per Task 12), not a 500.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json api/blob-upload.ts
git commit -m "feat: add /api/blob-upload client-upload token endpoint"
```

---

### Task 11: `/confirm` page

**Files:**
- Create: `src/pages/confirm.astro`

**Interfaces:**
- Consumes: `GET /api/verify-session` (Task 6), `POST /api/submit-intake` (Task 9), `POST /api/blob-upload` (Task 10, via `@vercel/blob/client`).

- [ ] **Step 1: Implement the page**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Confirm" description="Confirm your consult booking and tell us about your project.">
  <section class="max-width border-b border-rule px-5 py-12 md:px-10" id="confirm-root">
    <div class="label mb-3 text-blue">Almost there</div>
    <h1 id="confirm-heading" class="max-w-[20ch] text-[2.5rem] font-semibold leading-[1.05] -tracking-[0.02em] text-balance max-md:text-3xl">Checking your payment…</h1>

    <div id="confirm-error" class="mt-6 hidden max-w-[64ch] text-lg leading-relaxed text-ink-2">
      <p>
        We couldn't verify this payment. If you just paid, check the link in your confirmation
        email, or email <a class="text-blue underline" href="mailto:hi@brynncaputo.com">hi@brynncaputo.com</a>
        and we'll sort it out.
      </p>
    </div>

    <form id="confirm-form" class="mt-8 hidden max-w-[64ch] space-y-6">
      <div>
        <label class="label mb-2 block" for="companyName">Company name</label>
        <input id="companyName" name="companyName" type="text" required class="w-full border border-rule bg-paper px-4 py-3 text-ink" />
      </div>
      <div>
        <label class="label mb-2 block" for="clientName">Your name</label>
        <input id="clientName" name="clientName" type="text" required class="w-full border border-rule bg-paper px-4 py-3 text-ink" />
      </div>
      <div>
        <label class="label mb-2 block" for="email">Email</label>
        <input id="email" name="email" type="email" required class="w-full border border-rule bg-paper px-4 py-3 text-ink" />
      </div>
      <div>
        <label class="label mb-2 block" for="description">Tell us about your product or the issue</label>
        <textarea id="description" name="description" rows="5" required class="w-full border border-rule bg-paper px-4 py-3 text-ink"></textarea>
      </div>
      <div>
        <label class="label mb-2 block">Links to your product or website</label>
        <div id="link-fields" class="space-y-2">
          <input type="url" name="links" placeholder="https://" class="w-full border border-rule bg-paper px-4 py-3 text-ink" />
        </div>
        <button type="button" id="add-link" class="mt-2 font-mono text-xs font-bold uppercase tracking-[0.08em] text-blue">+ Add another link</button>
      </div>
      <div>
        <label class="label mb-2 block" for="files">Upload files (PDF, prototype, etc.)</label>
        <input id="files" name="files" type="file" multiple class="w-full" />
        <p id="upload-status" class="mt-1 text-sm text-ink-3"></p>
      </div>
      <button
        type="submit"
        class="whitespace-nowrap bg-[#00ff1c] px-[26px] py-4 text-center font-mono text-[0.9375rem] font-bold uppercase tracking-[0.1em] text-ink shadow-[5px_5px_0px_rgba(0,0,0,0.5)]"
      >
        Submit →
      </button>
    </form>

    <div id="confirm-success" class="mt-6 hidden max-w-[64ch] text-lg leading-relaxed text-ink-2">
      <p>Got it — thanks. We'll be in touch within one business day.</p>
    </div>
  </section>

  <script>
    import { upload } from '@vercel/blob/client';

    const heading = document.getElementById('confirm-heading')!;
    const errorBox = document.getElementById('confirm-error')!;
    const form = document.getElementById('confirm-form') as HTMLFormElement;
    const successBox = document.getElementById('confirm-success')!;
    const linkFields = document.getElementById('link-fields')!;
    const addLinkBtn = document.getElementById('add-link')!;
    const filesInput = document.getElementById('files') as HTMLInputElement;
    const uploadStatus = document.getElementById('upload-status')!;
    const emailInput = document.getElementById('email') as HTMLInputElement;

    const sessionId = new URLSearchParams(window.location.search).get('session_id');

    function showError() {
      heading.textContent = "We couldn't verify this payment";
      errorBox.classList.remove('hidden');
    }

    addLinkBtn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'url';
      input.name = 'links';
      input.placeholder = 'https://';
      input.className = 'w-full border border-rule bg-paper px-4 py-3 text-ink';
      linkFields.appendChild(input);
    });

    async function init() {
      if (!sessionId) {
        showError();
        return;
      }

      const res = await fetch(`/api/verify-session?session_id=${encodeURIComponent(sessionId)}`);
      const result = await res.json();

      if (!result.ok) {
        showError();
        return;
      }

      heading.textContent = 'Tell us about your project';
      if (result.session.customerEmail) emailInput.value = result.session.customerEmail;
      form.classList.remove('hidden');
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
      submitBtn.disabled = true;

      try {
        const fileUrls: string[] = [];
        if (filesInput.files && filesInput.files.length > 0) {
          uploadStatus.textContent = 'Uploading files…';
          for (const file of Array.from(filesInput.files)) {
            const blob = await upload(file.name, file, {
              access: 'public',
              handleUploadUrl: '/api/blob-upload',
            });
            fileUrls.push(blob.url);
          }
          uploadStatus.textContent = 'Files uploaded.';
        }

        const links = Array.from(linkFields.querySelectorAll<HTMLInputElement>('input[name="links"]'))
          .map((input) => input.value.trim())
          .filter(Boolean);

        const payload = {
          sessionId,
          companyName: (document.getElementById('companyName') as HTMLInputElement).value,
          clientName: (document.getElementById('clientName') as HTMLInputElement).value,
          email: emailInput.value,
          description: (document.getElementById('description') as HTMLTextAreaElement).value,
          links,
          fileUrls,
        };

        const res = await fetch('/api/submit-intake', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error('submit failed');

        form.classList.add('hidden');
        successBox.classList.remove('hidden');
      } catch {
        submitBtn.disabled = false;
        uploadStatus.textContent = 'Something went wrong submitting — please email hi@brynncaputo.com directly.';
      }
    });

    init();
  </script>
</BaseLayout>
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: build succeeds; `dist/confirm/index.html` exists.

- [ ] **Step 3: Manual browser verification**

Run: `npx vercel dev`, visit `http://localhost:3000/confirm` with no `session_id` — expect the error state. Visit with a real paid test-mode session ID (from Task 12) — expect the form, submit it, expect the success state and a new Sheet row.

- [ ] **Step 4: Commit**

```bash
git add src/pages/confirm.astro
git commit -m "feat: add /confirm intake page"
```

---

### Task 12: Wire up real Stripe/Google/Resend resources and deploy

This task is manual setup plus final end-to-end verification — there is no code change here beyond `.env.example`.

**Files:**
- Create: `.env.example`

- [ ] **Step 1: Add `.env.example` documenting every required variable**

```bash
# .env.example
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_VIBE_CODER=
STRIPE_PRICE_ID_SMALL_COMPANY=
STRIPE_PRICE_ID_STARTUP=
STRIPE_PAYMENT_LINK_VIBE_CODER=
STRIPE_PAYMENT_LINK_SMALL_COMPANY=
STRIPE_PAYMENT_LINK_STARTUP=
RESEND_API_KEY=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=
GOOGLE_SHEET_ID=
BLOB_READ_WRITE_TOKEN=
```

- [ ] **Step 2: Create the three Stripe Products/Prices** (Stripe Dashboard → Product catalog): "1-Hour UX Consult — Vibe Coder" ($250), "— Small Company" ($500), "— Startup+" ($3000). Copy each price ID into `STRIPE_PRICE_ID_*`.

- [ ] **Step 3: Create a Payment Link for each price.** In each Payment Link's settings, set "After payment" → redirect to a custom URL: `https://brynncaputo.com/confirm?session_id={CHECKOUT_SESSION_ID}`. Copy each link into `STRIPE_PAYMENT_LINK_*`.

- [ ] **Step 4: Create a Stripe webhook endpoint** pointing at `https://brynncaputo.com/api/stripe-webhook`, subscribed to `checkout.session.completed`. Copy its signing secret into `STRIPE_WEBHOOK_SECRET`. Copy your Stripe test-mode secret key into `STRIPE_SECRET_KEY`.

- [ ] **Step 5: Create the Google Sheet and service account.** New Sheet with header row `timestamp | session_id | tier | amount | company_name | client_name | email | description | links | file_urls`. Create a Google Cloud service account with Sheets API access, share the Sheet with its email (Editor), download its JSON key. Fill `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (the key's `private_key` field), and `GOOGLE_SHEET_ID` (from the Sheet's URL).

- [ ] **Step 6: Get a Resend API key** (resend.com, verify the sending domain for `hi@brynncaputo.com` or use their test domain initially). Fill `RESEND_API_KEY`.

- [ ] **Step 7: Link the project to Vercel and enable Blob.** `vercel link`, then add a Blob store from the Vercel dashboard's Storage tab and connect it to this project — this auto-populates `BLOB_READ_WRITE_TOKEN`.

- [ ] **Step 8: Set every variable above in Vercel project settings** (Production and Preview), and in a local `.env` for `vercel dev` testing.

- [ ] **Step 9: Deploy.**

Run: `vercel --prod`

- [ ] **Step 10: Full manual end-to-end run-through, in Stripe test mode.** Pay via each of the three tier pages with a Stripe test card (`4242 4242 4242 4242`) → confirm redirect to `/confirm?session_id=...` → confirm the form appears with email pre-filled → submit with a test file attached → confirm the success state, a new Sheet row, and the arrival of the next-steps email.

- [ ] **Step 11: Commit**

```bash
git add .env.example
git commit -m "docs: add .env.example for checkout flow"
```
