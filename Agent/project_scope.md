# 📋 Project Scope Document
## Enterprise Employee Travel & Expense Management System (ETEMS)
**Version**: 2.6.26  
**Prepared For**: Agent Development Reference  
**Source Documents**: PRD_ETEMS.md · kpi.md  
**Date**: 2026-06-03  

---

## 1. Project Overview

The Enterprise Employee Travel & Expense Management System (ETEMS) is a centralized, cloud-ready **web and mobile platform** that digitizes and automates the complete travel and expense lifecycle for a **10,000+ employee organization** across multiple locations.

It replaces fragmented manual processes (emails, Excel sheets, paper documents, phone calls) with a unified digital platform covering:
- Travel requests & multi-level approvals
- Expense claims, receipt OCR & reimbursements
- Policy enforcement & compliance
- Vendor coordination & booking management
- Real-time financial reporting & budget tracking
- Full HRMS, ERP/Payroll, and SSO integrations

---

## 2. KPI Points with Constraints

Each KPI defines a measurable outcome. Below are all 16 KPIs with their **pass criteria** and **binding constraints** that the system must satisfy.

---

### KPI 1 — User Management & Access Control

| KPI Point | Pass Criteria | Constraint |
|-----------|---------------|------------|
| Employee Registration | Onboarded via SSO or manual registration with role assignment | SSO must use SAML 2.0 / OAuth 2.0; fallback only for service accounts |
| Role-Based Access Control | Distinct access for Employee, Manager, Finance, HR, Admin, Auditor | RBAC enforced at **both UI and API layers**; no role escalation permitted |
| User Login | Secure login via corporate SSO or email/password | JWT RS256 signing; access token expires in **15 minutes**; refresh token rotation required |
| Profile Management | Update personal details, cost center, department, travel preferences | Bank account edits must trigger re-validation against HRMS |
| Delegation | Delegate approval authority to a colleague during absence | Delegate inherits all notifications and action rights for the defined period only |
| Session Management | Auto-timeout and concurrent session control | BCrypt password hashing; lockout after configurable failed attempts |
| Password Reset | OTP-based email recovery or SSO-managed reset | SSO resets handled entirely by corporate IdP — system must not bypass |

**Constraints Summary**: HRMS sync for org hierarchy, grade, department, and manager mapping must auto-propagate within **24 hours** of any change.

---

### KPI 2 — Travel Request Management

| KPI Point | Pass Criteria | Constraint |
|-----------|---------------|------------|
| Submit Travel Request | Purpose, destination, dates, mode, and estimated budget fields | Grade-based entitlements applied **automatically** at creation; no manual override |
| Advance Request | Cash advance linked to travel request | Advance routed through approval with parent request simultaneously |
| Multi-City Itinerary | Multiple legs with per-leg origin, destination, departure/arrival, mode | Must be within a single request submission |
| Request Drafts | Save incomplete requests and submit later | Pending requests editable only **before** the first approver acts |
| Attachment Support | Upload PDF, JPG, PNG supporting documents | Max file size and virus scanning enforced on upload |
| Request Editing | Modify pending requests before approval is initiated | Edit locked once any approver has acted |
| Request Cancellation | Cancel with mandatory reason and manager notification | Advance reversal triggered automatically on cancellation if advance was issued |

**Constraints Summary**: Blackout period enforcement — system **rejects or warns** requests with travel dates falling in HR-configured blackout ranges. Status tracking mandatory at every stage: Draft → Submitted → Under Approval → Approved → Travel Desk Processing → Completed.

---

### KPI 3 — Approval Workflow Engine

| KPI Point | Pass Criteria | Constraint |
|-----------|---------------|------------|
| Multi-Level Approval | Configurable chains (Line Manager → Dept Head → Finance) | Chain defined by request type, employee grade, destination, and estimated amount |
| Parallel Approvals | Route to multiple approvers simultaneously | All parallel approvers must act before the request can proceed |
| Approval Notifications | Email and in-app alerts for pending actions | Reminders sent at **50%, 75%, and 100%** of SLA window |
| Approve / Reject / Return | Approve, reject, or return-for-clarification with comments | **Mandatory comments** required for all three actions |
| Escalation Rules | Auto-escalate at SLA breach | Escalation notification sent to next level at 100% SLA elapsed |
| Bulk Approval | Finance/HR managers approve multiple requests in one action | Available only to Finance Analyst and HR Admin roles |
| Audit Trail | Every action logged with timestamp, actor, and remarks | Audit log is **immutable and exportable**; no deletion permitted |

