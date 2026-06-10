# Product Requirements Document (PRD)
# Project: Enterprise Employee Travel & Expense Management System (TEMS)

> **Version:** 1.0 | **Date:** 2026-06-10 | **Status:** Draft for Stakeholder Review
> **Prepared by:** Senior Product Manager | **Audience:** Product, Engineering, QA, UAT, Finance, HR

---

## 1. Problem Statement

### What problem is being solved?
10,000+ employees across multiple office locations manage their travel and expense lifecycle entirely through unstructured channels — email threads, Excel spreadsheets, phone calls, and paper vouchers. This creates a fragmented, error-prone, and auditable process with no single system of record.

### Who is affected?

| Stakeholder | Pain Point |
|---|---|
| **Employee (Traveler)** | No visibility on approval status; delays in reimbursement; unclear policy limits; manual receipt scanning and emailing |
| **Manager (Approver)** | Email overload; no structured view of team travel; inability to track pending approvals with SLA context |
| **Finance Executive** | Manual verification of each claim against policy; high error rates; slow multi-step payment processing |
| **Compliance Officer** | Cannot enforce policy limits in real time; duplicate/fraudulent claims go undetected |
| **Auditor** | No centralized audit trail; no immutable log of who approved what and when |
| **HR Admin** | Org hierarchy maintained in disconnected spreadsheets; changes to reporting lines break approval routing |

### Why is it important?
- Manual processing costs are high — estimates indicate 30–45 minutes of human effort per claim.
- Policy violations (duplicate claims, limit breaches) are detected only post-payment, if at all.
- Delayed reimbursements negatively impact employee experience and retention.
- Regulatory audits require immutable, timestamped records that spreadsheets cannot provide.
- At 10,000+ employees across locations, the operational risk of uncontrolled travel spend is a material financial exposure.

---

## 2. Solution Overview

### High-Level Solution Description
TEMS is a centralized, web-based, role-driven platform that digitizes and automates the full employee travel and expense lifecycle — from pre-trip request and multi-level approval, through expense claim submission with receipt attachment, automated policy enforcement, finance audit, and banking-integrated reimbursement — with a complete immutable audit trail at every step.

### Key Modules / Features

| # | Module | Purpose |
|---|---|---|
| M1 | **Authentication & RBAC** | Secure JWT-based login; 7 role system controlling all access paths |
| M2 | **User & Org Management** | Employee profiles, department/designation, manager hierarchy sync |
| M3 | **Travel Request** | Pre-trip request (origin, destination, dates, purpose, estimated cost, advance) |
| M4 | **Approval Workflow Engine** | Multi-step configurable approvals with SLA tracking and escalation |
| M5 | **Expense Claims & Line Items** | Itemized post-trip expenses linked to approved travel requests |
| M6 | **Policy Compliance Engine** | Real-time auto-validation of amount limits, daily caps, receipt thresholds, duplicate detection |
| M7 | **Document / Receipt Attachment** | Secure file uploads (PDF, JPG, PNG ≤ 5 MB) linked to claim line items |
| M8 | **Reimbursement Processing** | Finance-initiated bank payload generation, status tracking (QUEUED → PAID/FAILED) |
| M9 | **Notifications** | Status-change alerts dispatched to relevant stakeholders |
| M10 | **Audit Logs** | Immutable timestamped record of all user actions and system events |
| M11 | **Reports & Dashboard** | Role-specific dashboards; exportable travel spend analytics |

---

## 3. User Flow

### 3.1 Pre-Trip: Travel Request Journey

```
Employee                      System                        Manager
   |                             |                              |
   |-- Create Travel Request --> |                              |
   |   (purpose, origin, dest,   |                              |
   |    dates, estimated cost,   |-- Validate advance notice  --|
   |    advance required)        |   (≥ 3 days before departure)|
   |<-- Draft TR-XXXXXX ---------|                              |
   |                             |                              |
   |-- PATCH /submit ----------->|                              |
   |<-- status: SUBMITTED -------|                              |
   |                             |-- Notify Manager ----------->|
   |                             |                              |
   |                             |<-- PATCH /approve or reject--|
   |<-- Notification: APPROVED --|                              |
```

### 3.2 Post-Trip: Expense Claim & Reimbursement Journey

