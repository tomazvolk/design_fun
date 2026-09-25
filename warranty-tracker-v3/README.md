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

It runs as a demo like v1: accounts, items and settings live in this browser's `localStorage`,
under its own key (`warranty-tracker-v3`), so v1, v2 and v3 don't share data. Reading a receipt
photo is simulated with sample data.

Fixed along the way: "Export PDF" on the vault (it threw in v1), opening an item right after
closing another, prices typed as "1,299.99" or "1.299,99", and confirm dialogs focusing the
destructive button.