**Constraints Summary**: HR Admin configures approval chains, SLA windows, and escalation rules via no-code admin UI — zero developer involvement required for workflow changes. Exception/out-of-policy requests must be routed to a separate exception approver **before** the standard chain.

---

### KPI 4 — Expense Claim Management

| KPI Point | Pass Criteria | Constraint |
|-----------|---------------|------------|
| Submit Expense Claim | Itemized claims linked to a completed travel request | Non-travel claims (local business meals) also supported |
| Expense Categories | Airfare, Hotel, Meals, Local Transport, Communication, Visa, Miscellaneous | Category list is system-configured; no ad-hoc categories |
| Receipt Upload | JPG, PNG, PDF per expense line | Stored in AWS S3 / Azure Blob with AES-256 encryption; signed time-limited URLs only |
| Receipt OCR | Auto-extract vendor name, amount, currency, date, GST/tax | Low-confidence extractions **flagged for manual review** with confidence score displayed |
| Currency Conversion | Auto-convert foreign currency using daily rates | Rate and conversion timestamp recorded on **each line item** |
| Per Diem Calculation | Auto-calculate per diem by destination tier, grade, travel duration | Calculated per active policy configuration; not editable by employee |
| Duplicate Detection | Flag same vendor + amount + date found in prior claim | Lookback window is configurable by HR Admin |
| Claim Amendment | Amend rejected lines and resubmit | Mandatory amendment reason required on resubmission |

**Constraints Summary**: Running claim total must update in **real time** as line items are added or edited before submission. OCR engine: AWS Textract.

---

### KPI 5 — Policy & Compliance Engine

| KPI Point | Pass Criteria | Constraint |
|-----------|---------------|------------|
| Travel Policy Configuration | Spending limits by category, grade, and destination | Configured via no-code policy editor by HR Admin only |
| Policy Violation Alerts | Flag out-of-policy expenses at submission with reason codes | Inline violation display with the specific policy rule cited |
| Exception Approval | Out-of-policy claims routed for exception approval with justification | Exception rate tracked in reporting dashboard |
| Blackout Period Enforcement | Restrict non-essential travel in configured date ranges | Automatic flagging; cannot be submitted without HR override |
| Preferred Vendor Enforcement | Warn when bookings are outside preferred vendor list | Override allowed **only with mandatory justification** |
| Grade-Based Entitlements | Entitlements applied automatically (flight class, hotel tier) by grade | Grades 1–4: Economy + 3-star; Grade 5+: Business + 5-star (configurable) |
| Policy Version Control | Maintain policy history with effective dates | Historical claims evaluated against the **policy version active at time of submission** |

---

### KPI 6 — Reimbursement & Finance Processing

| KPI Point | Pass Criteria | Constraint |
|-----------|---------------|------------|
| Finance Review Queue | Dedicated queue for approved claims pending payment | Filterable by department, amount, and submission date |
| Payroll Integration | Export approved reimbursements to SAP / Oracle / Workday | Nightly batch or real-time API; payload includes employee ID, amount, GL code, cost center, payment reference |
| Bank Transfer Support | Direct bank transfer reimbursement | Employee bank account validated against HRMS before payment release |
| Advance Settlement | Track and offset cash advances against submitted claims | Residual or shortfall auto-highlighted for Finance action |
| Partial Reimbursement | Approve partial amounts; reject non-compliant line items | Rejected lines returned to employee with reason for amendment |
| Reimbursement Status Tracking | Real-time tracking: Finance Review → Approved → ERP Exported → Payment Released | Payment date and reference number displayed on claim record |
| Tax Handling | TDS deduction and taxable benefit tagging | Per India IT Act requirements; tax metadata included in ERP export |

**Constraints Summary**: Finance can place claims on **Hold** with comments; SLA is paused during hold period. Employee notified immediately on hold status.

