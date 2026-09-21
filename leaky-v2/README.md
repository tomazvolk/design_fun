# Leaky v2

Leaky restyled as 80s arcade pixel art: PICO-8 palette, Press Start 2P + VT323, notched pixel frames,
stepped motion and Drip the droplet mascot. Same app and data model as [`../leaky`](../leaky); demo data is
stored under its own key (`leaky-v2:v1`) so the two versions don't overwrite each other.

Subscription tracker PWA. Plain HTML/CSS/JS, no build step.

With `config.js` empty, Leaky runs in **demo mode**: sign-in is simulated and data stays in the browser.
Fill it in to switch on real accounts backed by Supabase (free tier).

## Turn on real accounts

1. **Create a Supabase project** at https://supabase.com (free plan).
2. **Create the table.** Open *SQL Editor*, paste [`supabase/schema.sql`](supabase/schema.sql), run it.
3. **Set the URLs.** *Authentication → URL Configuration*:
   - Site URL: `https://design-fun.vercel.app/leaky-v2/`
   - Redirect URLs: `https://design-fun.vercel.app/leaky-v2/` and `http://localhost:4173/leaky-v2/`
4. **Copy the keys.** *Project Settings → API*: the Project URL and the `anon` public key.
   Put both in [`config.js`](config.js), commit and push. They are safe to publish; the
   row-level security in `schema.sql` means each user can only read and write their own row.

Email + password now works, including confirmation emails and password reset.

### Optional: Google sign-in

1. In Google Cloud Console, create an OAuth client of type *Web application*.
   Authorised redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`.
2. In Supabase, *Authentication → Providers → Google*: turn it on and paste the client ID and secret.

Until then the button shows "Google sign-in isn't switched on yet."

### Notes

- Supabase's built-in email sender is limited to a few messages an hour and is meant for testing.
  For real users, add your own SMTP (for example Resend's free tier) under *Authentication → SMTP Settings*.
- Free projects pause after a week without activity; opening the dashboard wakes them.
- *Delete account* in Settings calls the `delete_account()` function from `schema.sql`, which removes
  the user and, through the cascade, their data.
