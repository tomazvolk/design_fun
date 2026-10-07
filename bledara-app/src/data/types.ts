/** Domain types for the prototype. They mirror prisma/schema.prisma, the target data model. */

export type Role = "ADMIN" | "FINANCE" | "IT" | "OWNER" | "EMPLOYEE";

export type Category =
  | "COMMUNICATION" | "DESIGN" | "ENGINEERING" | "PRODUCTIVITY" | "SALES" | "MARKETING" | "FINANCE"
  | "HR" | "SECURITY" | "INFRASTRUCTURE" | "ANALYTICS" | "SUPPORT" | "LEGAL" | "OTHER";

export type BillingCycle = "MONTHLY" | "QUARTERLY" | "ANNUAL";
export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "PENDING_CANCELLATION" | "CANCELLED" | "PAUSED";
export type EmployeeStatus = "ONBOARDING" | "ACTIVE" | "OFFBOARDING" | "OFFBOARDED";
export type CardStatus = "ACTIVE" | "FROZEN" | "CANCELLED";
export type LimitFrequency = "PER_TRANSACTION" | "MONTHLY" | "ANNUAL";
export type TransactionStatus = "PENDING" | "SETTLED" | "DECLINED" | "REFUNDED";
export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN";
export type IntegrationKind = "CARD_ISSUER" | "ACCOUNTING" | "EMAIL" | "SSO";

export type Organisation = {
  id: string;
  name: string;
  slug: string;
  currency: string;
  inboxAddress: string;
  createdAt: string; // ISO
};

export type User = { id: string; name: string; email: string; image?: string | null };

export type Membership = { id: string; userId: string; role: Role; createdAt: string };

export type Team = { id: string; name: string };

export type Employee = {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  title: string | null;
  teamId: string | null;
  status: EmployeeStatus;
  startDate: string | null;
};

export type Vendor = { id: string; name: string; website: string | null };

export type Subscription = {
  id: string;
  vendorId: string;
  name: string;
  plan: string;
  cost: number;
  currency: string;
  billingCycle: BillingCycle;
  renewalDate: string;
  ownerId: string | null;
  teamId: string | null;
  category: Category;
  status: SubscriptionStatus;
  seats: number | null;
  notes: string | null;
  startedAt: string;
  cancelledAt: string | null;
};

export type VirtualCard = {
  id: string;
  subscriptionId: string;
  last4: string;
  expMonth: number;
  expYear: number;
  amountLimit: number;
  limitFrequency: LimitFrequency;
  vendorLock: boolean;
  status: CardStatus;
};

export type Transaction = {
  id: string;
  subscriptionId: string | null;
  cardId: string | null;
  vendorId: string | null;
  amount: number;
  currency: string;
  occurredAt: string;
  description: string;
  status: TransactionStatus;
  codingAccount: string | null;
  codingTaxRate: number | null;
  codingCostCentre: string | null;
  hasInvoice: boolean;
};

export type CodingRule = { id: string; vendorId: string; account: string; taxRate: number; costCentre: string };

export type ApprovalStep = { order: number; role: Role | null; approverId: string | null };
export type ApprovalRule = {
  id: string;
  name: string;
  priority: number;
  minAmount: number | null;
  maxAmount: number | null;
  teamId: string | null;
  category: Category | null;
  active: boolean;
  steps: ApprovalStep[];
};

export type PurchaseRequest = {
  id: string;
  requesterId: string;
  toolName: string;
  vendorName: string;
  plan: string;
  cost: number;
  billingCycle: BillingCycle;
  category: Category;
  teamId: string | null;
  reason: string;
  startDate: string;
  status: RequestStatus;
  createdAt: string;
};

export type ToolAccess = { subscriptionId: string; employeeId: string; grantedAt: string; lastActiveAt: string | null };

export type Integration = { id: string; kind: IntegrationKind; provider: string; enabled: boolean };

export type Wallet = { balance: number; currency: string; lowBalanceThreshold: number };

export type PriceAlert = { id: string; subscriptionId: string; transactionId: string; previousAmount: number; newAmount: number };

export type AuditEntry = {
  id: string;
  actorName: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string | null;
  summary: string;
  createdAt: string;
};

export type Dataset = {
  teams: Team[];
  employees: Employee[];
  users: User[];
  memberships: Membership[];
  vendors: Vendor[];
  subscriptions: Subscription[];
  cards: VirtualCard[];
  transactions: Transaction[];
  codingRules: CodingRule[];
  approvalRules: ApprovalRule[];
  requests: PurchaseRequest[];
  toolAccess: ToolAccess[];
  integrations: Integration[];
  wallet: Wallet;
  priceAlerts: PriceAlert[];
  audit: AuditEntry[];
};
