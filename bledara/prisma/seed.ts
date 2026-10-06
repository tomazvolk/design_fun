/**
 * Demo data for Bledara: one organisation (Larkspur Labs), 25 people, 40 subscriptions,
 * 12 months of charges, cards, coding rules, approval rules and seat usage.
 *
 * Deterministic: the same inputs produce the same data, dates are relative to today.
 * Run with `pnpm db:seed`. Safe to re-run: it wipes the demo organisation first.
 */
import { PrismaClient, type BillingCycle, type Category, type Role } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "demo1234";
const ORG_SLUG = "larkspur";

// ───────────── deterministic helpers ─────────────
let seed = 20261006;
function rand() {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const pick = <T>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)]!;
const between = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const today = new Date();
today.setHours(9, 0, 0, 0);
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);
const addMonths = (d: Date, n: number) => {
  const x = new Date(d);
  const day = x.getDate();
  x.setDate(1);
  x.setMonth(x.getMonth() + n);
  x.setDate(Math.min(day, new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate()));
  return x;
};
const cycleMonths: Record<BillingCycle, number> = { MONTHLY: 1, QUARTERLY: 3, ANNUAL: 12 };

// ───────────── people ─────────────
const TEAMS = ["Engineering", "Design", "Product", "Sales", "Marketing", "Finance", "People", "Operations"] as const;
type TeamName = (typeof TEAMS)[number];

type Person = { name: string; email: string; title: string; team: TeamName; role?: Role; login?: boolean };
const PEOPLE: Person[] = [
  { name: "Mira Kovač", email: "admin@larkspur.demo", title: "Head of Operations", team: "Operations", role: "ADMIN", login: true },
  { name: "Jonas Weber", email: "finance@larkspur.demo", title: "Finance Lead", team: "Finance", role: "FINANCE", login: true },
  { name: "Priya Natarajan", email: "it@larkspur.demo", title: "IT Manager", team: "Operations", role: "IT", login: true },
  { name: "Tomasz Nowak", email: "owner@larkspur.demo", title: "Design Lead", team: "Design", role: "OWNER", login: true },
  { name: "Elena Rossi", email: "employee@larkspur.demo", title: "Product Designer", team: "Design", role: "EMPLOYEE", login: true },
  { name: "Aiden Walsh", email: "aiden.walsh@larkspur.demo", title: "Engineering Manager", team: "Engineering" },
  { name: "Sofia Lindqvist", email: "sofia.lindqvist@larkspur.demo", title: "Senior Engineer", team: "Engineering" },
  { name: "Kwame Mensah", email: "kwame.mensah@larkspur.demo", title: "Platform Engineer", team: "Engineering" },
  { name: "Yuki Tanaka", email: "yuki.tanaka@larkspur.demo", title: "Frontend Engineer", team: "Engineering" },
  { name: "Lucas Moreau", email: "lucas.moreau@larkspur.demo", title: "Backend Engineer", team: "Engineering" },
  { name: "Hana Dvořák", email: "hana.dvorak@larkspur.demo", title: "QA Engineer", team: "Engineering" },
  { name: "Omar Haddad", email: "omar.haddad@larkspur.demo", title: "Security Engineer", team: "Engineering" },
  { name: "Ingrid Solberg", email: "ingrid.solberg@larkspur.demo", title: "Head of Product", team: "Product" },
  { name: "Diego Álvarez", email: "diego.alvarez@larkspur.demo", title: "Product Manager", team: "Product" },
  { name: "Chloe Bennett", email: "chloe.bennett@larkspur.demo", title: "Data Analyst", team: "Product" },
  { name: "Rafael Costa", email: "rafael.costa@larkspur.demo", title: "Sales Director", team: "Sales" },
  { name: "Nadia Petrova", email: "nadia.petrova@larkspur.demo", title: "Account Executive", team: "Sales" },
  { name: "Ben Okafor", email: "ben.okafor@larkspur.demo", title: "Sales Development Rep", team: "Sales" },
  { name: "Amélie Dubois", email: "amelie.dubois@larkspur.demo", title: "Head of Marketing", team: "Marketing" },
  { name: "Marco Bianchi", email: "marco.bianchi@larkspur.demo", title: "Content Marketer", team: "Marketing" },
  { name: "Zara Ahmed", email: "zara.ahmed@larkspur.demo", title: "Growth Marketer", team: "Marketing" },
  { name: "Felix Brandt", email: "felix.brandt@larkspur.demo", title: "Accountant", team: "Finance" },
  { name: "Leila Haugen", email: "leila.haugen@larkspur.demo", title: "People Partner", team: "People" },
  { name: "Noah Fischer", email: "noah.fischer@larkspur.demo", title: "Recruiter", team: "People" },
  { name: "Ana Horvat", email: "ana.horvat@larkspur.demo", title: "Office Manager", team: "Operations" },
];