```
Employee              Policy Engine          Finance Executive         Bank
   |                       |                       |                    |
   |-- Create Claim ------> |                       |                    |
   |-- Add Line Items ----> |                       |                    |
   |   (category, amount,   |-- Real-time flag ---- |                    |
   |    date, receipt_id)   |   policy violations   |                    |
   |-- Upload Receipts ---> |                       |                    |
   |-- PATCH /submit -----> |                       |                    |
   |                        |                       |<-- Review Claim ---|
   |                        |                       |-- PATCH /approve ->|
   |                        |                       |-- POST /initiate ->|-- Bank API -->|
   |<-- Notification: PAID -|                       |                    |<-- Reference--|
```

### 3.3 Happy Path
1. Employee submits Travel Request 7+ days before departure.
2. Manager approves within SLA (8 hours).
3. Employee travels; returns and creates Expense Claim under approved TR.
4. Employee adds itemized line items with receipt uploads; all within policy limits.
5. Employee submits claim.
6. Finance Executive reviews, verifies receipts, approves claim.
7. Finance initiates reimbursement.
8. Bank processes; status transitions to `PAID` / `REIMBURSED`.
9. Employee receives notification with payment reference.

### 3.4 Failure Paths

| Scenario | System Behavior |
|---|---|
| Travel requested < 3 days before departure | Policy Engine flags; submission blocked or comment-justified by manager |
| Expense amount exceeds category limit | Line item flagged `is_policy_flagged = TRUE` with reason; Finance must review before approving |
| Receipt missing for expense > ₹500 | Line item blocked as policy violation; claim cannot submit without correction |
| Duplicate claim detected (same employee, date, amount, category) | System rejects submission with conflict warning to employee and notifies Auditor |
| Manager does not act within 8 hours | Approval step auto-escalated to manager's manager |
| Bank payment API fails | Reimbursement marked `FAILED`; Finance notified; retry available |

---

## 4. API Design

### Authentication
| Method | Endpoint | Request Body | Response | Roles |
|---|---|---|---|---|
| `POST` | `/auth/login` | `{ email, password }` | `{ access_token, user: {id, roles} }` | Public |
| `GET` | `/auth/profile` | — | `{ id, employee_id, name, roles, department }` | All authenticated |

### Travel Requests
| Method | Endpoint | Request Body | Response | Roles |
|---|---|---|---|---|
| `POST` | `/travel-requests` | `{ purpose, origin, destination, departure_date, return_date, estimated_cost, advance_required, advance_amount, notes }` | `{ id, request_number: "TR-XXXXXX", status: "DRAFT" }` | EMPLOYEE |
| `GET` | `/travel-requests/my` | Query: `?page&status` | Paginated list of own requests | EMPLOYEE |
| `GET` | `/travel-requests/pending-approvals` | — | List of requests pending manager action | MANAGER |
| `GET` | `/travel-requests` | Query filters | All requests (paginated) | SYSTEM_ADMIN, FINANCE_EXECUTIVE, HR_ADMIN |
| `GET` | `/travel-requests/:id` | — | Full travel request detail | Owner + Approver roles |
| `PATCH` | `/travel-requests/:id/submit` | — | `{ status: "SUBMITTED" }` | EMPLOYEE (owner only) |
| `PATCH` | `/travel-requests/:id/approve` | `{ comments }` | `{ status: "APPROVED" }` | MANAGER, SYSTEM_ADMIN |
| `PATCH` | `/travel-requests/:id/reject` | `{ reason }` | `{ status: "REJECTED" }` | MANAGER, SYSTEM_ADMIN |
| `PATCH` | `/travel-requests/:id/cancel` | `{ reason }` | `{ status: "CANCELLED" }` | EMPLOYEE (owner only) |

### Expense Claims
| Method | Endpoint | Request Body | Response | Roles |
|---|---|---|---|---|
| `POST` | `/expense-claims` | `{ travel_request_id }` | `{ id, claim_number: "EXP-XXXXXX", status: "DRAFT" }` | EMPLOYEE |
| `GET` | `/expense-claims/my` | Query: `?page&status` | Own claims list | EMPLOYEE |
| `GET` | `/expense-claims` | Query filters | All claims | FINANCE_EXECUTIVE, SYSTEM_ADMIN, AUDITOR |
| `GET` | `/expense-claims/:id` | — | Full claim with line items | Owner + Finance roles |
| `POST` | `/expense-claims/:id/line-items` | `{ category, description, amount, expense_date, receipt_id }` | `{ id, is_policy_flagged, flag_reason }` | EMPLOYEE (owner) |
| `PATCH` | `/expense-claims/:id/submit` | — | `{ status: "SUBMITTED" }` | EMPLOYEE (owner) |
| `PATCH` | `/expense-claims/:id/approve` | `{ notes, approved_amount }` | `{ status: "APPROVED" }` | FINANCE_EXECUTIVE, SYSTEM_ADMIN |
| `PATCH` | `/expense-claims/:id/reject` | `{ reason }` | `{ status: "REJECTED" }` | FINANCE_EXECUTIVE, SYSTEM_ADMIN |

