# Project Boundary — Enterprise Employee Travel & Expense Management System (TEMS)

> **Version:** 1.0 | **Date:** 2026-06-10
> **Source Documents:** `prd.md` (v1.0) · `kpi.md` (v1.0)
> **Audience:** Engineering, QA, Product, DevOps

---

## 1. Code & Execution Constraints

* **No Auto-Commit:** DO NOT commit, push, or modify repository code directly without explicit user approval.
* **No Unauthorized Commands:** DO NOT execute any terminal commands, scripts, DB migrations, seed scripts, or Docker operations without explicit user confirmation first.
* **No Direct DB Mutations:** DO NOT write raw SQL against `audit_logs`, `policy_rules`, or `reimbursements` tables outside of the defined service layer. These tables carry regulatory and financial implications.
* **No Banking API Calls Without Finance Trigger:** The `POST /reimbursements/initiate` endpoint and its underlying banking payload dispatch must only execute when explicitly triggered by a `FINANCE_EXECUTIVE` or `SYSTEM_ADMIN` role. Automated or background-triggered reimbursements are out of scope.
* **No File System Access Outside `/uploads`:** Document storage is strictly contained to the `./uploads` directory. No symlinks, path traversal, or external storage writes are permitted.

---

## 2. Guardrails & Token Optimization

* **No Guessing / Assumptions:** DO NOT write code, queries, or logic based on incomplete requirements. If architecture, data structures, role permissions, or policy rules are ambiguous — STOP and ask clarifying questions.
* **Clarification First:** All 7 system roles (`SYSTEM_ADMIN`, `EMPLOYEE`, `MANAGER`, `FINANCE_EXECUTIVE`, `HR_ADMIN`, `COMPLIANCE_OFFICER`, `AUDITOR`) have distinct, non-overlapping access boundaries. Any new endpoint must have its role guard explicitly declared before implementation begins.
* **No Scope Creep:** The following are confirmed **out of scope** for v1.0 — do NOT implement, prototype, or stub:

  | Out of Scope Item | Source Reference |
  |---|---|
  | Flight / hotel / cab booking integration | PRD §7 Limitations |
  | OCR / AI invoice reading | PRD §7 Limitations |
  | Multi-currency / FX conversion | PRD §7 Limitations |
  | Native iOS / Android apps | PRD §7 Limitations |
  | Payroll system integration | PRD §7 Limitations |
  | SSO / SAML / LDAP / Active Directory | PRD §7 Limitations |
  | Parallel multi-approver same-step workflows | PRD §7 Limitations |
  | Automated tax / TDS / GST calculations | PRD §7 Limitations |
  | Bulk CSV export without admin authorization | PRD §5 Security Exceptions |

* **No Generic Output:** Every KPI, API response, error message, and validation must be specific and traceable to a module. Generic catch-all responses are not acceptable.

---

## 3. Code Quality Standards

* **Modular:** Write single-responsibility, highly decoupled modules. Each of the 12 identified system modules (M1–M12) must remain independently buildable and testable:

  | Module | Boundary |
  |---|---|
  | M1 — Auth & RBAC | `src/modules/auth` — JWT issuance, guards, strategies only |
  | M2 — User & Org | `src/modules/users` — profile CRUD, hierarchy management only |
  | M3 — Travel Request | `src/modules/travel-request` — TR lifecycle state machine only |
  | M4 — Approval Workflow | `src/modules/approvals` — step orchestration, SLA tracking, escalation only |
  | M5 — Expense Claims | `src/modules/expense-claims` — claim + line item management only |
  | M6 — Policy Engine | `src/modules/policy-engine` — rule evaluation, flagging only |
  | M7 — Documents | `src/modules/documents` — Multer upload, file metadata only |
  | M8 — Reimbursement | `src/modules/reimbursement` — payment lifecycle, bank payload only |
  | M9 — Notifications | `src/modules/notifications` — dispatch only; no business logic |
  | M10 — Audit Logs | `src/modules/audit-logs` — write-only; no update/delete operations |
  | M11 — Reports | `src/modules/reports` — read-only aggregations, no mutations |
  | M12 — Dashboard | `src/modules/dashboard` — role-scoped summary views only |

* **Maintainable:** Prioritize clean, self-documenting code with predictable data flows. No business logic inside controllers — all logic must reside in service classes.

---

## 4. Role & Permission Boundaries

All access enforcement is derived from `prd.md §4 API Design` and `kpi.md KPI-AUTH-03`:

| Role | Permitted Actions | Prohibited Actions |
|---|---|---|
| `EMPLOYEE` | Create/view own TR and claims; upload receipts; cancel own TR | View others' data; approve/reject; initiate reimbursement; modify policy rules |
| `MANAGER` | View team pending approvals; approve/reject TRs within hierarchy | Approve own TR (403); action steps outside their hierarchy (403); access Finance endpoints |
| `FINANCE_EXECUTIVE` | View all claims; approve/reject claims; initiate reimbursements; view all reimbursements | Approve travel requests; modify org hierarchy; create/toggle policy rules |
| `HR_ADMIN` | Manage employee profiles and org hierarchy; view all TRs | Approve claims; initiate payments; create policy rules |
| `COMPLIANCE_OFFICER` | Create/update/toggle policy rules | Approve TRs or claims; view reimbursement banking payloads |
| `AUDITOR` | Read-only access to audit logs, claims, reimbursements, and reports | ANY write operation (POST/PATCH/PUT/DELETE returns 403) |
| `SYSTEM_ADMIN` | Full system access | Must still respect self-approval block (KPI-APP-03) |

