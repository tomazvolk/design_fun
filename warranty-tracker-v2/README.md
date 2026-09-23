# Warranty tracker v2

The warranty tracker with a new UI and every v1 feature kept. Plain HTML/CSS/JS, no build step.

Designed as the category standard played straight, to the craft level of Apple Wallet and
Apple Health: SF system type (Onest where SF isn't available) with SF Rounded readings, a grouped
grey ground, white continuous-corner cards, one color per category, system blue for action.
Light first, dark in Settings.

- **Vault:** a greeting with one sentence about what needs doing. Every item is a Health-style
  reading (a big number and a small unit for the time left, plus a meter for how much of the
  warranty has passed), grouped into Needs attention, Covered and Ended. The meters fill once
  when the vault opens.
- **Item sheet:** opens with the item as a Wallet pass, then one big reading, the returns and
  warranty spans with today marked, details as an inset grouped list, the receipt, and actions.
- **Navigation:** a floating capsule tab bar, in the top bar on desktop and at the bottom on phones.
- **Settings:** the iOS Settings list, with colored icon tiles, switches and segmented controls.

Tokens (all OKLCH) live in `tokens.css`; `style.css` only uses names. Product truth is in
`PRODUCT.md`.

It runs as a demo like v1: accounts, items and settings live in this browser's `localStorage`,
under its own key (`warranty-tracker-next`), so v1 and v2 don't share data. Reading a receipt
photo is simulated with sample data.

Fixed along the way: "Export PDF" on the vault (it threw in v1), opening an item right after
closing another, and prices typed as "1,299.99" or "1.299,99".