### Documents
| Method | Endpoint | Request | Response | Roles |
|---|---|---|---|---|
| `POST` | `/documents/upload` | `multipart/form-data` (file, expenseClaimId, lineItemId) | `{ id, filename, url }` | EMPLOYEE |
| `GET` | `/documents/claim/:claimId` | — | List of docs for claim | Owner + Finance + Auditor |

### Reimbursements
| Method | Endpoint | Request Body | Response | Roles |
|---|---|---|---|---|
| `POST` | `/reimbursements/initiate` | `{ expenseClaimId }` | `{ id, reimbursement_number: "RMB-XXXXXX", status: "QUEUED" }` | FINANCE_EXECUTIVE, SYSTEM_ADMIN |
| `GET` | `/reimbursements` | Query filters | All reimbursements | FINANCE_EXECUTIVE, SYSTEM_ADMIN, AUDITOR |
| `GET` | `/reimbursements/:id` | — | Single reimbursement detail | Finance + Auditor roles |

### Policy Rules
| Method | Endpoint | Request Body | Response | Roles |
|---|---|---|---|---|
| `GET` | `/policy-rules` | — | All policy rules (active + inactive) | All authenticated |
| `POST` | `/policy-rules` | `{ name, rule_type, category, limit_amount, scope }` | Created rule object | COMPLIANCE_OFFICER, SYSTEM_ADMIN |
| `PUT` | `/policy-rules/:id` | Full rule update body | Updated rule | COMPLIANCE_OFFICER, SYSTEM_ADMIN |
| `PATCH` | `/policy-rules/:id/toggle` | `{ isActive: boolean }` | `{ id, is_active }` | COMPLIANCE_OFFICER, SYSTEM_ADMIN |

### Authentication & Error Handling
- **Scheme:** JWT Bearer Token — `Authorization: Bearer <token>`
- **Token Expiry:** Configurable (default: 24 hours)
- **Standard Error Envelope:**
```json
{
  "statusCode": 400,
  "message": "departure_date must be at least 3 business days from today",
  "error": "Bad Request",
  "timestamp": "2026-06-10T04:00:00.000Z",
  "path": "/travel-requests"
}
```
- **HTTP Status Codes used:**
  - `200` OK, `201` Created, `400` Bad Request, `401` Unauthorized, `403` Forbidden, `404` Not Found, `409` Conflict (duplicate), `413` Payload Too Large, `422` Unprocessable Entity, `500` Internal Server Error

---

## 5. Edge Cases

### Invalid Inputs
| Input Scenario | Expected Behavior |
|---|---|
| `departure_date` after `return_date` | `400 Bad Request` — "Return date must be after departure date" |
| Negative `amount` or `estimated_cost` | `400 Bad Request` — "Amount must be a positive number" |
| Expense `expense_date` outside trip date range | `422 Unprocessable Entity` — "Expense date must fall within trip dates" |
| Overlapping active trips for same employee | Warning flag raised; Finance / HR notified |
| `advance_amount` exceeds `estimated_cost` | `400 Bad Request` — "Advance cannot exceed estimated cost" |
| Invalid UUID for `travel_request_id` | `400 Bad Request` — "Invalid travel request reference" |

### Failure Scenarios
| Scenario | System Behavior |
|---|---|
| Submitting claim with flagged policy violations | Block submission; return list of violations to employee |
| Duplicate claim (same employee, category, amount, date) | `409 Conflict` — submission blocked; Auditor notified |
| Receipt missing for expense > ₹500 | `422` — "Receipt required for line item exceeding ₹500 threshold" |
| Finance approves claim with no bank account on file | `422` — reimbursement initiation blocked; prompt HR to update bank info |
| Bank API timeout during reimbursement | Reimbursement marked `FAILED`; `failure_reason` captured; `retry_count` incremented |
| File upload with disallowed extension | `400 Bad Request` — "Only PDF, JPG, JPEG, PNG files are accepted" |