---

### KPI 7 — Booking & Vendor Integration

| KPI Point | Pass Criteria | Constraint |
|-----------|---------------|------------|
| Travel Desk Portal | Dedicated view for travel desk team to manage bookings | Priority queue with status management for pending approved requests |
| Flight Booking Integration | Integration with corporate travel agency or GDS (Amadeus/Sabre) | **Phase 1: Read-only** fetch of booking details and PNRs; write operations deferred to Phase 2 |
| Hotel Booking Integration | Connect with preferred hotel aggregators | Via GDS or aggregator API; Travel Desk manages all interactions |
| Car Rental Integration | Support cab/car rental booking with vendor tie-up | Via preferred vendor list; deviations logged |
| Visa & Documentation Tracking | Track visa application status and travel documents | System displays requirements; Travel Desk manages status per request |
| Booking Confirmation Sync | Auto-sync booking confirmations into employee travel request | Employee notified when booking is confirmed |
| Corporate Card Integration | Reconcile corporate credit card transactions against claims | Imported via bank feed or CSV |

**Constraints Summary**: Employees who book independently can log their booking details and upload receipts against the travel request for reconciliation. All vendor deviations from the approved list are **flagged and logged**.

---

### KPI 8 — Notifications & Communication

| KPI Point | Pass Criteria | Constraint |
|-----------|---------------|------------|
| Email Notifications | Automated templated emails for all key workflow events | Triggered for: submission, approval/rejection, payment update, advance release, SLA breach |
| In-App Notifications | Real-time notification bell with unread count | Grouped by type: Approval Needed, Status Update, Payment Released, Reminder |
| SMS/WhatsApp Alerts | Critical alerts for approvers and travelers | Configurable per-role by HR Admin; used for critical/overdue approvals only |
| Reminder Escalations | Auto-reminders at 50%, 75%, 100% of SLA | Escalation notification to next level at 100% SLA |
| Expense Submission Reminder | Remind employees to submit claims post-travel | Triggered N days after travel return date if no claim submitted; N is configurable |
| Configurable Templates | Admin customizes notification content and triggers | HR Admin manages templates, sender identities, and trigger conditions via admin UI |

---

### KPI 9 — Reporting & Analytics

| KPI Point | Pass Criteria | Constraint |
|-----------|---------------|------------|
| Expense Summary Dashboard | Real-time: total spend, claims pending, active travelers, budget utilization | Executive-level dashboard; role-aware visibility |
| Department-Wise Spend Report | Breakdown by department, cost center, project, period | Drill-down capability required |
| Employee Travel History | Complete per-employee view of trips, claims, reimbursement status, advance balances | |
| Policy Violation Report | Out-of-policy claims with reason code, exception approval status, grade | |
| Budget vs Actuals | Budget allocated vs consumed by department and fiscal period | Variance highlighted |
| Monthly / Quarterly Reports | Auto-generated and distributed to Finance and HR leadership | Scheduled email delivery |
| Audit Reports | Full audit trail filterable by user, date range, entity type, action | Immutable log |
| Export Capabilities | Export in Excel (.xlsx), PDF, CSV | Scheduled delivery to configured recipients supported |

**Constraints Summary**: Database read replicas used for all reporting queries to prevent performance impact on transactional operations.

---

### KPI 10 — Budget Management

| KPI Point | Pass Criteria | Constraint |
|-----------|---------------|------------|
| Annual Budget Setup | Finance defines budgets by department, cost center, or project per fiscal year | |
| Real-Time Budget Tracking | Live tracking of budget consumed vs. available at department level | Updates upon claim approval in real time |
| Budget Alerts | Alert department heads at 75% and 90% of budget consumed | Thresholds configurable by Finance |
| Budget Revision Workflow | Formal process for mid-year budget revision requests | Department Head requests; Finance approves/rejects via structured workflow |
| Cost Center Mapping | Expenses mapped to GL codes and cost centers at submission | Finance can reclassify before ERP export |

---

### KPI 11 — Mobile Application

