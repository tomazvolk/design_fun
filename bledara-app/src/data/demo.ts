/**
 * Dummy data for the prototype: Larkspur Labs, 25 people, 40 subscriptions, 12 months of
 * charges, cards, coding rules, approval rules and seat usage. Deterministic, dates relative
 * to today. The same shape the database version seeds (prisma/schema.prisma).
 */
import type {
  ApprovalRule, AuditEntry, BillingCycle, Category, CodingRule, Dataset, Employee, Membership, Organisation,
  PriceAlert, PurchaseRequest, Role, Subscription, SubscriptionStatus, Team, ToolAccess, Transaction, User, Vendor, VirtualCard,
} from "./types";

export const DEMO_PASSWORD = "demo1234";

// ───────────── deterministic helpers ─────────────
let seed = 20261006;
function rand() {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const between = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);
const addMonths = (d: Date, n: number) => {
  const x = new Date(d);
  const day = x.getDate();
  x.setDate(1);
  x.setMonth(x.getMonth() + n);
  x.setDate(Math.min(day, new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate()));
  return x;
};
const iso = (d: Date) => d.toISOString();
const slug = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const cycleMonths: Record<BillingCycle, number> = { MONTHLY: 1, QUARTERLY: 3, ANNUAL: 12 };

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

type Sub = {
  vendor: string; name: string; plan: string; cost: number; cycle: BillingCycle; category: Category; team: TeamName;
  owner: string; seats?: number; status?: SubscriptionStatus; monthsAgo: number;
  coding?: { account: string; tax: number; cc: string } | null; priceBump?: { monthsAgo: number; factor: number };
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

export const DEMO_ORG: Organisation = {
  id: "org-larkspur",
  name: "Larkspur Labs",
  slug: "larkspur",
  currency: "EUR",
  inboxAddress: "invoices-larkspur@in.bledara.app",
  createdAt: "2026-01-12T09:00:00.000Z",
};

export function buildDemo(now = new Date()): Dataset {
  seed = 20261006;
  const today = new Date(now);
  today.setHours(9, 0, 0, 0);

  const teams: Team[] = TEAMS.map((name) => ({ id: `team-${slug(name)}`, name }));
  const teamId = (n: TeamName) => `team-${slug(n)}`;

  const users: User[] = [];
  const memberships: Membership[] = [];
  const employees: Employee[] = PEOPLE.map((p, i) => {
    const id = `emp-${slug(p.email.split("@")[0]!)}`;
    let userId: string | null = null;
    if (p.login) {
      userId = `user-${slug(p.email.split("@")[0]!)}`;
      users.push({ id: userId, name: p.name, email: p.email });
      memberships.push({ id: `mem-${slug(p.email.split("@")[0]!)}`, userId, role: p.role ?? "EMPLOYEE", createdAt: DEMO_ORG.createdAt });
    }
    return {
      id,
      userId,
      name: p.name,
      email: p.email,
      title: p.title,
      teamId: teamId(p.team),
      status: i === PEOPLE.length - 1 ? "ONBOARDING" : i === PEOPLE.length - 2 ? "OFFBOARDING" : "ACTIVE",
      startDate: iso(addMonths(today, -between(3, 60))),
    };
  });
  const empByEmail = new Map(employees.map((e) => [e.email, e.id]));

  const vendors: Vendor[] = [];
  const subscriptions: Subscription[] = [];
  const cards: VirtualCard[] = [];
  const transactions: Transaction[] = [];
  const codingRules: CodingRule[] = [];
  const toolAccess: ToolAccess[] = [];
  const priceAlerts: PriceAlert[] = [];
  const windowStart = addMonths(today, -12);

  for (const s of SUBS) {
    const vendorId = `vendor-${slug(s.vendor)}`;
    vendors.push({ id: vendorId, name: s.vendor, website: `https://${s.vendor.toLowerCase().replace(/[^a-z0-9]+/g, "")}.com` });

    const startedAt = addMonths(today, -s.monthsAgo);
    const status: SubscriptionStatus = s.status ?? "ACTIVE";
    const months = cycleMonths[s.cycle];
    let renewal = new Date(startedAt);
    while (renewal <= today) renewal = addMonths(renewal, months);

    const subId = `sub-${slug(s.name)}`;
    subscriptions.push({
      id: subId,
      vendorId,
      name: s.name,
      plan: s.plan,
      cost: s.cost,
      currency: "EUR",
      billingCycle: s.cycle,
      renewalDate: iso(renewal),
      ownerId: empByEmail.get(s.owner) ?? null,
      teamId: teamId(s.team),
      category: s.category,
      status,
      seats: s.seats ?? null,
      notes: s.vendor === "Amazon Web Services" ? "Usage based. The figure is the trailing average." : null,
      startedAt: iso(startedAt),
      cancelledAt: status === "CANCELLED" ? iso(addMonths(today, -2)) : null,
    });

    if (s.coding) codingRules.push({ id: `rule-${slug(s.vendor)}`, vendorId, account: s.coding.account, taxRate: s.coding.tax, costCentre: s.coding.cc });

    const cardStatus = status === "CANCELLED" ? "CANCELLED" : status === "PENDING_CANCELLATION" ? "FROZEN" : "ACTIVE";
    const cardId = `card-${slug(s.name)}`;
    cards.push({
      id: cardId,
      subscriptionId: subId,
      last4: String(between(1000, 9999)),
      expMonth: between(1, 12),
      expYear: today.getFullYear() + between(2, 4),
      amountLimit: Math.ceil(s.cost * 1.1),
      limitFrequency: s.cycle === "MONTHLY" ? "MONTHLY" : "PER_TRANSACTION",
      vendorLock: true,
      status: cardStatus,
    });

    let charge = new Date(startedAt);
    let previous: number | null = null;
    const bumpAt = s.priceBump ? addMonths(today, -s.priceBump.monthsAgo) : null;
    let n = 0;
    while (charge <= today) {
      if (charge >= windowStart && !(status === "CANCELLED" && charge > addMonths(today, -2))) {
        let amount = s.cost;
        if (bumpAt && charge >= bumpAt) amount = Math.round(s.cost * s.priceBump!.factor * 100) / 100;
        if (s.vendor === "Amazon Web Services") amount = Math.round(s.cost * (0.85 + rand() * 0.3) * 100) / 100;
        const occurredAt = new Date(charge);
        occurredAt.setHours(between(1, 6), between(0, 59));
        const txId = `tx-${slug(s.name)}-${n++}`;
        transactions.push({
          id: txId,
          subscriptionId: subId,
          cardId,
          vendorId,
          amount,
          currency: "EUR",
          occurredAt: iso(occurredAt),
          description: `${s.vendor.toUpperCase()} *${s.plan.toUpperCase().slice(0, 12)}`,
          status: "SETTLED",
          codingAccount: s.coding?.account ?? null,
          codingTaxRate: s.coding?.tax ?? null,
          codingCostCentre: s.coding?.cc ?? null,
          hasInvoice: rand() > 0.2,
        });
        if (previous !== null && bumpAt && amount > previous * 1.03 && s.vendor !== "Amazon Web Services") {
          priceAlerts.push({ id: `alert-${txId}`, subscriptionId: subId, transactionId: txId, previousAmount: previous, newAmount: amount });
        }
        previous = amount;
      }
      charge = addMonths(charge, months);
    }
    if (cardStatus === "FROZEN") {
      transactions.push({
        id: `tx-${slug(s.name)}-declined`,
        subscriptionId: subId,
        cardId,
        vendorId,
        amount: s.cost,
        currency: "EUR",
        occurredAt: iso(addDays(today, -3)),
        description: `${s.vendor.toUpperCase()} *RENEWAL`,
        status: "DECLINED",
        codingAccount: null,
        codingTaxRate: null,
        codingCostCentre: null,
        hasInvoice: false,
      });
    }

    if (s.seats && status !== "CANCELLED") {
      const teamMembers = employees.filter((e) => e.teamId === teamId(s.team)).map((e) => e.id);
      const pool = Array.from(new Set([...teamMembers, ...employees.map((e) => e.id)]));
      const granted = Math.min(pool.length, Math.max(1, Math.round(Math.min(s.seats, 25) * (0.6 + rand() * 0.35))));
      for (let i = 0; i < granted; i++) {
        const idleDays = rand() < 0.25 ? between(61, 180) : between(0, 20);
        toolAccess.push({ subscriptionId: subId, employeeId: pool[i]!, grantedAt: iso(addDays(startedAt, between(0, 30))), lastActiveAt: iso(addDays(today, -idleDays)) });
      }
    }
  }

  const approvalRules: ApprovalRule[] = [
    { id: "ar-small", name: "Small purchases", priority: 30, minAmount: null, maxAmount: 500, teamId: null, category: null, active: true, steps: [{ order: 0, role: "IT", approverId: null }] },
    { id: "ar-standard", name: "Standard purchases", priority: 50, minAmount: 500, maxAmount: 5000, teamId: null, category: null, active: true, steps: [{ order: 0, role: "IT", approverId: null }, { order: 1, role: "FINANCE", approverId: null }] },
    { id: "ar-large", name: "Large purchases", priority: 70, minAmount: 5000, maxAmount: null, teamId: null, category: null, active: true, steps: [{ order: 0, role: "IT", approverId: null }, { order: 1, role: "FINANCE", approverId: null }, { order: 2, role: "ADMIN", approverId: null }] },
    { id: "ar-security", name: "Security tools", priority: 10, minAmount: null, maxAmount: null, teamId: null, category: "SECURITY", active: true, steps: [{ order: 0, role: null, approverId: empByEmail.get("omar.haddad@larkspur.demo") ?? null }, { order: 1, role: "ADMIN", approverId: null }] },
  ];

  const requests: PurchaseRequest[] = [
    { id: "req-framer", requesterId: empByEmail.get("employee@larkspur.demo")!, toolName: "Framer", vendorName: "Framer", plan: "Pro", cost: 30, billingCycle: "MONTHLY", category: "DESIGN", teamId: teamId("Design"), reason: "Prototype marketing pages without waiting on engineering.", startDate: iso(addDays(today, 7)), status: "PENDING", createdAt: iso(addDays(today, -2)) },
    { id: "req-metabase", requesterId: empByEmail.get("chloe.bennett@larkspur.demo")!, toolName: "Metabase", vendorName: "Metabase", plan: "Pro", cost: 500, billingCycle: "MONTHLY", category: "ANALYTICS", teamId: teamId("Product"), reason: "Self-serve dashboards for the product team.", startDate: iso(addDays(today, 14)), status: "PENDING", createdAt: iso(addDays(today, -1)) },
    { id: "req-apollo", requesterId: empByEmail.get("ben.okafor@larkspur.demo")!, toolName: "Apollo.io", vendorName: "Apollo", plan: "Basic", cost: 49, billingCycle: "MONTHLY", category: "SALES", teamId: teamId("Sales"), reason: "Prospect lists for outbound.", startDate: iso(addDays(today, -20)), status: "REJECTED", createdAt: iso(addDays(today, -25)) },
  ];

  const audit: AuditEntry[] = [
    { id: "audit-0", actorName: "Mira Kovač", actorEmail: "admin@larkspur.demo", action: "organisation.created", entityType: "Organisation", entityId: DEMO_ORG.id, summary: "Larkspur Labs was created.", createdAt: DEMO_ORG.createdAt },
    { id: "audit-1", actorName: "Mira Kovač", actorEmail: "admin@larkspur.demo", action: "member.role_changed", entityType: "Membership", entityId: "mem-finance", summary: "Jonas Weber is now finance (was employee).", createdAt: iso(addDays(today, -40)) },
    { id: "audit-2", actorName: "Priya Natarajan", actorEmail: "it@larkspur.demo", action: "card.frozen", entityType: "VirtualCard", entityId: "card-zendesk", summary: "Zendesk card frozen after the cancel decision.", createdAt: iso(addDays(today, -5)) },
    { id: "audit-3", actorName: "Jonas Weber", actorEmail: "finance@larkspur.demo", action: "wallet.topped_up", entityType: "Wallet", entityId: null, summary: "Wallet topped up by €10,000.", createdAt: iso(addDays(today, -15)) },
  ];

  return {
    teams,
    employees,
    users,
    memberships,
    vendors,
    subscriptions,
    cards,
    transactions,
    codingRules,
    approvalRules,
    requests,
    toolAccess,
    integrations: [
      { id: "int-cards", kind: "CARD_ISSUER", provider: "mock", enabled: true },
      { id: "int-accounting", kind: "ACCOUNTING", provider: "mock", enabled: true },
      { id: "int-email", kind: "EMAIL", provider: "mock", enabled: true },
    ],
    wallet: { balance: 18_450, currency: "EUR", lowBalanceThreshold: 5_000 },
    priceAlerts,
    audit,
  };
}

export const EMPTY_DATASET: Dataset = {
  teams: [],
  employees: [],
  users: [],
  memberships: [],
  vendors: [],
  subscriptions: [],
  cards: [],
  transactions: [],
  codingRules: [],
  approvalRules: [],
  requests: [],
  toolAccess: [],
  integrations: [
    { id: "int-cards", kind: "CARD_ISSUER", provider: "mock", enabled: true },
    { id: "int-accounting", kind: "ACCOUNTING", provider: "mock", enabled: true },
    { id: "int-email", kind: "EMAIL", provider: "mock", enabled: true },
  ],
  wallet: { balance: 0, currency: "EUR", lowBalanceThreshold: 1000 },
  priceAlerts: [],
  audit: [],
};

/** Stable list of subscription ids for static route generation. */
export const DEMO_SUBSCRIPTION_IDS = SUBS.map((s) => `sub-${slug(s.name)}`);