### Security & Operational Exceptions
| Exception | Prevention / Handling |
|---|---|
| Self-approval of own travel request | `approver_id != employee_id` enforced at service layer; returns `403 Forbidden` |
| Manager approving outside their reporting hierarchy | Org hierarchy check at approval routing; unauthorized attempt returns `403` |
| Employee modifying another employee's draft | Ownership check at service layer; `403 Forbidden` on mismatch |
| Orphaned manager (no manager assigned) | Requests escalate to `HR_ADMIN` as fallback approver; prevents workflow deadlock |
| Concurrent approval race condition | Database-level unique constraint on `(workflow_id, step_number)` + optimistic locking |
| Large-scale data export by Auditor | Rate-limited; paginated responses only; no bulk CSV export without explicit admin grant |

---

## 6. KPIs (Success Metrics / Acceptance Criteria)

### Business KPIs
| Metric | Target |
|---|---|
| Travel request approval turnaround time | < 24 hours average |
| Expense reimbursement cycle duration | < 3 business days from claim approval to payment |
| Reduction in manual Finance/HR processing time | ≥ 60% reduction versus current baseline |
| Policy compliance enforcement rate | 100% of claims auto-validated before Finance review |

### Product KPIs
| Metric | Target |
|---|---|
| Employee adoption rate | ≥ 95% of active traveling employees using TEMS within 60 days |
| Reduction in email/phone queries to Finance & HR | ≥ 60% reduction |
| User error rate on claim submission | < 5% of submissions require correction and resubmission |
| Duplicate / fraudulent claim detection rate | 100% of same-employee same-day duplicate attempts caught |

### Technical KPIs
| Metric | Target |
|---|---|
| API response time (p95) | < 300 ms for all CRUD operations |
| File upload success rate (valid files ≤ 5 MB) | ≥ 99.9% |
| System uptime / availability | ≥ 99.9% (excluding planned maintenance) |
| Audit log write latency | < 500 ms per action logged |

### Feature Acceptance Criteria
| Feature | Acceptance Criteria |
|---|---|
| Travel Request | Employee can create, save as draft, and submit; system generates unique TR-XXXXXX code; advance notice < 3 days is flagged |
| Approval Workflow | Manager receives notification on submission; can approve/reject with comments; SLA timer escalates at 8 hours |
| Expense Claims | One claim per travel request enforced; line item total aggregates correctly; policy flags appear inline per line item |
| Receipt Upload | Only PDF/JPG/JPEG/PNG ≤ 5 MB accepted; receipt linked to line item; Finance can view all receipts for a claim |
| Policy Engine | All 10 default policy rules enforced; Compliance Officer can toggle rules on/off without code deployment |
| Reimbursement | Finance initiates payment; bank payload generated with account + IFSC + amount; status transitions QUEUED → PROCESSING → PAID/FAILED |
| Audit Trail | Every status change, login, and policy override logged with user ID, timestamp, IP address, and before/after state |

---

## 7. Limitations

### Out-of-Scope Items
- Direct flight, hotel, or ground transport booking integration (employees book externally and claim reimbursement)
- OCR / AI-based automatic extraction of data from uploaded invoice images
- Multi-currency support (system operates exclusively in Indian Rupee — INR)
- Native mobile applications for iOS or Android (responsive web only)
- Payroll system integration (reimbursement is standalone; no payroll deduction/credit module)
- SSO / SAML / Active Directory integration (local authentication only in v1.0)

### Technical Constraints
- File attachments limited to: `.pdf`, `.jpg`, `.jpeg`, `.png` — maximum 5 MB per file
- Single expense claim per approved travel request (database-enforced unique constraint)
- Approval routing is hierarchy-driven; parallel (multi-approver same step) workflows are not supported in v1.0
- Banking integration uses payload schema only — actual NEFT/IMPS API integration is client-configured post-deployment

### Known Risks & Dependencies
| Risk | Mitigation |
|---|---|
| Banking API unavailability | FAILED status + manual retry mechanism + Finance notification |
| Org hierarchy data staleness | HR Admin tools for real-time hierarchy update; routing failures surface as escalations |
| Large concurrent user load at month-end (claim cycle) | PostgreSQL connection pooling; horizontal scaling via Docker |
| Employee resistance to adoption | Role-specific training material; dedicated help center; guided onboarding flow |

---

## Validation Rule
A PRD is considered **INCOMPLETE** if any of the above 7 sections are missing.
