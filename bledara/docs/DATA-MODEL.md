# Bledara: data model and page structure

Everything below is implemented in `prisma/schema.prisma`. Every tenant record carries `orgId`
and every query filters on it, so one database serves many organisations.

## Entity map

```
Organisation ─┬─ Membership ──── User ──┬─ Session
              │     (role)              └─ Account (password or Google)
              ├─ Team
              ├─ Employee ──────────── User? (linked when they can sign in)
              │     ├─ owns Subscription
              │     ├─ ToolAccess (seat, lastActiveAt)
              │     └─ AccessChecklist ── ChecklistItem (grant / revoke per tool)
              ├─ Vendor ───┬─ CodingRule (account, tax rate, cost centre)
              │            └─ Subscription ──┬─ VirtualCard ── Transaction ── Document (invoice)
              │                              ├─ Document (contract, quote)
              │                              ├─ RenewalReminder (60 / 30 / 7 days)
              │                              ├─ RenewalDecision (renew / downgrade / cancel)
              │                              ├─ CancellationTask
              │                              ├─ PriceAlert (previous vs new charge)
              │                              └─ ToolAccess
              ├─ Wallet ── WalletTopUp
              ├─ ImportBatch ── DetectedSubscription (proposed from CSV, confirm or dismiss)
              ├─ ApprovalRule ── ApprovalRuleStep (role or named approver, ordered)
              ├─ PurchaseRequest ── ApprovalDecision (one per step)
              ├─ AccountingSync
              ├─ Integration (card issuer, accounting, email, SSO)
              ├─ Notification, EmailLog (mock mailer writes here)
              └─ AuditLog (actor, action, entity, before / after)
```

## Tables by area

| Area | Models | Notes |
| --- | --- | --- |
| Auth | `User`, `Session`, `Account`, `Verification` | Owned by Better Auth. Email + password and Google. |
| Tenant | `Organisation`, `Membership`, `Team`, `Employee` | `Membership.role` is one of ADMIN, FINANCE, IT, OWNER, EMPLOYEE. An `Employee` is a person in the org; it links to a `User` when they can log in. |
| Inventory | `Vendor`, `Subscription`, `Document` | Subscription: vendor, plan, cost, currency, billing cycle, renewal date, owner, team, category, status, seats, documents. |
| Cards | `Wallet`, `WalletTopUp`, `VirtualCard`, `Transaction` | One card per subscription, amount limit, limit frequency, vendor lock, status. Mock issuer behind `CardProvider`. |
| Import | `ImportBatch`, `DetectedSubscription` | CSV rows grouped by vendor and cadence; the admin confirms or dismisses each proposal. |
| Requests | `PurchaseRequest`, `ApprovalRule`, `ApprovalRuleStep`, `ApprovalDecision` | Rules match on amount range, team and category; lowest priority number wins; steps are ordered. |
| Renewals | `RenewalReminder`, `RenewalDecision`, `CancellationTask`, `PriceAlert` | Reminders at 60, 30 and 7 days. Cancel freezes the card and opens a task. |
| Accounting | `CodingRule`, `AccountingSync`, `Transaction.invoiceId`, `Transaction.coding*` | Charges with no invoice or no rule form the exception queue. Mock provider behind `AccountingProvider`, plus CSV export. |
| Access | `ToolAccess`, `AccessChecklist`, `ChecklistItem` | Seats per tool with last-active dates; onboarding and offboarding checklists per employee. |
| Platform | `Notification`, `EmailLog`, `Integration`, `AuditLog` | Every approval, card action and settings change writes an `AuditLog` row. |

## Roles and permissions

Defined once in `src/lib/permissions.ts` and checked on the server (`requirePermission`, `can`,
`canOnSubscription`). The UI hides what the server would refuse.

| Permission | Admin | Finance | IT | Owner | Employee |
| --- | :-: | :-: | :-: | :-: | :-: |
| Read inventory | ✓ | ✓ | ✓ | ✓ | ✓ |
| Edit inventory, import CSV | ✓ | ✓ | ✓ (no import) | | |
| Manage cards, wallet | ✓ | ✓ | ✓ (no top-up) | own tools only | |
| Read and code transactions | ✓ | ✓ | read only | read only | |
| Create requests | ✓ | ✓ | ✓ | ✓ | ✓ |
| Approve requests | ✓ | ✓ | ✓ | | |
| Decide renewals | ✓ | ✓ | ✓ | own tools only | |
| Insights | ✓ | ✓ | ✓ | | |
| People and access management | ✓ | read | ✓ | read | read |
| Settings (org, roles, rules, integrations) | ✓ | read | read | | |
| Audit log | ✓ | ✓ | ✓ | | |

## Page structure

```
/login, /sign-up, /welcome            (auth)      split layout, Google button when configured
/dashboard                             (app)       totals, build progress, quick links
/subscriptions                                     table: search, filters, sort; CSV import; duplicate flags
/subscriptions/[id]                                details, card, charges, documents, renewal decisions, seats
/cards                                             cards, wallet, top-ups, freeze / unfreeze / cancel
/requests                                          request form, my requests, approvals queue
/renewals                                          calendar + list, reminders, decisions, price changes
/transactions                                      charges, invoices, coding, exception queue, export
/insights                                          spend breakdowns, trend, 12-month forecast, savings
/people                                            people, seats per tool, onboarding / offboarding
/settings                                          organisation
/settings/roles                                    members and roles, invite
/settings/approval-rules                           chains by amount, team, category
/settings/coding-rules                             account, tax rate, cost centre per vendor
/settings/integrations                             issuer, accounting, email, SSO
/audit-log                                         every change, paginated
/api/auth/[...all]                                 Better Auth handler
```

Every `(app)` route sits under one layout that resolves the session, the organisation and the
role, filters the navigation by permission and provides loading, error and not-found states.

## Build order

1. **Data model, auth, roles, seed data** — shipped.
2. Inventory and dashboard.
3. Cards and transactions (mocked issuer).
4. Requests and approvals.
5. Renewals.
6. Accounting automation.
7. Insights and access management.
