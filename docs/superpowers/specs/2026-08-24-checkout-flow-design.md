# Checkout Flow — Design Spec

Source: GitHub issue #1 ("Checkout Experience")

## Purpose

Sell three tiers of 1-hour UX/product consulting ($250 vibe-coder, $500 small
company, $3000 startup+), collect structured intake data tied to the paid
session, notify the client by email, and land everything in a Google Sheet
for manual follow-up. No accounts, no database — the Sheet is the system of
record.

## Constraints / decisions already made

- Site moves from static GitHub Pages to Vercel (`@astrojs/vercel` adapter,
  `output: 'server'`). Existing pages stay prerendered; only the new routes
  are on-demand.
- Three separate static pricing pages, not one dynamic page.
- Linking a form submission to a payment: Stripe Payment Link's
  after-payment redirect uses the `{CHECKOUT_SESSION_ID}` template variable
  → `/confirm?session_id=...`. The session ID is verified server-side
  against the Stripe API before any data is accepted; it's never trusted
  from the client alone.
- Email via Resend.
- Files via Vercel Blob, client-side direct upload (upload token pattern,
  avoids serverless payload/timeout limits).
- Google Sheets write via a service account (Sheet shared with the service
  account's email; JSON key stored as a Vercel env var).
- "Client portal" = the `/confirm?session_id=...` page itself. No login,
  no persistent accounts. Out of scope for this build.
- The existing `/checkout` page (bare Payment Link, no data capture) is
  replaced by this flow and removed.

## Implementation note (added during deploy setup, 2026-08-24)

Google Sheets writes were switched from a service-account JSON key to a
**Google Apps Script Web App** bound to the Sheet. The user's Google Cloud
project blocks service-account key creation via an org policy that
requires Cloud Console IAM/policy work to lift — not something to push a
non-technical user through for a portfolio-site feature. Apps Script
needs no Cloud project, no IAM, no key: a script pasted into the Sheet's
own editor (Extensions → Apps Script), deployed as a Web App, called over
plain HTTP with a shared secret. Same guarantee (only this flow's server
code can write to the Sheet, verified per-request), same append-only
Sheet-as-datastore design — different transport. `lib/sheets.ts`'s
`appendIntakeRow` now POSTs `{ secret, values }` to the Web App URL
instead of calling the Sheets API directly; `GOOGLE_SHEETS_WEBAPP_URL`
and `GOOGLE_SHEETS_WEBAPP_SECRET` replace the three `GOOGLE_SERVICE_*`
env vars everywhere in this spec and the implementation plan.

## Implementation note (added during planning)

The plan implements this without an Astro server adapter. The site stays
static (`output: 'static'`); `/confirm` is a static page whose inline
client script calls `GET /api/verify-session` (a plain Vercel Serverless
Function) before showing the form. All dynamic logic — verification, the
webhook, the intake write, the Blob upload token — lives in a root-level
`/api` directory, which Vercel supports for any static frontend. This
preserves every guarantee in this spec (server-side verification, no
client-trusted data) while touching none of the ~15 existing static pages.

## Flow

1. Visitor lands on one of three pricing pages, clicks through to that
   tier's Stripe Payment Link, pays.
2. Stripe redirects to `/confirm?session_id={CHECKOUT_SESSION_ID}`.
3. `/confirm` (server-rendered) retrieves the Checkout Session from Stripe.
   - `payment_status !== 'paid'` or lookup fails → render an error state,
     no form.
   - Paid → render the intake form, pre-filling email if Stripe has it.
4. Client fills out the form, adds file(s) — files upload directly to
   Vercel Blob from the browser as they're added.
5. On submit, the page posts to `POST /api/submit-intake` with
   `session_id`, form fields, and the resulting Blob URLs.
6. `/api/submit-intake` re-verifies the session against Stripe
   server-side, then appends one row to the Google Sheet.
   - Sheet write fails → return an error; the page tells the client to
     email directly as a fallback, so intake data is never silently lost.
7. Independently, `POST /api/stripe-webhook` receives
   `checkout.session.completed` (signature-verified), and sends a
   "next steps" email via Resend containing the same `/confirm` link —
   this is a second channel in case the client closes the tab before the
   redirect completes, and is the "email dispatched upon payment
   confirmation" requirement from the issue.

## Components

### Pages (prerendered / static)
- `src/pages/checkout/vibe-coder.astro` — $250
- `src/pages/checkout/small-company.astro` — $500
- `src/pages/checkout/startup.astro` — $3000

Each: persona-specific copy (reuse tone/style from the existing
`ConsultCTA` component and `about.astro`), price, and a button to that
tier's Stripe Payment Link. Tier metadata (name, price, Payment Link URL,
persona blurb) lives in `src/data/checkoutTiers.ts` so the three pages
share a single source of truth without sharing a template.