// ───────────── subscriptions ─────────────
type Sub = {
  vendor: string;
  name: string;
  plan: string;
  cost: number; // per billing period
  cycle: BillingCycle;
  category: Category;
  team: TeamName;
  owner: string; // email
  seats?: number;
  status?: "ACTIVE" | "TRIAL" | "CANCELLED" | "PAUSED" | "PENDING_CANCELLATION";
  monthsAgo: number; // started
  coding?: { account: string; tax: number; cc: string } | null;
  priceBump?: { monthsAgo: number; factor: number };
};

const SUBS: Sub[] = [
  { vendor: "Slack", name: "Slack", plan: "Business+", cost: 787.5, cycle: "MONTHLY", category: "COMMUNICATION", team: "Operations", owner: "it@larkspur.demo", seats: 70, monthsAgo: 30, coding: { account: "6410 Software", tax: 22, cc: "OPS" }, priceBump: { monthsAgo: 4, factor: 1.08 } },
  { vendor: "Zoom", name: "Zoom Workplace", plan: "Business", cost: 2628, cycle: "ANNUAL", category: "COMMUNICATION", team: "Operations", owner: "it@larkspur.demo", seats: 12, monthsAgo: 20, coding: { account: "6410 Software", tax: 22, cc: "OPS" } },
  { vendor: "Whereby", name: "Whereby", plan: "Business", cost: 59.9, cycle: "MONTHLY", category: "COMMUNICATION", team: "Sales", owner: "rafael.costa@larkspur.demo", seats: 6, monthsAgo: 9, coding: null },
  { vendor: "Google", name: "Google Workspace", plan: "Business Standard", cost: 1008, cycle: "MONTHLY", category: "PRODUCTIVITY", team: "Operations", owner: "it@larkspur.demo", seats: 84, monthsAgo: 36, coding: { account: "6410 Software", tax: 22, cc: "OPS" } },
  { vendor: "Notion", name: "Notion", plan: "Business", cost: 1260, cycle: "MONTHLY", category: "PRODUCTIVITY", team: "Product", owner: "ingrid.solberg@larkspur.demo", seats: 70, monthsAgo: 26, coding: { account: "6410 Software", tax: 22, cc: "PRD" }, priceBump: { monthsAgo: 7, factor: 1.12 } },
  { vendor: "Asana", name: "Asana", plan: "Advanced", cost: 599.4, cycle: "MONTHLY", category: "PRODUCTIVITY", team: "Marketing", owner: "amelie.dubois@larkspur.demo", seats: 20, monthsAgo: 14, coding: { account: "6410 Software", tax: 22, cc: "MKT" } },
  { vendor: "Linear", name: "Linear", plan: "Business", cost: 448, cycle: "MONTHLY", category: "ENGINEERING", team: "Engineering", owner: "aiden.walsh@larkspur.demo", seats: 32, monthsAgo: 18, coding: { account: "6410 Software", tax: 22, cc: "ENG" } },
  { vendor: "Atlassian", name: "Jira Software", plan: "Standard", cost: 275, cycle: "MONTHLY", category: "ENGINEERING", team: "Engineering", owner: "aiden.walsh@larkspur.demo", seats: 25, monthsAgo: 40, coding: { account: "6410 Software", tax: 22, cc: "ENG" } },
  { vendor: "GitHub", name: "GitHub", plan: "Team", cost: 1584, cycle: "ANNUAL", category: "ENGINEERING", team: "Engineering", owner: "aiden.walsh@larkspur.demo", seats: 33, monthsAgo: 38, coding: { account: "6410 Software", tax: 0, cc: "ENG" } },
  { vendor: "Vercel", name: "Vercel", plan: "Pro", cost: 240, cycle: "MONTHLY", category: "INFRASTRUCTURE", team: "Engineering", owner: "kwame.mensah@larkspur.demo", seats: 12, monthsAgo: 22, coding: { account: "6420 Hosting", tax: 0, cc: "ENG" } },
  { vendor: "Amazon Web Services", name: "AWS", plan: "Pay as you go", cost: 4180, cycle: "MONTHLY", category: "INFRASTRUCTURE", team: "Engineering", owner: "kwame.mensah@larkspur.demo", monthsAgo: 44, coding: { account: "6420 Hosting", tax: 0, cc: "ENG" } },
  { vendor: "Cloudflare", name: "Cloudflare", plan: "Pro + Workers", cost: 95, cycle: "MONTHLY", category: "INFRASTRUCTURE", team: "Engineering", owner: "kwame.mensah@larkspur.demo", monthsAgo: 28, coding: { account: "6420 Hosting", tax: 0, cc: "ENG" } },
  { vendor: "Datadog", name: "Datadog", plan: "Pro", cost: 1890, cycle: "MONTHLY", category: "INFRASTRUCTURE", team: "Engineering", owner: "kwame.mensah@larkspur.demo", seats: 15, monthsAgo: 16, coding: { account: "6420 Hosting", tax: 0, cc: "ENG" }, priceBump: { monthsAgo: 2, factor: 1.19 } },
  { vendor: "Sentry", name: "Sentry", plan: "Team", cost: 348, cycle: "ANNUAL", category: "ENGINEERING", team: "Engineering", owner: "sofia.lindqvist@larkspur.demo", monthsAgo: 25, coding: { account: "6410 Software", tax: 0, cc: "ENG" } },
  { vendor: "Postman", name: "Postman", plan: "Basic", cost: 1512, cycle: "ANNUAL", category: "ENGINEERING", team: "Engineering", owner: "lucas.moreau@larkspur.demo", seats: 9, monthsAgo: 13, coding: null },
  { vendor: "JetBrains", name: "JetBrains All Products", plan: "Organisation", cost: 7470, cycle: "ANNUAL", category: "ENGINEERING", team: "Engineering", owner: "aiden.walsh@larkspur.demo", seats: 10, monthsAgo: 15, coding: { account: "6410 Software", tax: 22, cc: "ENG" } },
  { vendor: "Figma", name: "Figma", plan: "Organisation", cost: 6300, cycle: "ANNUAL", category: "DESIGN", team: "Design", owner: "owner@larkspur.demo", seats: 14, monthsAgo: 27, coding: { account: "6410 Software", tax: 22, cc: "DSG" } },
  { vendor: "Miro", name: "Miro", plan: "Business", cost: 384, cycle: "MONTHLY", category: "DESIGN", team: "Design", owner: "owner@larkspur.demo", seats: 24, monthsAgo: 19, coding: { account: "6410 Software", tax: 22, cc: "DSG" } },
  { vendor: "Whimsical", name: "Whimsical", plan: "Pro", cost: 120, cycle: "MONTHLY", category: "DESIGN", team: "Product", owner: "diego.alvarez@larkspur.demo", seats: 10, monthsAgo: 7, coding: null },
  { vendor: "Adobe", name: "Adobe Creative Cloud", plan: "Teams, all apps", cost: 5319.6, cycle: "ANNUAL", category: "DESIGN", team: "Design", owner: "owner@larkspur.demo", seats: 6, monthsAgo: 31, coding: { account: "6410 Software", tax: 22, cc: "DSG" } },
  { vendor: "Canva", name: "Canva", plan: "Teams", cost: 90, cycle: "MONTHLY", category: "DESIGN", team: "Marketing", owner: "amelie.dubois@larkspur.demo", seats: 6, monthsAgo: 11, coding: { account: "6410 Software", tax: 22, cc: "MKT" } },
  { vendor: "1Password", name: "1Password", plan: "Business", cost: 7560, cycle: "ANNUAL", category: "SECURITY", team: "Operations", owner: "it@larkspur.demo", seats: 84, monthsAgo: 23, coding: { account: "6430 Security", tax: 22, cc: "OPS" } },
  { vendor: "Okta", name: "Okta", plan: "Workforce Identity", cost: 1764, cycle: "ANNUAL", category: "SECURITY", team: "Operations", owner: "omar.haddad@larkspur.demo", seats: 84, monthsAgo: 17, coding: { account: "6430 Security", tax: 22, cc: "OPS" } },
  { vendor: "CrowdStrike", name: "CrowdStrike Falcon", plan: "Go", cost: 5100, cycle: "ANNUAL", category: "SECURITY", team: "Operations", owner: "omar.haddad@larkspur.demo", seats: 85, monthsAgo: 12, coding: { account: "6430 Security", tax: 22, cc: "OPS" } },
  { vendor: "HubSpot", name: "HubSpot", plan: "Sales Hub Professional", cost: 900, cycle: "MONTHLY", category: "SALES", team: "Sales", owner: "rafael.costa@larkspur.demo", seats: 10, monthsAgo: 21, coding: { account: "6440 Sales tools", tax: 22, cc: "SLS" } },
  { vendor: "Pipedrive", name: "Pipedrive", plan: "Advanced", cost: 147, cycle: "MONTHLY", category: "SALES", team: "Sales", owner: "nadia.petrova@larkspur.demo", seats: 3, monthsAgo: 8, coding: null },
  { vendor: "LinkedIn", name: "LinkedIn Sales Navigator", plan: "Core", cost: 2988, cycle: "ANNUAL", category: "SALES", team: "Sales", owner: "rafael.costa@larkspur.demo", seats: 3, monthsAgo: 14, coding: { account: "6440 Sales tools", tax: 22, cc: "SLS" } },
  { vendor: "Mailchimp", name: "Mailchimp", plan: "Standard", cost: 310, cycle: "MONTHLY", category: "MARKETING", team: "Marketing", owner: "zara.ahmed@larkspur.demo", monthsAgo: 24, coding: { account: "6450 Marketing", tax: 22, cc: "MKT" } },
  { vendor: "Semrush", name: "Semrush", plan: "Guru", cost: 249.95, cycle: "MONTHLY", category: "MARKETING", team: "Marketing", owner: "marco.bianchi@larkspur.demo", seats: 1, monthsAgo: 13, coding: { account: "6450 Marketing", tax: 22, cc: "MKT" } },
  { vendor: "Ahrefs", name: "Ahrefs", plan: "Standard", cost: 249, cycle: "MONTHLY", category: "MARKETING", team: "Marketing", owner: "zara.ahmed@larkspur.demo", seats: 1, monthsAgo: 5, coding: null },
  { vendor: "Webflow", name: "Webflow", plan: "Business site + Growth", cost: 1452, cycle: "ANNUAL", category: "MARKETING", team: "Marketing", owner: "amelie.dubois@larkspur.demo", seats: 3, monthsAgo: 19, coding: { account: "6450 Marketing", tax: 22, cc: "MKT" } },
  { vendor: "Mixpanel", name: "Mixpanel", plan: "Growth", cost: 420, cycle: "MONTHLY", category: "ANALYTICS", team: "Product", owner: "chloe.bennett@larkspur.demo", monthsAgo: 16, coding: { account: "6410 Software", tax: 22, cc: "PRD" } },
  { vendor: "Amplitude", name: "Amplitude", plan: "Plus", cost: 61, cycle: "MONTHLY", category: "ANALYTICS", team: "Product", owner: "chloe.bennett@larkspur.demo", monthsAgo: 4, coding: null, status: "TRIAL" },
  { vendor: "Intercom", name: "Intercom", plan: "Advanced", cost: 1140, cycle: "MONTHLY", category: "SUPPORT", team: "Product", owner: "diego.alvarez@larkspur.demo", seats: 8, monthsAgo: 20, coding: { account: "6410 Software", tax: 22, cc: "PRD" } },
  { vendor: "Zendesk", name: "Zendesk", plan: "Suite Team", cost: 660, cycle: "MONTHLY", category: "SUPPORT", team: "Sales", owner: "nadia.petrova@larkspur.demo", seats: 6, monthsAgo: 29, coding: { account: "6410 Software", tax: 22, cc: "SLS" }, status: "PENDING_CANCELLATION" },
  { vendor: "Xero", name: "Xero", plan: "Established", cost: 78, cycle: "MONTHLY", category: "FINANCE", team: "Finance", owner: "finance@larkspur.demo", seats: 4, monthsAgo: 42, coding: { account: "6460 Finance tools", tax: 22, cc: "FIN" } },
  { vendor: "Expensify", name: "Expensify", plan: "Collect", cost: 425, cycle: "MONTHLY", category: "FINANCE", team: "Finance", owner: "felix.brandt@larkspur.demo", seats: 85, monthsAgo: 33, coding: { account: "6460 Finance tools", tax: 22, cc: "FIN" } },
  { vendor: "Personio", name: "Personio", plan: "Core", cost: 8400, cycle: "ANNUAL", category: "HR", team: "People", owner: "leila.haugen@larkspur.demo", seats: 85, monthsAgo: 11, coding: { account: "6470 HR tools", tax: 22, cc: "PPL" } },
  { vendor: "Greenhouse", name: "Greenhouse", plan: "Essential", cost: 7200, cycle: "ANNUAL", category: "HR", team: "People", owner: "noah.fischer@larkspur.demo", seats: 6, monthsAgo: 9, coding: null },
  { vendor: "DocuSign", name: "DocuSign", plan: "Business Pro", cost: 480, cycle: "ANNUAL", category: "LEGAL", team: "Operations", owner: "admin@larkspur.demo", seats: 2, monthsAgo: 35, coding: { account: "6410 Software", tax: 22, cc: "OPS" }, status: "CANCELLED" },
];

