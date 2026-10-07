# Bledara

A SaaS management platform: finance and IT teams discover, buy, pay for, manage and cancel every
software subscription from one place.

**Current state: a clickable prototype on dummy data.** It is a static export served from the
design-fun shelf at `/bledara`. Everything runs in the browser: the demo organisation is generated
on load (`src/data/demo.ts`), and your changes (sign-in, roles, invites, settings, audit entries)
are kept in this browser's localStorage. No server, no database, nothing leaves the browser.

Build step 1 of 7 is covered: the full data model (`prisma/schema.prisma`, the target for the
database version), sign in and sign up, five roles with a permission matrix, an audit log and the
seeded demo company. The map of what comes next is in [docs/DATA-MODEL.md](docs/DATA-MODEL.md).

## Stack

Next.js (App Router, static export) · TypeScript · Tailwind · shadcn/ui · Vitest

## Run it locally

```sh
pnpm install
pnpm dev          # http://localhost:3000/bledara
```

### Demo login

**Larkspur Labs** has 25 people, 40 subscriptions, 12 months of charges, one virtual card per
subscription, coding rules, approval rules and seat usage.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@larkspur.demo` | `demo1234` |
| Finance | `finance@larkspur.demo` | `demo1234` |
| IT | `it@larkspur.demo` | `demo1234` |
| Tool owner | `owner@larkspur.demo` | `demo1234` |
| Employee | `employee@larkspur.demo` | `demo1234` |

The login page offers these as one-click buttons. Set `NEXT_PUBLIC_DEMO_LOGINS=false` at build
time to hide them. "Create an organisation" on the sign-up page starts an empty organisation in
this browser; "Reset demo data" in the account menu brings Larkspur Labs back.

## Tests and checks

```sh
pnpm test         # vitest: permission matrix
pnpm typecheck
pnpm lint
```

## Publish

```sh
pnpm export       # next build, then replaces ../bledara with the fresh static export
```

Commit `bledara/` together with the source and push; the design-fun Vercel project serves it
at https://design-fun.vercel.app/bledara. The root `.vercelignore` keeps `bledara-app/` out of
that deployment.

## Where things live

```
prisma/schema.prisma        the target data model (not used by the prototype build)
src/data/types.ts           domain types mirroring the schema
src/data/demo.ts            dummy data generator, deterministic, dates relative to today
src/lib/store.tsx           in-browser "backend": session, organisation, roles, audit log
src/lib/permissions.ts      roles → permissions, owner scoping
src/app/(auth)/             login, sign-up
src/app/(app)/              the product, one page per folder
src/components/             shell, shared states, shadcn/ui
tests/                      vitest
```

## Going real

The database version of step 1 (Postgres, Prisma, Better Auth with email + Google, server
actions, server-side authorisation) is in git history at commit `e06ca38`. It needs a Vercel
project with a Postgres database; the prototype needs neither.

## Mocked by design

The card issuer, accounting system and mailer are mocks behind interfaces (`CardProvider`,
`AccountingProvider`, mailer) so real providers can be plugged in later. No real money moves.