### Page (server-rendered)
- `src/pages/confirm.astro` (`export const prerender = false`)
  - Reads `session_id` from the query string.
  - Calls Stripe (`checkout.sessions.retrieve`) server-side.
  - Renders error state or the intake form.
  - Form fields: Company Name, Client Name, Email, description (textarea),
    repeatable "product/website link" inputs with an add-link button
    (plain vanilla JS, no framework — matches the rest of the site), file
    upload (client-side Blob upload).
  - On successful submit, shows a thank-you state in place of the form.

### API routes
- `src/pages/api/submit-intake.ts` (POST)
  - Re-verifies `session_id` via Stripe.
  - Appends a row to the Sheet: timestamp, session_id, tier, amount,
    company, client name, email, description, links (joined), file URLs
    (joined).
- `src/pages/api/blob-upload.ts` (POST)
  - Vercel Blob client-upload token endpoint (`handleUpload` callback) so
    the browser can upload directly to Blob without routing file bytes
    through a serverless function.
- `src/pages/api/stripe-webhook.ts` (POST)
  - Verifies Stripe signature with `STRIPE_WEBHOOK_SECRET`.
  - On `checkout.session.completed`, sends the next-steps email via Resend.

### Removed
- `src/pages/checkout.astro` and the now-unused
  `UX_1HR_CONSULT_CHECKOUT_URL` export in `src/data/site.ts`.

## Data model

No database. One Google Sheet, one row per submission (append-only —
resubmission produces a second row rather than an update; acceptable at
expected volume). Columns:

`timestamp | session_id | tier | amount | company_name | client_name | email | description | links | file_urls`

`session_id` is the join key back to Stripe if you ever need to
cross-reference a payment.

## Config / env vars (Vercel project settings)

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `GOOGLE_SHEET_ID`
- `BLOB_READ_WRITE_TOKEN` (auto-provided once Vercel Blob is linked to the
  project)

New dependencies: `stripe`, `resend`, `googleapis`, `@vercel/blob`.

## Error handling

- `/confirm` with missing/invalid/unpaid session → error state, no form,
  no data accepted.
- Webhook signature failure → 400, logged, no email sent (fail closed).
- Sheet write failure on submit → surfaced to the client with a fallback
  "email us directly" instruction; never a silent failure.
- Blob upload failure → surfaced inline next to the file field before
  the client can submit the rest of the form.

## Testing

- Stripe CLI: `stripe trigger checkout.session.completed` against the
  local webhook route to verify signature check + email send.
- Manual full run-through in Stripe test mode: test card on each of the
  three Payment Links → redirect → form → Sheet row appears → email
  arrives.
- Unit-level: session verification logic (paid / unpaid / invalid ID) in
  both `/confirm` and `/api/submit-intake`, since it's the security
  boundary for the whole flow.

## Out of scope (explicitly, per issue answers)

- Persistent client accounts / login.
- Editing or updating a previous submission.
- Any UI beyond the single confirm/intake page for the "portal."