const ACCOUNT_NAMES = ["Bledara virtual", "Bledara card"];

async function main() {
  console.log("Seeding Bledara demo…");

  // Wipe the demo org (cascades) and its demo users.
  const existing = await prisma.organisation.findUnique({ where: { slug: ORG_SLUG } });
  if (existing) await prisma.organisation.delete({ where: { id: existing.id } });
  await prisma.user.deleteMany({ where: { email: { endsWith: "@larkspur.demo" } } });

  const org = await prisma.organisation.create({
    data: {
      name: "Larkspur Labs",
      slug: ORG_SLUG,
      currency: "EUR",
      inboxAddress: `invoices-${ORG_SLUG}@in.bledara.app`,
    },
  });

  // Teams
  const teamIds = new Map<TeamName, string>();
  for (const name of TEAMS) {
    const t = await prisma.team.create({ data: { orgId: org.id, name } });
    teamIds.set(name, t.id);
  }

  // Users + memberships + employees
  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const employeeIdByEmail = new Map<string, string>();
  const userIdByEmail = new Map<string, string>();
  for (const [i, p] of PEOPLE.entries()) {
    let userId: string | null = null;
    if (p.login) {
      const user = await prisma.user.create({
        data: {
          name: p.name,
          email: p.email,
          emailVerified: true,
          memberships: { create: { orgId: org.id, role: p.role ?? "EMPLOYEE" } },
        },
      });
      // Better Auth expects a credential account whose accountId is the user id.
      await prisma.account.create({
        data: { userId: user.id, accountId: user.id, providerId: "credential", password: passwordHash },
      });
      userId = user.id;
      userIdByEmail.set(p.email, user.id);
    }
    const startDate = addMonths(today, -between(3, 60));
    const emp = await prisma.employee.create({
      data: {
        orgId: org.id,
        userId,
        name: p.name,
        email: p.email,
        title: p.title,
        teamId: teamIds.get(p.team)!,
        status: i === PEOPLE.length - 1 ? "ONBOARDING" : i === PEOPLE.length - 2 ? "OFFBOARDING" : "ACTIVE",
        startDate,
      },
    });
    employeeIdByEmail.set(p.email, emp.id);
  }

  // Wallet
  const wallet = await prisma.wallet.create({
    data: { orgId: org.id, balance: 18_450, currency: "EUR", lowBalanceThreshold: 5_000 },
  });
  for (const [monthsAgo, amount] of [
    [11, 20000],
    [7, 15000],
    [3, 25000],
    [0.5, 10000],
  ] as const) {
    await prisma.walletTopUp.create({
      data: {
        walletId: wallet.id,
        amount,
        note: "Monthly funding",
        createdBy: userIdByEmail.get("finance@larkspur.demo"),
        createdAt: addDays(today, -Math.round(monthsAgo * 30)),
      },
    });
  }

  // Vendors, subscriptions, cards, transactions, coding rules, access
  const adminEmployee = employeeIdByEmail.get("admin@larkspur.demo")!;
  const allEmployeeIds = [...employeeIdByEmail.values()];
  let txCount = 0;
  let cardCount = 0;
  let accessCount = 0;

  for (const s of SUBS) {
    const vendor = await prisma.vendor.create({
      data: {
        orgId: org.id,
        name: s.vendor,
        website: `https://${s.vendor.toLowerCase().replace(/[^a-z0-9]+/g, "")}.com`,
        matchers: [s.vendor.toLowerCase(), s.name.toLowerCase()],
      },
    });

    const startedAt = addMonths(today, -s.monthsAgo);
    const status = s.status ?? "ACTIVE";
    const months = cycleMonths[s.cycle];
    // Next renewal: first period boundary strictly after today.
    let renewal = new Date(startedAt);
    while (renewal <= today) renewal = addMonths(renewal, months);

    const sub = await prisma.subscription.create({
      data: {
        orgId: org.id,
        vendorId: vendor.id,
        name: s.name,
        plan: s.plan,
        cost: s.cost,
        currency: "EUR",
        billingCycle: s.cycle,
        renewalDate: renewal,
        ownerId: employeeIdByEmail.get(s.owner) ?? adminEmployee,
        teamId: teamIds.get(s.team)!,
        category: s.category,
        status,
        seats: s.seats ?? null,
        startedAt,
        cancelledAt: status === "CANCELLED" ? addMonths(today, -2) : null,
        notes: s.vendor === "Amazon Web Services" ? "Usage based. The figure is the trailing average." : null,
      },
    });

    if (s.coding) {
      await prisma.codingRule.create({
        data: { orgId: org.id, vendorId: vendor.id, account: s.coding.account, taxRate: s.coding.tax, costCentre: s.coding.cc },
      });
    }

    // One virtual card per subscription (mock issuer).
    const cardStatus = status === "CANCELLED" ? "CANCELLED" : status === "PENDING_CANCELLATION" ? "FROZEN" : "ACTIVE";
    const card = await prisma.virtualCard.create({
      data: {
        orgId: org.id,
        subscriptionId: sub.id,
        providerRef: `mock_card_${sub.id.slice(-10)}`,
        holderName: pick(ACCOUNT_NAMES),
        last4: String(between(1000, 9999)),
        expMonth: between(1, 12),
        expYear: today.getFullYear() + between(2, 4),
        amountLimit: Math.ceil(s.cost * 1.1),
        limitFrequency: s.cycle === "MONTHLY" ? "MONTHLY" : "PER_TRANSACTION",
        vendorLock: true,
        lockedVendorId: vendor.id,
        status: cardStatus,
        createdAt: startedAt,
      },
    });
    cardCount++;

    // Charges over the past 12 months.
    const windowStart = addMonths(today, -12);
    let charge = new Date(startedAt);
    let previousAmount: number | null = null;
    const bumpAt = s.priceBump ? addMonths(today, -s.priceBump.monthsAgo) : null;
    while (charge <= today) {
      if (charge >= windowStart && !(status === "CANCELLED" && charge > addMonths(today, -2))) {
        let amount = s.cost;
        if (bumpAt && charge >= bumpAt) amount = Math.round(s.cost * s.priceBump!.factor * 100) / 100;
        if (s.vendor === "Amazon Web Services") amount = Math.round(s.cost * (0.85 + rand() * 0.3) * 100) / 100;
        const occurredAt = new Date(charge);
        occurredAt.setHours(between(1, 6), between(0, 59));
        const tx = await prisma.transaction.create({
          data: {
            orgId: org.id,
            subscriptionId: sub.id,
            cardId: card.id,
            vendorId: vendor.id,
            amount,
            currency: "EUR",
            occurredAt,
            description: `${s.vendor.toUpperCase()} *${s.plan.toUpperCase().slice(0, 12)}`,
            status: "SETTLED",
            source: "CARD",
            externalRef: `mock_tx_${Math.floor(rand() * 1e9).toString(36)}`,
            codingAccount: s.coding?.account ?? null,
            codingTaxRate: s.coding?.tax ?? null,
            codingCostCentre: s.coding?.cc ?? null,
            codedAt: s.coding ? occurredAt : null,
          },
        });
        txCount++;
        if (previousAmount !== null && bumpAt && amount > previousAmount * 1.03 && s.vendor !== "Amazon Web Services") {
          await prisma.priceAlert.create({
            data: { orgId: org.id, subscriptionId: sub.id, transactionId: tx.id, previousAmount, newAmount: amount },
          });
        }
        previousAmount = amount;
      }
      charge = addMonths(charge, months);
    }

    // A couple of declined attempts on the frozen card.
    if (cardStatus === "FROZEN") {
      await prisma.transaction.create({
        data: {
          orgId: org.id,
          subscriptionId: sub.id,
          cardId: card.id,
          vendorId: vendor.id,
          amount: s.cost,
          currency: "EUR",
          occurredAt: addDays(today, -3),
          description: `${s.vendor.toUpperCase()} *RENEWAL`,
          status: "DECLINED",
          source: "CARD",
          externalRef: `mock_tx_declined_${sub.id.slice(-6)}`,
        },
      });
      txCount++;
    }

    // Seat usage: who has access and when they were last active.
    if (s.seats && status !== "CANCELLED") {
      const teamMembers = PEOPLE.filter((p) => p.team === s.team).map((p) => employeeIdByEmail.get(p.email)!);
      const pool = Array.from(new Set([...teamMembers, ...allEmployeeIds]));
      const granted = Math.min(pool.length, Math.max(1, Math.round(Math.min(s.seats, 25) * (0.6 + rand() * 0.35))));
      for (let i = 0; i < granted; i++) {
        const employeeId = pool[i]!;
        const idleDays = rand() < 0.25 ? between(61, 180) : between(0, 20);
        await prisma.toolAccess.create({
          data: {
            orgId: org.id,
            subscriptionId: sub.id,
            employeeId,
            grantedAt: addDays(startedAt, between(0, 30)),
            lastActiveAt: addDays(today, -idleDays),
          },
        });
        accessCount++;
      }
    }

    // Reminders for upcoming renewals (60, 30, 7 days before).
    if (status === "ACTIVE" || status === "TRIAL") {
      for (const daysBefore of [60, 30, 7]) {
        const dueAt = addDays(renewal, -daysBefore);
        await prisma.renewalReminder.create({
          data: { orgId: org.id, subscriptionId: sub.id, daysBefore, dueAt, sentAt: dueAt < today ? dueAt : null },
        });
      }
    }

    if (status === "PENDING_CANCELLATION") {
      await prisma.cancellationTask.create({
        data: {
          orgId: org.id,
          subscriptionId: sub.id,
          assigneeId: employeeIdByEmail.get("it@larkspur.demo"),
          dueAt: renewal,
          note: "Export tickets before the seats close.",
        },
      });
      await prisma.renewalDecision.create({
        data: {
          orgId: org.id,
          subscriptionId: sub.id,
          choice: "CANCEL",
          note: "Moving support to Intercom.",
          decidedBy: userIdByEmail.get("admin@larkspur.demo")!,
          decidedAt: addDays(today, -5),
        },
      });
    }
  }

  // Approval rules
  const itRule = await prisma.approvalRule.create({
    data: {
      orgId: org.id,
      name: "Small purchases",
      priority: 30,
      maxAmount: 500,
      steps: { create: [{ order: 0, role: "IT" }] },
    },
  });
  await prisma.approvalRule.create({
    data: {
      orgId: org.id,
      name: "Standard purchases",
      priority: 50,
      minAmount: 500,
      maxAmount: 5000,
      steps: { create: [{ order: 0, role: "IT" }, { order: 1, role: "FINANCE" }] },
    },
  });
  await prisma.approvalRule.create({
    data: {
      orgId: org.id,
      name: "Large purchases",
      priority: 70,
      minAmount: 5000,
      steps: { create: [{ order: 0, role: "IT" }, { order: 1, role: "FINANCE" }, { order: 2, role: "ADMIN" }] },
    },
  });
  await prisma.approvalRule.create({
    data: {
      orgId: org.id,
      name: "Security tools",
      priority: 10,
      category: "SECURITY",
      steps: { create: [{ order: 0, approverId: employeeIdByEmail.get("omar.haddad@larkspur.demo") }, { order: 1, role: "ADMIN" }] },
    },
  });

  // Purchase requests
  await prisma.purchaseRequest.createMany({
    data: [
      {
        orgId: org.id,
        requesterId: employeeIdByEmail.get("employee@larkspur.demo")!,
        toolName: "Framer",
        vendorName: "Framer",
        plan: "Pro",
        cost: 30,
        billingCycle: "MONTHLY",
        category: "DESIGN",
        teamId: teamIds.get("Design"),
        reason: "Prototype marketing pages without waiting on engineering.",
        startDate: addDays(today, 7),
        status: "PENDING",
        ruleId: itRule.id,
        createdAt: addDays(today, -2),
      },
      {
        orgId: org.id,
        requesterId: employeeIdByEmail.get("chloe.bennett@larkspur.demo")!,
        toolName: "Metabase",
        vendorName: "Metabase",
        plan: "Pro",
        cost: 500,
        billingCycle: "MONTHLY",
        category: "ANALYTICS",
        teamId: teamIds.get("Product"),
        reason: "Self-serve dashboards for the product team.",
        startDate: addDays(today, 14),
        status: "PENDING",
        createdAt: addDays(today, -1),
      },
      {
        orgId: org.id,
        requesterId: employeeIdByEmail.get("ben.okafor@larkspur.demo")!,
        toolName: "Apollo.io",
        vendorName: "Apollo",
        plan: "Basic",
        cost: 49,
        billingCycle: "MONTHLY",
        category: "SALES",
        teamId: teamIds.get("Sales"),
        reason: "Prospect lists for outbound.",
        startDate: addDays(today, -20),
        status: "REJECTED",
        createdAt: addDays(today, -25),
      },
    ],
  });

  // Integrations (all mocked)
  await prisma.integration.createMany({
    data: [
      { orgId: org.id, kind: "CARD_ISSUER", provider: "mock", enabled: true, config: { note: "Simulated issuer. Swap for a real CardProvider." } },
      { orgId: org.id, kind: "ACCOUNTING", provider: "mock", enabled: true, config: { export: "csv" } },
      { orgId: org.id, kind: "EMAIL", provider: "mock", enabled: true, config: { from: "notifications@bledara.app" } },
    ],
  });

  await prisma.auditLog.create({
    data: {
      orgId: org.id,
      actorId: userIdByEmail.get("admin@larkspur.demo"),
      actorEmail: "admin@larkspur.demo",
      action: "organisation.created",
      entityType: "Organisation",
      entityId: org.id,
      summary: "Larkspur Labs was created from the demo seed.",
    },
  });

  console.log(`Done. ${PEOPLE.length} people, ${SUBS.length} subscriptions, ${cardCount} cards, ${txCount} transactions, ${accessCount} seat assignments.`);
  console.log(`Log in as admin@larkspur.demo / ${DEMO_PASSWORD} (also finance@, it@, owner@, employee@).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
