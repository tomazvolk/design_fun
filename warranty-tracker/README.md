# Warranty tracker

Receipt and warranty vault PWA. Plain HTML/CSS/JS, no build step. Styled with the
"Quiet SaaS" design guide: Inter at 14px, hairline borders, one mint accent, light and dark.

It runs as a demo: accounts, items and settings live in this browser's `localStorage`
(passwords are stored as SHA-256 hashes, never as typed). Reading a receipt photo is
simulated with sample data. There's no inbox scanning.

## What's in it

- **Landing, sign up, log in, reset password.** Sign up shows a live preview of your vault
  next to the form. Log out and delete account from the avatar menu and Settings.
- **Vault:** opens with a greeting and one sentence about what needs doing, with a button
  straight to the most urgent item. Below it, every item as a landscape card — what, paid,
  where and when it was bought, the warranty length and days left, and a bar showing how
  much of the warranty has already passed — sorted by urgency, capped at 8 with "Show all".
  Search (⌘K), category and shop filters.
- **Item panel:** one headline fact, Returns and Warranty drawn as two aligned spans with today marked, details, reminders in
  a sentence, the receipt drawn as a paper document, edit and delete (with undo), claim PDF.
- **Add a receipt:** take a photo, upload a file, or type it in. Unsure fields are
  flagged "Check this".
- **Settings:** profile and appearance (system, light, dark), password, warranty rules by
  region and category, reminders (30 and 7 days before a warranty ends, 2 days before a
  return window closes), plan (free: 10 items; Plus: unlimited and PDF exports),
  download data, sample items, danger zone.

New accounts start empty. "Try with sample items" loads nine receipts with dates relative
to today, so the demo never goes stale.