| KPI Point | Pass Criteria | Constraint |
|-----------|---------------|------------|
| Mobile Travel Request | Raise and track travel requests from mobile | Same validation and entitlement rules as web |
| Mobile Expense Submission | Submit claims with camera-based receipt capture | OCR processes images in real time; offline drafts sync on reconnect |
| Mobile Approvals | Managers approve/reject directly from mobile | Push notification → action without browser required |
| Offline Support | Core features accessible offline | Sync automatically upon reconnection |
| Push Notifications | Push alerts for approvals, rejections, payments | |
| Cross-Platform Support | Native iOS (14+) and Android (10+) | Consistent UI/UX parity with web; biometric auth (Fingerprint, Face ID) supported |

---

### KPI 12 — Responsive Web Design

| KPI Point | Pass Criteria | Constraint |
|-----------|---------------|------------|
| Mobile Compatibility | Works on 320px+ width | |
| Tablet Compatibility | Works on 768px+ width | |
| Desktop Compatibility | Works on 1024px+ width | |
| Touch Interactions | Touch-friendly UI on mobile and tablet | |
| Accessibility (WCAG 2.1) | Meets WCAG 2.1 AA standards | Mandatory — not optional |
| Cross-Browser Support | Chrome, Firefox, Edge, Safari | |

---

### KPI 13 — Security & Compliance

| KPI Point | Pass Criteria | Constraint |
|-----------|---------------|------------|
| Data Encryption | AES-256 at rest; TLS 1.3 in transit | No plain-text credentials anywhere |
| GDPR / Data Privacy | Compliance with applicable data privacy regulations | |
| IP Whitelisting | Restrict access to corporate IP ranges | Configurable; not hardcoded |
| Failed Login Lockout | Account lockout after configurable failed attempts | |
| Activity Logging | All user actions logged for security audit | |
| Penetration Testing | Must pass third-party penetration testing | Pre-production requirement |
| Document Retention Policy | Receipts retained per company data retention policy | Enforced via S3 lifecycle policies |

---

### KPI 14 — Integration & Interoperability

| KPI Point | Pass Criteria | Constraint |
|-----------|---------------|------------|
| HRMS Integration | Sync employee master data (hierarchy, grade, cost center) | Scheduled API sync; changes propagate within 24 hours |
| ERP/Payroll Integration | Push reimbursements to SAP / Oracle / Workday | Nightly batch or real-time API |
| SSO Integration | SAML 2.0 / OAuth2 with corporate IdP | Stateless JWT; no server-side session storage |
| REST API | Documented REST APIs for third-party integrations | OpenAPI/Swagger documentation; versioned (v1, v2) |
| Webhook Support | Trigger external systems on key events | |
| Exchange Rate API | Auto-fetch daily forex rates | Rate and timestamp recorded per claim line |

---

### KPI 15 — Docker & Deployment

| KPI Point | Pass Criteria | Constraint |
|-----------|---------------|------------|
| Docker Container | Frontend, backend, DB in Docker containers | |
| Docker Compose | Multi-container orchestration with health checks | Separate containers: frontend, backend, PostgreSQL, Redis, Elasticsearch |
| Kubernetes Support | Deployable on Kubernetes for high-availability | Helm Charts; horizontal pod auto-scaling on CPU/memory thresholds |
| Environment Configuration | All settings via environment variables | No hardcoded credentials; managed via Vault / AWS Secrets Manager |
| Database Persistence | Data persists across container restarts | Mounted volumes; S3/Blob with cross-region replication |
| CI/CD Pipeline | Automated build, test, and deployment pipeline | GitHub Actions / Jenkins; build → test → Docker image → registry → deploy |
| Zero-Downtime Deployment | Rolling deployments with no production downtime | |

---

### KPI 16 — Testing & Documentation

| KPI Point | Pass Criteria | Constraint |
|-----------|---------------|------------|
| Unit Tests | Core business logic covered | **>80% coverage** required (JUnit + Mockito) |
| Integration Tests | API endpoints, approval workflows, DB operations tested | |
| UI / E2E Tests | Critical user journeys covered | Cypress for web E2E |
| Performance Testing | Load tested for 10,000+ concurrent users | JMeter; API P95 response time < **500ms** |
| API Documentation | REST API documented with OpenAPI / Swagger | |
| User Guide | Documentation for Employee, Manager, Finance roles | |
| Admin Guide | System configuration and administration documentation | |
| Code Comments | Meaningful inline comments in source code | |

