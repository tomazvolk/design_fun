# Warranty tracker v3

Started as a copy of v2 (2026-09-25). The warranty tracker with a new UI and every v1 feature
kept. Plain HTML/CSS/JS, no build step.

Bright, minimal and white, in the spirit of Stripe, Vercel and Notion: black type, hairlines
instead of cards, generous space, Geist throughout with tabular figures, and one bold colour
(ultramarine) used only where something needs you. Red is reserved for urgency. Light first,
dark in Settings.

- **Vault:** a greeting and one sentence about what needs doing, then one list grouped into
  Needs attention, Covered and Ended. Each row shows the item, a span line (what's left in ink,
  what's gone in grey, today ticked; the return window when that's what's closing) and the time
  left as a large figure. The spans draw in once when the vault opens.
- **Item:** opens in a side panel (a bottom sheet on phones) with the summary, the reading, the
  returns and warranty spans, details, the receipt and actions.
- **Landing and sign-up** show the real vault list, built from the sample receipts.
- **Empty vault** offers the three ways to add a receipt.

Tokens (all OKLCH) live in `tokens.css`; `style.css` only uses names. Product truth, including
which directions were tried and rejected, is in `PRODUCT.md`.

Accounts and data live in Supabase once `config.js` names a project: sign up (with email
confirmation), log in and out, password reset by email, password and profile changes, and account
deletion all go through Supabase Auth. Settings are a row in `profiles`, each item a row in
`items`, both locked to their owner by row-level security (`supabase/schema.sql`). The browser
keeps a copy under `warranty-tracker-v3` so the vault opens instantly and works offline; only
changed items are sent up. Logging out clears that copy.

With `config.js` left empty it runs as the local demo it started as: one account, everything in
this browser. Reading a receipt photo is simulated with sample data either way.

To connect a Supabase project:

1. Create a project at supabase.com.
2. SQL Editor: run `supabase/schema.sql`.
3. Authentication → URL Configuration: set Site URL to the deployed app
   (`https://design-fun.vercel.app/warranty-tracker-v3`) and add it, plus
   `http://localhost:*/**` for local testing, to Redirect URLs.
4. Project Settings → API Keys: copy the Project URL and the publishable key into `config.js`.

Receipt photos are small JPEGs stored inside each item's row. Moving them to Supabase Storage is
the next step if people add many photos.

Fixed along the way: "Export PDF" on the vault (it threw in v1), opening an item right after
closing another, prices typed as "1,299.99" or "1.299,99", and confirm dialogs focusing the
destructive button.