---

## 5. Data & Validation Boundaries

Derived from `prd.md §5 Edge Cases` and `kpi.md` module KPIs:

| Rule | Enforcement Point | KPI Reference |
|---|---|---|
| `departure_date` must be before `return_date` | Service layer on TR create/update | KPI-TR-04 |
| `advance_amount` ≤ `estimated_cost` | Service layer on TR create/update | KPI-TR-05 |
| `expense_date` must fall within trip `[departure_date, return_date]` | Line item service on add | KPI-EXP-04 |
| One expense claim per approved travel request | DB unique constraint + service guard | KPI-EXP-01 |
| Claims can only be created against APPROVED travel requests | Service layer status check | KPI-EXP-07 |
| Line item `amount` must be > 0 | Input validation (DTO) | KPI-EXP-05 |
| Expense > ₹500 without `receipt_id` → policy flag | Policy Engine service | KPI-POL-04 |
| Duplicate same-employee/category/amount/date claim → 409 | Policy Engine duplicate check | KPI-POL-05 |
| File upload: only `.pdf`, `.jpg`, `.jpeg`, `.png` ≤ 5 MB | Multer filter + size guard | KPI-DOC-01, KPI-DOC-02 |
| Reimbursement only for `APPROVED` expense claims | Service pre-condition check | KPI-RMB-02 |
| Reimbursement blocked if bank details (account/IFSC) are NULL | Service pre-condition check | KPI-RMB-07 |
| `approver_id` ≠ `employee_id` (self-approval block) | Approval workflow service | KPI-APP-03 |
| Org hierarchy loop: A → B → A not permitted | User service on manager_id update | KPI-USR-02 |

---

## 6. Audit & Compliance Boundaries

Derived from `kpi.md Module M11` and `prd.md §5 Security Exceptions`:

* **Audit logs are write-only.** No UPDATE or DELETE endpoint for `audit_logs` shall exist. No service method may mutate an existing audit record. (KPI-AUD-05)
* **Every status transition must write an audit log** capturing: `entity_type`, `entity_id`, `old_status`, `new_status`, `actor_id`, `ip_address`, `timestamp`. (KPI-AUD-01)
* **Policy overrides must be explicitly logged.** When Finance approves a claim with flagged line items, the override action, `user_id`, `claim_id`, and all overridden `flag_reason` values must be captured. (KPI-AUD-02)
* **Policy rule changes must be logged.** Any creation, modification, or toggle of a `policy_rules` record writes an audit entry with `old_value` and `new_value`. (KPI-AUD-03)
* **All login events must be captured** — both successful and failed — with `user_email`, `IP`, `user_agent`, and outcome. (KPI-AUD-06 / KPI-AUTH-05)

---

## 7. Performance & Reliability Boundaries

Derived from `prd.md §6 Technical KPIs` and `kpi.md Success Criteria`:

| Boundary | Threshold | Enforcement |
|---|---|---|
| API response time (p95) | < 300 ms for all CRUD operations | Load testing in Sprint 7 |
| File upload success rate | ≥ 99.9% for valid files ≤ 5 MB | Integration test coverage |
| System uptime | ≥ 99.9% (excluding planned maintenance) | Docker health checks + restart policies |
| Audit log write latency | < 500 ms per action | Async write with non-blocking service |
| Notification dispatch latency | < 500 ms from triggering event | Async notification service |
| Payment failure notification | < 60 seconds from FAILED status | Background job monitor on reimbursement state |
| SLA escalation trigger | ≤ 8 hours from step creation | Scheduled SLA checker service |

---

## 8. Sprint Delivery Boundaries

Derived from `kpi.md §STEP 2 Implementation Roadmap`:

| Sprint | In-Boundary Deliverables | Out-of-Boundary (Do Not Build Yet) |
|---|---|---|
| Sprint 1 | DB schema, auth, RBAC, user profiles, Swagger | Any travel/claim/payment logic |
| Sprint 2 | Travel request lifecycle, manager approval queue, SLA timer | Expense claims, policy engine, documents |
| Sprint 3 | Expense claims, line items, document uploads, Finance review | Reimbursement payments, notifications at scale |
| Sprint 4 | Policy engine rules, flagging logic, Compliance Officer API | Banking integration, reports |
| Sprint 5 | Reimbursement lifecycle, bank payloads, failure/retry | Frontend build, UAT |
| Sprint 6 | Notifications, audit middleware, reports, dashboard APIs | Frontend integration |
| Sprint 7 | React frontend, UI design system, UAT, performance testing | New features or post-v1.0 scope items |