---

## 3. Functional Requirements

### FR-01: Authentication & Identity
- System must support SAML 2.0 / OAuth 2.0 SSO login with fallback email/password for service accounts only.
- JWT tokens (RS256) with 15-minute access token expiry and refresh token rotation.
- RBAC enforced at API gateway and service layer for all 8 roles.

### FR-02: Travel Request Lifecycle
- Employees submit requests with purpose, route, dates, mode, and budget.
- Grade-based entitlements applied automatically at form load.
- Multi-city itineraries supported within a single request.
- Status machine: Draft → Submitted → Under Approval → Approved → Travel Desk Processing → Completed → Cancelled.
- Blackout period validation at submission.
- Advance request raised simultaneously with parent travel request.

### FR-03: Approval Workflow
- Multi-level sequential and parallel approval chains fully configurable via admin UI.
- SLA-based auto-escalation with reminders at 50%, 75%, 100%.
- Approver actions: Approve / Reject / Return — all require mandatory comments.
- Bulk approval for Finance and HR Admin roles.
- Immutable audit trail for every action.
- Out-of-policy requests routed to exception approver before standard chain.

### FR-04: Expense Claim Processing
- Itemized claims linked to completed travel requests; non-travel claims supported.
- OCR (AWS Textract) auto-extracts receipt data; low-confidence results flagged.
- Foreign currency auto-converted with daily API rates; rate recorded per line.
- Per diem auto-calculated from policy configuration.
- Duplicate detection on vendor + amount + date within configurable lookback window.
- Real-time running total updates as line items change.
- Rejected lines can be amended and resubmitted with amendment reason.

### FR-05: Policy & Compliance
- No-code policy editor for HR Admin: spending limits by category, grade, destination.
- Inline violation alerts with specific policy rule cited at claim submission.
- Exception routing with mandatory justification; exception rate tracked.
- Policy versioning — historical claims evaluate against the policy active at submission time.

### FR-06: Reimbursement & Finance
- Finance review queue with filters; hold workflow with SLA pause.
- Partial approval at line-item level.
- ERP/payroll export (SAP/Oracle/Workday) — nightly batch or real-time API.
- Advance settlement auto-offset against claims; shortfall/residual flagged.
- Tax handling: TDS deduction and taxable benefit tagging per India IT Act.
- Payment status visible to employee at every stage.

### FR-07: Booking & Vendor Management
- Travel Desk portal with priority queue for all approved pending requests.
- GDS integration (Amadeus/Sabre) — Phase 1 read-only PNR fetch.
- Corporate card reconciliation via bank feed or CSV import.
- Visa requirements and document checklist per international destination.
- Booking confirmations attached to employee travel records with notification.

### FR-08: Notifications
- Email, in-app, push, SMS/WhatsApp notifications for all key events.
- SLA reminders at 50%, 75%, 100% of configured window.
- Post-travel expense submission reminder N days after return (configurable).
- Admin-configurable templates, sender identities, and trigger conditions.

### FR-09: Reporting & Analytics
- Executive dashboard: spend, pending approvals, active travelers, budget utilization.
- Department spend, employee history, policy violations, budget vs actuals.
- Automated monthly/quarterly reports distributed via email.
- Export in .xlsx, PDF, CSV; scheduled delivery supported.
- Audit trail: immutable, filterable by user/date/entity/action.

### FR-10: Budget Management
- Annual budget allocation by department, cost center, project.
- Real-time consumed vs. available tracking; updates on claim approval.
- Alerts at 75% and 90% thresholds (configurable).
- Mid-year budget revision workflow.
- GL code and cost center mapping at submission; Finance reclassification before ERP export.

### FR-11: Mobile Application
- iOS (14+) and Android (10+) native apps via React Native.
- Camera receipt capture with real-time OCR.
- Offline draft creation and sync on reconnect.
- Biometric login (Fingerprint, Face ID).
- Full travel request, expense, and approval functionality on mobile.

---

## 4. Non-Functional Requirements

