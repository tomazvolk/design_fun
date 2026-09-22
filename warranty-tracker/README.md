# Warranty tracker

Receipt and warranty vault PWA. Plain HTML/CSS/JS, no build step. Styled with the
"Quiet SaaS" design guide: Inter at 14px, hairline borders, one mint accent, light and dark.

It runs as a demo: accounts, items and settings live in this browser's `localStorage`
(passwords are stored as SHA-256 hashes, never as typed). Reading a receipt photo is
simulated with sample data. There's no inbox scanning.

## What's in it

- **Landing, sign up, log in, reset password.** Sign up shows a live preview of your vault
  next to the form. Log out and delete account from the avatar menu and Settings.
- **Home:** greeting, a summary row, "Needs attention" (return windows closing, warranties
  ending, details to check) and an items table with status filters, category, shop and
  sort, plus search in the top bar (⌘K).
- **Item panel:** time left, a bought → today → ends timeline, return window, details,
  reminders, the receipt, edit and delete (with undo), and a claim PDF.
- **Add a receipt:** take a photo, upload a file, or type it in. Unsure fields are
  flagged "Check this".
- **Reminders:** 30 and 7 days before a warranty ends, 2 days before a return window closes.
- **Settings:** profile and appearance (system, light, dark), password, warranty rules by
  region and category, reminders, plan (free: 10 items; Plus: unlimited and PDF exports),
  download data, sample items, danger zone.

New accounts start empty. "Try with sample items" loads nine receipts with dates relative
to today, so the demo never goes stale.
