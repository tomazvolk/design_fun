-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'FINANCE', 'IT', 'OWNER', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ONBOARDING', 'ACTIVE', 'OFFBOARDING', 'OFFBOARDED');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('COMMUNICATION', 'DESIGN', 'ENGINEERING', 'PRODUCTIVITY', 'SALES', 'MARKETING', 'FINANCE', 'HR', 'SECURITY', 'INFRASTRUCTURE', 'ANALYTICS', 'SUPPORT', 'LEGAL', 'OTHER');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'QUARTERLY', 'ANNUAL');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'PENDING_CANCELLATION', 'CANCELLED', 'PAUSED');

-- CreateEnum
CREATE TYPE "DocumentKind" AS ENUM ('CONTRACT', 'INVOICE', 'QUOTE', 'OTHER');

-- CreateEnum
CREATE TYPE "LimitFrequency" AS ENUM ('PER_TRANSACTION', 'MONTHLY', 'ANNUAL');

-- CreateEnum
CREATE TYPE "CardStatus" AS ENUM ('ACTIVE', 'FROZEN', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'SETTLED', 'DECLINED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "TransactionSource" AS ENUM ('CARD', 'IMPORT', 'MANUAL');

-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('PROCESSING', 'REVIEW', 'DONE');

-- CreateEnum
CREATE TYPE "DetectionStatus" AS ENUM ('PROPOSED', 'CONFIRMED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "Decision" AS ENUM ('APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RenewalChoice" AS ENUM ('RENEW', 'DOWNGRADE', 'CANCEL');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('OPEN', 'DONE');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('RUNNING', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "ChecklistKind" AS ENUM ('ONBOARDING', 'OFFBOARDING');

-- CreateEnum
CREATE TYPE "ChecklistAction" AS ENUM ('GRANT', 'REVOKE');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('QUEUED', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "IntegrationKind" AS ENUM ('CARD_ISSUER', 'ACCOUNTING', 'SSO', 'EMAIL');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organisation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "inboxAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'EMPLOYEE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "title" TEXT,
    "teamId" TEXT,
    "status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "matchers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "cost" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "billingCycle" "BillingCycle" NOT NULL,
    "renewalDate" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT,
    "teamId" TEXT,
    "category" "Category" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "seats" INTEGER,
    "notes" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "kind" "DocumentKind" NOT NULL DEFAULT 'OTHER',
    "name" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "lowBalanceThreshold" DECIMAL(12,2) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletTopUp" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "note" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletTopUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VirtualCard" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "providerRef" TEXT NOT NULL,
    "holderName" TEXT NOT NULL,
    "last4" TEXT NOT NULL,
    "expMonth" INTEGER NOT NULL,
    "expYear" INTEGER NOT NULL,
    "amountLimit" DECIMAL(12,2) NOT NULL,
    "limitFrequency" "LimitFrequency" NOT NULL,
    "vendorLock" BOOLEAN NOT NULL DEFAULT true,
    "lockedVendorId" TEXT,
    "status" "CardStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VirtualCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "cardId" TEXT,
    "vendorId" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'SETTLED',
    "source" "TransactionSource" NOT NULL DEFAULT 'CARD',
    "externalRef" TEXT,
    "invoiceId" TEXT,
    "codingAccount" TEXT,
    "codingTaxRate" DECIMAL(5,2),
    "codingCostCentre" TEXT,
    "codedAt" TIMESTAMP(3),
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportBatch" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "rowCount" INTEGER NOT NULL,
    "status" "ImportStatus" NOT NULL DEFAULT 'REVIEW',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetectedSubscription" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "vendorName" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "cadence" "BillingCycle" NOT NULL,
    "occurrences" INTEGER NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,
    "confidence" INTEGER NOT NULL,
    "status" "DetectionStatus" NOT NULL DEFAULT 'PROPOSED',
    "subscriptionId" TEXT,

    CONSTRAINT "DetectedSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseRequest" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "toolName" TEXT NOT NULL,
    "vendorName" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "cost" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "billingCycle" "BillingCycle" NOT NULL,
    "category" "Category" NOT NULL,
    "teamId" TEXT,
    "reason" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "ruleId" TEXT,
    "subscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalRule" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "minAmount" DECIMAL(12,2),
    "maxAmount" DECIMAL(12,2),
    "teamId" TEXT,
    "category" "Category",
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApprovalRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalRuleStep" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "role" "Role",
    "approverId" TEXT,

    CONSTRAINT "ApprovalRuleStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalDecision" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "step" INTEGER NOT NULL,
    "deciderId" TEXT NOT NULL,
    "decision" "Decision" NOT NULL,
    "comment" TEXT,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApprovalDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RenewalDecision" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "choice" "RenewalChoice" NOT NULL,
    "newPlan" TEXT,
    "newCost" DECIMAL(12,2),
    "note" TEXT,
    "decidedBy" TEXT NOT NULL,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RenewalDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RenewalReminder" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "daysBefore" INTEGER NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "RenewalReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CancellationTask" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'OPEN',
    "dueAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "CancellationTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceAlert" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "previousAmount" DECIMAL(12,2) NOT NULL,
    "newAmount" DECIMAL(12,2) NOT NULL,
    "acknowledgedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodingRule" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "taxRate" DECIMAL(5,2) NOT NULL,
    "costCentre" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CodingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountingSync" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" "SyncStatus" NOT NULL,
    "exportedCount" INTEGER NOT NULL DEFAULT 0,
    "message" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "AccountingSync_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToolAccess" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "ToolAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessChecklist" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "kind" "ChecklistKind" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "AccessChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "action" "ChecklistAction" NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "doneAt" TIMESTAMP(3),
    "doneBy" TEXT,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "href" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "EmailStatus" NOT NULL DEFAULT 'SENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "kind" "IntegrationKind" NOT NULL,
    "provider" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "actorId" TEXT,
    "actorEmail" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "summary" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_slug_key" ON "Organisation"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_inboxAddress_key" ON "Organisation"("inboxAddress");

-- CreateIndex
CREATE INDEX "Membership_userId_idx" ON "Membership"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_orgId_userId_key" ON "Membership"("orgId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_orgId_name_key" ON "Team"("orgId", "name");

-- CreateIndex
CREATE INDEX "Employee_orgId_teamId_idx" ON "Employee"("orgId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_orgId_email_key" ON "Employee"("orgId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_orgId_name_key" ON "Vendor"("orgId", "name");

-- CreateIndex
CREATE INDEX "Subscription_orgId_status_idx" ON "Subscription"("orgId", "status");

-- CreateIndex
CREATE INDEX "Subscription_orgId_renewalDate_idx" ON "Subscription"("orgId", "renewalDate");

-- CreateIndex
CREATE INDEX "Subscription_orgId_category_idx" ON "Subscription"("orgId", "category");

-- CreateIndex
CREATE INDEX "Document_orgId_subscriptionId_idx" ON "Document"("orgId", "subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_orgId_key" ON "Wallet"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "VirtualCard_subscriptionId_key" ON "VirtualCard"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "VirtualCard_providerRef_key" ON "VirtualCard"("providerRef");

-- CreateIndex
CREATE INDEX "VirtualCard_orgId_status_idx" ON "VirtualCard"("orgId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_invoiceId_key" ON "Transaction"("invoiceId");

-- CreateIndex
CREATE INDEX "Transaction_orgId_occurredAt_idx" ON "Transaction"("orgId", "occurredAt");

-- CreateIndex
CREATE INDEX "Transaction_orgId_subscriptionId_idx" ON "Transaction"("orgId", "subscriptionId");

-- CreateIndex
CREATE INDEX "DetectedSubscription_orgId_status_idx" ON "DetectedSubscription"("orgId", "status");

-- CreateIndex
CREATE INDEX "PurchaseRequest_orgId_status_idx" ON "PurchaseRequest"("orgId", "status");

-- CreateIndex
CREATE INDEX "ApprovalRule_orgId_priority_idx" ON "ApprovalRule"("orgId", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalRuleStep_ruleId_order_key" ON "ApprovalRuleStep"("ruleId", "order");

-- CreateIndex
CREATE INDEX "ApprovalDecision_requestId_idx" ON "ApprovalDecision"("requestId");

-- CreateIndex
CREATE INDEX "RenewalDecision_orgId_subscriptionId_idx" ON "RenewalDecision"("orgId", "subscriptionId");

-- CreateIndex
CREATE INDEX "RenewalReminder_orgId_dueAt_idx" ON "RenewalReminder"("orgId", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "RenewalReminder_subscriptionId_daysBefore_dueAt_key" ON "RenewalReminder"("subscriptionId", "daysBefore", "dueAt");

-- CreateIndex
CREATE INDEX "CancellationTask_orgId_status_idx" ON "CancellationTask"("orgId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PriceAlert_transactionId_key" ON "PriceAlert"("transactionId");

-- CreateIndex
CREATE INDEX "PriceAlert_orgId_acknowledgedAt_idx" ON "PriceAlert"("orgId", "acknowledgedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CodingRule_vendorId_key" ON "CodingRule"("vendorId");

-- CreateIndex
CREATE INDEX "CodingRule_orgId_idx" ON "CodingRule"("orgId");

-- CreateIndex
CREATE INDEX "AccountingSync_orgId_startedAt_idx" ON "AccountingSync"("orgId", "startedAt");

-- CreateIndex
CREATE INDEX "ToolAccess_orgId_employeeId_idx" ON "ToolAccess"("orgId", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "ToolAccess_subscriptionId_employeeId_key" ON "ToolAccess"("subscriptionId", "employeeId");

-- CreateIndex
CREATE INDEX "AccessChecklist_orgId_employeeId_idx" ON "AccessChecklist"("orgId", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistItem_checklistId_subscriptionId_key" ON "ChecklistItem"("checklistId", "subscriptionId");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "EmailLog_orgId_createdAt_idx" ON "EmailLog"("orgId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Integration_orgId_kind_key" ON "Integration"("orgId", "kind");

-- CreateIndex
CREATE INDEX "AuditLog_orgId_createdAt_idx" ON "AuditLog"("orgId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_orgId_entityType_entityId_idx" ON "AuditLog"("orgId", "entityType", "entityId");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTopUp" ADD CONSTRAINT "WalletTopUp_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualCard" ADD CONSTRAINT "VirtualCard_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualCard" ADD CONSTRAINT "VirtualCard_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualCard" ADD CONSTRAINT "VirtualCard_lockedVendorId_fkey" FOREIGN KEY ("lockedVendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "VirtualCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportBatch" ADD CONSTRAINT "ImportBatch_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetectedSubscription" ADD CONSTRAINT "DetectedSubscription_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetectedSubscription" ADD CONSTRAINT "DetectedSubscription_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "ImportBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetectedSubscription" ADD CONSTRAINT "DetectedSubscription_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequest" ADD CONSTRAINT "PurchaseRequest_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequest" ADD CONSTRAINT "PurchaseRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequest" ADD CONSTRAINT "PurchaseRequest_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequest" ADD CONSTRAINT "PurchaseRequest_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "ApprovalRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequest" ADD CONSTRAINT "PurchaseRequest_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalRule" ADD CONSTRAINT "ApprovalRule_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalRule" ADD CONSTRAINT "ApprovalRule_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalRuleStep" ADD CONSTRAINT "ApprovalRuleStep_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "ApprovalRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalRuleStep" ADD CONSTRAINT "ApprovalRuleStep_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalDecision" ADD CONSTRAINT "ApprovalDecision_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "PurchaseRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenewalDecision" ADD CONSTRAINT "RenewalDecision_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenewalDecision" ADD CONSTRAINT "RenewalDecision_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenewalReminder" ADD CONSTRAINT "RenewalReminder_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenewalReminder" ADD CONSTRAINT "RenewalReminder_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CancellationTask" ADD CONSTRAINT "CancellationTask_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CancellationTask" ADD CONSTRAINT "CancellationTask_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CancellationTask" ADD CONSTRAINT "CancellationTask_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceAlert" ADD CONSTRAINT "PriceAlert_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceAlert" ADD CONSTRAINT "PriceAlert_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceAlert" ADD CONSTRAINT "PriceAlert_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodingRule" ADD CONSTRAINT "CodingRule_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodingRule" ADD CONSTRAINT "CodingRule_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingSync" ADD CONSTRAINT "AccountingSync_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolAccess" ADD CONSTRAINT "ToolAccess_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolAccess" ADD CONSTRAINT "ToolAccess_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolAccess" ADD CONSTRAINT "ToolAccess_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessChecklist" ADD CONSTRAINT "AccessChecklist_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessChecklist" ADD CONSTRAINT "AccessChecklist_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "AccessChecklist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