### NFR-01: Performance
| Metric | Target |
|--------|--------|
| API P95 response time | < 500 ms |
| Concurrent users supported | 10,000+ |
| Dashboard load time | < 2 seconds |
| OCR processing time | < 5 seconds per receipt |
| System uptime SLA | 99.9% |

### NFR-02: Security
| Requirement | Standard |
|-------------|----------|
| Data at rest | AES-256 encryption |
| Data in transit | TLS 1.3 |
| Authentication tokens | JWT RS256; 15-min access token expiry |
| Password hashing | BCrypt |
| File uploads | Virus-scanned on upload; signed time-limited URLs |
| IP access | Whitelisting for corporate IP ranges |
| Penetration testing | Mandatory pre-production sign-off |
| Activity logs | All user actions logged, immutable |

### NFR-03: Scalability
- Kubernetes with horizontal pod auto-scaling (CPU/memory-based).
- PostgreSQL read replicas for all reporting workloads.
- Redis for session caching and rate limiting.
- S3/Blob cross-region replication for document storage.

### NFR-04: Reliability & Availability
- Zero-downtime rolling deployments via Kubernetes.
- PostgreSQL data persisted via mounted volumes.
- Redis AOF logging for persistence.
- Database and application health checks in Docker Compose and Kubernetes probes.

### NFR-05: Accessibility & UX
- WCAG 2.1 AA compliance mandatory across all web interfaces.
- Responsive: 320px (mobile), 768px (tablet), 1024px+ (desktop).
- Dark and light mode; user preference persisted.
- Cross-browser: Chrome, Firefox, Edge, Safari.
- Touch-friendly controls; swipe gestures on mobile.

### NFR-06: Auditability & Compliance
- Every system action (approval, rejection, escalation, delegation, config change) logged with actor, timestamp, level, and comments.
- Audit logs immutable and exportable.
- Policy version history maintained; historical claims evaluated against correct version.
- Document retention policy enforced via storage lifecycle rules.
- GDPR / applicable data privacy compliance.

### NFR-07: Maintainability
- Flyway-managed database migrations.
- API versioning (v1, v2) for backward compatibility.
- All environment-specific settings via environment variables (no hardcoded credentials).
- Vault / AWS Secrets Manager for secrets.
- Global exception handling with structured error responses.
- Unit test coverage > 80% for core business logic.

### NFR-08: Observability
- Prometheus + Grafana for infrastructure and application metrics.
- ELK Stack (Elasticsearch, Logstash, Kibana) for centralized logging and audit search.
- Alerts configured for uptime, error rates, and SLA breaches.
- CI/CD pipeline covers: build → unit tests → integration tests → Docker image build → registry push → deploy.

---

## 5. Stopping Points (Definition of Done per Phase)

The following stopping points define when a KPI/module is considered **complete** and the agent must not proceed further without explicit instruction.

### 🔴 Hard Stops — Do Not Proceed Without Confirmation
| # | Stopping Condition |
|---|-------------------|
| S1 | SSO / SAML 2.0 integration requires corporate IdP configuration — **stop and request IdP metadata from admin** |
| S2 | ERP/payroll export (SAP/Oracle/Workday) requires API credentials and schema — **stop and request connection details** |
| S3 | GDS integration (Amadeus/Sabre) requires API keys and sandbox access — **stop; implement stub/mock until credentials provided** |
| S4 | AWS Textract OCR requires AWS account credentials — **stop; implement Tesseract fallback locally** |
| S5 | Bank transfer integration requires financial institution API access — **stop; implement mock payment flow** |
| S6 | SMS/WhatsApp (Twilio) and Push (Firebase) require third-party credentials — **stop; implement email-only notifications until credentials provided** |
| S7 | Penetration testing sign-off must be obtained before production deployment — **hard stop before go-live** |

### 🟡 Soft Stops — Proceed with Stub, Flag for Review
| # | Stopping Condition |
|---|-------------------|
| S8 | Exchange rate API down or credentials missing — use hardcoded/last-known rates with explicit warning banner |
| S9 | HRMS sync not yet configured — allow manual employee onboarding but flag as incomplete |
| S10 | Phase 2 features (AI recommendations, direct GDS booking by employees, carbon tracking, multi-language) — **do not implement; stop at Phase 1 boundary** |
| S11 | Historical data migration from Excel/paper — **explicitly out of scope; stop if requested** |
| S12 | Real-time messaging / DM between employees — **explicitly out of scope; stop if requested** |

