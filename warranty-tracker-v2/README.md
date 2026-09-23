# Warranty tracker v2

The warranty tracker with a new UI and every v1 feature kept. Plain HTML/CSS/JS, no build step.

Designed as **The Folio**: the vault kept like fine stationery. Pale Nile-blue writing paper,
navy fountain-pen ink, deep grained leather covers (one per category) with a tooled gilt border,
and sealing-wax red only for what's urgent. Bodoni Moda for headings and numerals, Hanken
Grotesk for everything read at a glance. Light first, dark ("the folio at night") in Settings.

- **Letterhead:** wordmark, text navigation, a writing-line search, and your monogram in gilt.
- **Vault:** a greeting and one sentence about what needs doing. Items that need attention are
  leather covers; everything else sits in a ruled ledger with a leather ribbon per category.
  Each item shows time left as an engraved numeral and a span line (what's left in ink, what's
  gone faint, today ticked), which inks in once when the vault opens.
- **Item:** opens with its cover, then the reading set like an engraved card, the returns and
  warranty spans, ruled details, the receipt drawn on thermal paper, and actions.
- **Sign up:** a folio cover with your name stamped in gilt as you type it.
- **Landing:** fanned covers built from the sample receipts, then the three things the product
  makes: a kept receipt, a reminder, a claim summary.

Tokens (all OKLCH, plus the grain textures) live in `tokens.css`; `style.css` only uses names.
Product truth is in `PRODUCT.md`, the design system in `DESIGN.md`.

It runs as a demo like v1: accounts, items and settings live in this browser's `localStorage`,
under its own key (`warranty-tracker-next`), so v1 and v2 don't share data. Reading a receipt
photo is simulated with sample data.

Fixed along the way: "Export PDF" on the vault (it threw in v1), opening an item right after
closing another, prices typed as "1,299.99" or "1.299,99", and confirm dialogs focusing the
destructive button.
