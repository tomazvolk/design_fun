# Bledara

A SaaS management platform: finance and IT teams discover, buy, pay for, manage and cancel every
software subscription from one place.

Build step 1 of 7 is live: the full data model, accounts (email + password, Google when
configured), organisations with five roles enforced on the server, an audit log, and a seeded
demo organisation. The map of what comes next is in [docs/DATA-MODEL.md](docs/DATA-MODEL.md).

## Stack

Next.js (App Router) · TypeScript · Tailwind · shadcn/ui · PostgreSQL · Prisma · Better Auth · Vitest

## Run it locally

Requires Node 22+, pnpm and a PostgreSQL database.

```sh
pnpm install
cp .env.example .env            # fill in DATABASE_URL, DIRECT_URL and BETTER_AUTH_SECRET
pnpm db:migrate                 # creates the schema
pnpm db:seed                    # loads the demo organisation
pnpm dev                        # http://localhost:3000
```

Homebrew Postgres works out of the box: `brew install postgresql@17 && brew services start postgresql@17 && createdb bledara`,
then `DATABASE_URL="postgresql://$USER@localhost:5432/bledara"` (same for `DIRECT_URL`).

### Demo login

The seed creates **Larkspur Labs** with 25 people, 40 subscriptions, 12 months of charges, one
virtual card per subscription, coding rules, approval rules and seat usage.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@larkspur.demo` | `demo1234` |
| Finance | `finance@larkspur.demo` | `demo1234` |
| IT | `it@larkspur.demo` | `demo1234` |
| Tool owner | `owner@larkspur.demo` | `demo1234` |
| Employee | `employee@larkspur.demo` | `demo1234` |

The login page offers these as one-click buttons. Set `NEXT_PUBLIC_DEMO_LOGINS=false` to hide them.
Re-running `pnpm db:seed` wipes and recreates the demo organisation only.

### Google sign-in

Create an OAuth client in Google Cloud with the redirect URI
`<BETTER_AUTH_URL>/api/auth/callback/google`, then set `GOOGLE_CLIENT_ID` and
`GOOGLE_CLIENT_SECRET`. The button appears automatically. People who sign in with Google and do
not belong to an organisation yet are asked to create one.

## Tests

```sh
pnpm test        # vitest: permission matrix (approval routing, reminders and forecast follow in their steps)
pnpm typecheck
pnpm lint
```

## Deploy to Vercel

1. Import the `design_fun` repository and set **Root Directory** to `bledara`.
2. Create a Postgres database (Supabase works well). Environment variables:
   - `DATABASE_URL`: the transaction pooler URL (port 6543) with `?pgbouncer=true`
   - `DIRECT_URL`: the session pooler URL (port 5432), used for migrations
   - `BETTER_AUTH_SECRET`: `openssl rand -base64 32`
   - `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL`: the deployment URL, e.g. `https://bledara.vercel.app`
   - optionally `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
3. Deploy. The `vercel-build` script runs `prisma migrate deploy` before `next build`.
4. Seed the demo once from your machine: `DATABASE_URL=<direct url> DIRECT_URL=<direct url> pnpm db:seed`.

## Where things live

```
prisma/schema.prisma        the data model
prisma/seed.ts              demo organisation
src/lib/auth.ts             Better Auth server config
src/lib/permissions.ts      roles → permissions, owner scoping
src/lib/tenant.ts           session + organisation context for pages and actions
src/lib/audit.ts            recordAudit()
src/lib/actions/org.ts      organisation, roles and invites (server actions)
src/app/(auth)/             login, sign-up, welcome
src/app/(app)/              the product, one page per folder
src/components/             shell, shared states, shadcn/ui
tests/                      vitest
```

## Mocked by design

The card issuer, accounting system and mailer are mocks behind interfaces (`CardProvider`,
`AccountingProvider`, mailer) so real providers can be plugged in later. No real money moves.