### 🟢 Module Completion Criteria
A module is marked DONE only when:
- [ ] All KPI rows for the module pass acceptance criteria
- [ ] Unit tests written and coverage ≥ 80%
- [ ] API endpoints documented in OpenAPI/Swagger
- [ ] Role-based access verified at API and UI layers
- [ ] Audit trail entries verified for all state-changing actions
- [ ] Responsive behavior verified at 320px, 768px, 1024px breakpoints
- [ ] Accessibility (WCAG 2.1 AA) verified for all new screens

---

## 6. In-Scope Development Portions

The following table maps each KPI to its **in-scope development deliverables** for Phase 1.

### Backend (Java Spring Boot)

| Module | In-Scope Deliverables |
|--------|----------------------|
| KPI 1 – Auth & Access | SSO/JWT auth service, RBAC middleware, profile API, delegation API, HRMS sync job |
| KPI 2 – Travel Request | Travel request CRUD, multi-city itinerary entity, advance request entity, attachment upload, status state machine, blackout period validator |
| KPI 3 – Approval Workflow | Workflow engine (Spring State Machine / Camunda), approval chain config API, escalation scheduler, audit trail service, bulk approval API |
| KPI 4 – Expense Claims | Expense claim CRUD, OCR integration (AWS Textract), currency conversion service, per diem calculator, duplicate detection service |
| KPI 5 – Policy Engine | Policy config CRUD, violation detection engine, exception routing logic, blackout enforcement, grade entitlement service, policy versioning |
| KPI 6 – Finance Processing | Finance queue API, partial approval logic, ERP/payroll export job, advance settlement service, hold workflow, tax metadata service |
| KPI 7 – Booking & Vendor | Travel Desk portal API, GDS read-only integration, corporate card reconciliation (CSV import), visa checklist API, vendor list CRUD |
| KPI 8 – Notifications | Notification service (email/in-app/push/SMS), template management API, SLA reminder scheduler, post-travel reminder scheduler |
| KPI 9 – Reporting | Dashboard data API, department spend report, policy violation report, budget vs actuals report, audit trail export, scheduled report job |
| KPI 10 – Budget | Budget allocation CRUD, real-time tracking service, threshold alert service, revision workflow, GL/cost center mapping |
| KPI 13 – Security | TLS config, AES-256 file storage, IP whitelisting filter, failed login lockout, activity logging interceptor |
| KPI 14 – Integration | HRMS sync API client, ERP export API client, SSO integration, Exchange Rate API client, Webhook dispatcher |
| KPI 15 – Deployment | Dockerfile (frontend + backend), Docker Compose, Kubernetes Helm Charts, CI/CD pipeline (GitHub Actions), Secrets Manager integration |
| KPI 16 – Testing | JUnit unit tests (≥80%), integration tests, JMeter load test scripts, OpenAPI docs, user guide, admin guide |

### Frontend (React + TypeScript)

| Module | In-Scope Deliverables |
|--------|----------------------|
| KPI 1 – Auth & Access | Login page (SSO + fallback), role-aware routing, profile page, delegation UI |
| KPI 2 – Travel Request | Travel request form (multi-city support), draft management UI, request list & detail view, status timeline, attachment upload |
| KPI 3 – Approval Workflow | Approver queue, approve/reject/return modal, bulk approval UI, escalation indicators, audit trail viewer |
| KPI 4 – Expense Claims | Expense claim form (itemized), receipt upload with OCR preview, currency conversion display, per diem display, duplicate warning, amendment flow |
| KPI 5 – Policy Engine | Inline violation alerts on forms, exception justification modal, blackout period warnings, grade entitlement display |
| KPI 6 – Finance Processing | Finance review queue, partial approval UI, reimbursement status tracker, hold workflow UI |
| KPI 7 – Booking & Vendor | Travel Desk portal (booking entry, confirmation sync), visa checklist view |
| KPI 8 – Notifications | Notification bell (grouped), notification preferences page |
| KPI 9 – Reporting | Executive dashboard (Recharts: spend gauges, trend charts, budget utilization), department spend table, policy violation list, export controls |
| KPI 10 – Budget | Budget dashboard, threshold alert display, revision request form |
| KPI 11 – Mobile (React Native) | Mobile travel request, expense claim with camera OCR, mobile approval, offline draft sync, biometric auth, push notification handling |
| KPI 12 – Responsive Web | Tailwind CSS responsive breakpoints (320/768/1024px), dark/light mode toggle, WCAG 2.1 AA compliance |

