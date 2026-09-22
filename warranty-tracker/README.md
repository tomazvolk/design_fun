# Warranty tracker

Receipt and warranty vault PWA. Plain HTML/CSS/JS, no build step. Built from the
"Warranty & Receipt Vault" PRD.

Everything runs in the browser in demo mode: inbox scanning, the Google consent step
and receipt reading (OCR) are simulated with sample data, and your data stays in
`localStorage`. Settings → *Restart the demo* clears it.

## What's in it

- **Onboarding:** a "what we read" privacy step, then Gmail (simulated consent) or iCloud
  Mail (guided app-specific password flow), a live scan that shows receipts found and
  look-alikes skipped (newsletters, delivery updates, rides, subscriptions), and a review
  step before anything is added.
- **Vault:** a "Needs attention" row (return windows closing, warranties ending, details to
  check), search, status/category/shop filters, and a coverage bar per item.
- **Item panel:** time left, a bought → today → ends timeline, return window, details,
  reminders, the original email or photo, edit and delete (with undo).
- **Add a receipt:** take a photo, upload a file, or type it in. Low-confidence fields are
  flagged "Check this".
- **Reminders:** 30 and 7 days before a warranty ends, 2 days before a return window closes.
- **Settings:** connected inboxes, warranty defaults per region and category, reminder
  toggles, download or delete all data, plan (free: 10 items; Plus trial starts when an
  inbox is connected).
- **Export:** a print-ready claim summary per item, or a summary of the whole vault
  (use "Save as PDF" in the print dialog). Plus only.

Dates in the sample data are relative to today, so the demo never goes stale.
