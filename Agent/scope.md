Enterprise Employee Travel & Expense Management System
isko tabular format mai Prathmesh kr raha hai

---

## 1. Goal & Problem Statement

* **The Problem:** 10,000+ employees manage travel requests, approvals, expense claims, and reimbursements through disconnected emails, Excel sheets, and paper documents — creating processing delays, zero real-time compliance enforcement, and an unauditable financial trail.
* **The Solution:** A centralized, web-based Travel & Expense Management System (TEMS) that automates the full lifecycle from travel request and multi-level approval, through policy-validated expense claims with receipt attachments, to banking-integrated reimbursement with a complete audit trail.

---

## 2. Tech Stack

* **Frontend:** React 18, TypeScript, Vite, Tailwind CSS (responsive, dark-mode UI)
* **Backend & API:** Node.js, NestJS Framework, REST API, Swagger / OpenAPI documentation
* **Database & Caching:** PostgreSQL 15 (primary data store, UUID keys, JSONB banking payloads)
* **Auth/Infra:** JWT (JSON Web Token), Bcrypt password hashing, Docker, Docker Compose, Multer (file upload)

---

## 3. Core Features & Acceptance Criteria

| Feature Number | Feature Name | Description | Acceptance Criteria |
| --- | --- | --- | --- |
| F-01 | Authentication & RBAC | JWT-based login with 7-role access control system: SYSTEM_ADMIN, EMPLOYEE, MANAGER, FINANCE_EXECUTIVE, HR_ADMIN, COMPLIANCE_OFFICER, AUDITOR | Login returns signed JWT; each endpoint enforces role guard; unauthorized access returns 403 Forbidden; token expiry enforced |
| F-02 | User & Org Profile Management | Employee profiles with department, designation, location, and direct manager linkage forming the org hierarchy used for approval routing | HR_ADMIN can create/update profiles; manager_id chain determines approval path; orphaned employees escalate to HR_ADMIN |
| F-03 | Travel Request Submission | Employee submits pre-trip request with purpose, origin, destination, departure/return dates, estimated cost, and optional advance request | Unique TR-XXXXXX code generated; DRAFT → SUBMITTED state transition; advance notice < 3 days raises policy flag; employee receives submission notification |
| F-04 | Multi-Level Approval Workflow | Configurable multi-step approval routing (Manager → Finance as required) with SLA tracking per step | Manager receives notification on TR submission; approves or rejects with comments; steps pending > 8 hours auto-escalate; self-approval blocked (403) |
| F-05 | Expense Claim & Line Items | Itemized post-trip expense logging linked to an approved travel request; one claim per trip | EXP-XXXXXX code generated; each line item captures category, amount, date, receipt reference; total_amount = SUM of line items; claim blocks submission if unflagged violations exist |
| F-06 | Policy Compliance Engine | Real-time automated validation of every expense line item against active policy rules on add/submit | Amount limits per category (e.g. Hotel ≤ ₹5,000/night), daily caps (e.g. Meals ≤ ₹500/day), receipt required for amounts > ₹500, duplicate detection — all enforced with is_policy_flagged + flag_reason |
| F-07 | Document & Receipt Upload | Secure multi-format file upload service linked directly to expense line items as proof of expenditure | Accepts PDF, JPG, JPEG, PNG only; max 5 MB per file; file stored with UUID name; document linked to claim + line item; Finance can view all receipts per claim |
| F-08 | Finance Audit & Claim Approval | Finance Executive reviews expense claims, attached receipts, and policy flags; adjusts approved amounts; approves or rejects | Finance can view all SUBMITTED claims; can set approved_amount ≠ claimed amount with notes; approval transitions claim to APPROVED; rejection returns to employee with reason |
| F-09 | Reimbursement Processing | Finance-initiated payment queue that generates structured banking payloads and tracks full payment lifecycle | RMB-XXXXXX code generated on initiation; status transitions: QUEUED → PAYMENT_INITIATED → PROCESSING → PAID / FAILED; FAILED triggers Finance notification and allows retry; PAID marks claim as REIMBURSED |
| F-10 | Notifications | System-generated, role-targeted alerts for all major lifecycle events | Notifications created within 500 ms of triggering event; employees notified on approval/rejection; managers on pending requests; Finance on claims ready for review |
| F-11 | Audit Trail | Immutable, timestamped log of all user actions, status changes, policy overrides, and login events | Every state transition writes to audit_logs with user_id, action, entity_type, entity_id, IP address, old_value, new_value, and timestamp; Auditor has read-only access |
| F-12 | Dashboard & Reports | Role-specific home dashboards and filterable analytics on travel spend, claim status, and reimbursement timelines | Employee sees own summary; Manager sees team overview; Finance sees pending/approved/paid totals; Admin sees system-wide spend by department/purpose/date range |

---

## 4. UI/UX Standards

* **Theme & Style:** Dark Mode primary with Light Mode toggle; Glassmorphism card panels with subtle backdrop blur; curated HSL color palette (teal-indigo primary, amber accent, semantic red/green for status); Inter / Outfit Google Fonts; smooth gradient backgrounds.
* **Layout:** Mobile-first fully responsive grid; sticky sidebar navigation with role-adaptive menu items; animated status badge transitions; micro-animations on form submission, approval actions, and file upload progress; color-coded status chips (Green = APPROVED/PAID, Amber = PENDING/DRAFT, Red = REJECTED/FAILED, Blue = UNDER_REVIEW).

---

## 5. Out of Scope

* Direct flight, hotel, or ground transport booking integration — employees book externally and claim reimbursement via TEMS.
* OCR / AI-based automatic reading and extraction of data from scanned invoice images.
* Multi-currency support or foreign exchange rate conversion — system operates in INR only.
* Native iOS or Android mobile application — responsive web application only.
* Payroll system integration — reimbursements are standalone bank transfers, not payroll credit adjustments.
* SSO, SAML, or Active Directory / LDAP authentication integration — local email/password auth in v1.0.
* Parallel (multi-approver same-step) approval workflows — sequential single-approver per step only.
* Automated tax deduction, TDS calculations, or GST input credit claims on expenses.