---

## 7. Out of Scope (Phase 1 Boundary)

The following items are **explicitly excluded** from Phase 1 development. Any request to implement these should be treated as a stopping point.

| Item | Reason |
|------|--------|
| Direct GDS booking by employees (self-service) | Deferred to Phase 2 |
| AI/ML travel recommendations & expense anomaly detection | Deferred to Phase 2 |
| Carbon footprint tracking per trip | Deferred to Phase 2 |
| Multi-country payroll integration (beyond primary geography) | Deferred to Phase 2 |
| Historical data migration (Excel/paper records) | Out of scope entirely |
| Real-time messaging / DMs between employees | Out of scope entirely |
| Native vendor marketplace (employee self-booking) | Out of scope entirely |
| Multi-language / i18n support | Deferred to Phase 2 (English only for Phase 1) |

---

## 8. Technical Stack Reference

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + TypeScript, Tailwind CSS, Recharts / Chart.js, Lucide Icons |
| Mobile | React Native (iOS 14+, Android 10+) |
| Backend | Java + Spring Boot, Spring State Machine / Camunda BPM |
| Database | PostgreSQL 15+ (primary), Redis 7+ (cache/sessions) |
| ORM & Migration | Hibernate JPA, Flyway |
| Authentication | SAML 2.0 / OAuth2 SSO + JWT RS256, BCrypt |
| File Storage | AWS S3 / Azure Blob (AES-256, signed URLs) |
| OCR Engine | AWS Textract (primary), Tesseract (fallback) |
| Notification | SendGrid (email), Twilio (SMS/WhatsApp), Firebase (push) |
| Containerization | Docker, Docker Compose, Kubernetes (Helm Charts) |
| CI/CD | GitHub Actions / Jenkins |
| Monitoring | Prometheus + Grafana, ELK Stack |
| Secrets | Vault / AWS Secrets Manager |
| Testing | JUnit, Mockito, React Testing Library, Cypress, JMeter |

---

## 9. Development Timeline

| Day | Focus |
|-----|-------|
| Day 1 | Project setup, database schema, HRMS integration, SSO authentication (KPI 1, KPI 14) |
| Day 2 | Travel request module, multi-level approval workflow engine (KPI 2, KPI 3) |
| Day 3 | Expense claim module, OCR integration, policy compliance engine (KPI 4, KPI 5) |
| Day 4 | Reimbursement processing, ERP integration, budget management (KPI 6, KPI 10) |
| Day 5 | Reporting & analytics, mobile responsiveness, notifications (KPI 7, KPI 8, KPI 9, KPI 11, KPI 12) |
| Day 6 | Security hardening, audit logging, performance testing (KPI 13, KPI 16) |
| Day 7 | UAT support, documentation, CI/CD pipeline, deployment configuration (KPI 15, KPI 16) |

---

## 10. Success Criteria

- ✅ Employees raise, track, and settle travel requests and expense claims **end-to-end without email or paper**
- ✅ Multi-level approval workflows enforce organizational hierarchy with **full auditability**
- ✅ Policy engine automatically enforces spending limits and entitlements, reducing non-compliant claims
- ✅ Finance team has **complete real-time visibility** into travel spend with dashboards and reports
- ✅ Seamless HRMS and ERP integration **eliminates manual data re-entry**
- ✅ Reimbursement cycle time reduced from **weeks to days**
- ✅ System scales to **10,000+ employees** with **99.9% uptime SLA**
- ✅ All sensitive data **encrypted and compliant** with applicable data privacy regulations
- ✅ All 16 KPIs pass their defined acceptance criteria
- ✅ API P95 response time **< 500ms** under full load
