# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People keeping receipts for things they've bought for the home: appliances, electronics, computers, furniture, tools. They open the vault now and then, not daily: after a purchase, when a reminder arrives, or when something breaks and they need proof. Often on a phone, at home, in daylight, sometimes holding the paper receipt.

## Product Purpose

Keep every receipt in one place, track each item's warranty and return window, and remind the owner before either runs out. When something breaks, produce a claim-ready PDF with the proof of purchase. Success: nobody misses a return window or pays for a repair the warranty would have covered.

## Positioning

EU-first: warranty lengths default to the region's legal minimum (2 years in the EU), per category, and every item shows two spans side by side, the return window and the warranty, with today marked on both.

## Operating Context

- Receipts arrive as a phone photo, an uploaded PDF or screenshot, or typed in by hand.
- Reminders: 30 and 7 days before a warranty ends, 2 days before a return window closes; on the device and/or by email.
- The claim moment: an item breaks, the owner opens it, checks it's still covered, exports the PDF.

## Capabilities and Constraints

- Prototype PWA, plain HTML/CSS/JS, no build step. Data lives in this browser's localStorage; passwords stored as SHA-256 hashes.
- Receipt reading is simulated with sample data; there is no inbox scanning. No payment is taken.
- Accounts: sign up, log in, reset password, log out, delete account.
- Vault: urgency-sorted list capped at 8 with "Show all", search (⌘K), category and shop filters, export all as PDF.
- Item panel: headline status, returns and warranty spans, details, reminders sentence, receipt preview, edit, delete with undo, claim PDF, "check this" review flags.
- Settings: profile, appearance (system/light/dark), password, region and per-category warranty defaults, default return window, reminder toggles, plan (Free: 10 items; Plus: unlimited + PDF exports, €3.50/month or €30/year), download JSON, sample items, danger zone.
- v2 must keep all v1 functionality; it replaces only the visual design.

## Brand Commitments

Name: Warranty tracker. Voice: plain, calm, specific, sentence case; errors name the problem and the fix.

Standing preference (v2, 2026-09-23): the category standard played straight, at the craft level of Apple Wallet and Apple Health. Consumer-grade clarity, big numbers, rounded surfaces, a system feel on the phone. Not v1's Quiet SaaS look, and nothing that reads as AI-generated.

## Evidence on Hand

Nine sample receipts with dates relative to today (Amazon.de, Bauhaus, MediaMarkt, Big Bang, Garmin, Apple, IKEA, Dyson). No real users, testimonials, metrics or press exist; none may be invented.

## Product Principles

- Lead with what needs doing and by when; everything else is secondary.
- Show time honestly: how much of a warranty is gone, how much is left, what today means.
- Proof is always one tap away from the item it belongs to.
- Calm by default; urgency only where a date is actually close.
- Never look generated: v2 must not read as v1 recoloured or as a templated AI dashboard.
