# KPI Document — Enterprise Employee Travel & Expense Management System (TEMS)

> **Version:** 1.0 | **Date:** 2026-06-10
> This document serves as the foundation for QA strategy, UAT checklists, BRD validation, and stakeholder success reporting.

---

### STEP 1 – KPI GENERATION

---

#### Module M1: Authentication & Role-Based Access Control

| KPI Number | KPI Name | Description | Criteria |
| --- | --- | --- | --- |
| KPI-AUTH-01 | JWT Token Issuance | Verify valid JWT is returned on successful login | `POST /auth/login` with valid credentials returns HTTP 200 and a signed JWT; token contains user ID and roles in payload |
| KPI-AUTH-02 | Invalid Credential Rejection | Block access with wrong email or password | Login with incorrect password returns HTTP 401 Unauthorized; no token issued; event logged in audit_logs |
| KPI-AUTH-03 | Role-Based Endpoint Guard | Enforce role restrictions on all protected endpoints | EMPLOYEE calling `POST /reimbursements/initiate` returns 403 Forbidden; AUDITOR calling `PATCH /expense-claims/:id/approve` returns 403 Forbidden |
| KPI-AUTH-04 | Expired Token Handling | Reject requests using expired JWT | Request with expired token returns 401 Unauthorized; client must re-authenticate |
| KPI-AUTH-05 | Login Audit Logging | Record all authentication events | Every login attempt (success or failure) writes a record to audit_logs with user_id, IP address, and timestamp within 500 ms |

---

#### Module M2: User & Org Profile Management

| KPI Number | KPI Name | Description | Criteria |
| --- | --- | --- | --- |
| KPI-USR-01 | Unique Employee ID Constraint | Prevent duplicate employee registrations | Creating two users with the same employee_id or email returns 409 Conflict |
| KPI-USR-02 | Org Hierarchy Loop Prevention | Block circular reporting relationships | Assigning manager_id that creates a reporting loop (A→B→A) returns 422 Unprocessable Entity |
| KPI-USR-03 | Orphaned Employee Escalation | Ensure approval routing does not deadlock | An employee with no manager_id assigned has travel requests automatically routed to HR_ADMIN as fallback approver |
| KPI-USR-04 | HR Profile Update Propagation | Ensure hierarchy changes reflect in approval routing immediately | Updating a user's manager_id takes effect on the next travel request submitted; existing pending approvals are not retroactively rerouted |

---

#### Module M3: Travel Request Submission

| KPI Number | KPI Name | Description | Criteria |
| --- | --- | --- | --- |
| KPI-TR-01 | Travel Request Code Generation | Auto-generate unique sequential TR codes | Every created travel request has request_number matching regex `^TR-\d{6}$`; no two requests share the same code |
| KPI-TR-02 | Draft State Integrity | Allow incomplete drafts without triggering workflow | A draft TR can be saved with only mandatory fields (purpose, origin, destination, dates); workflow does not start until PATCH /submit is called |
| KPI-TR-03 | Advance Notice Policy Validation | Flag requests with departure within 3 days | Submitting a TR where `(departure_date - TODAY) < 3` causes policy flag; system surfaces flag to manager on approval screen |
| KPI-TR-04 | Date Sequence Validation | Reject impossible date combinations | Submitting TR with `return_date < departure_date` returns 400 Bad Request with field-level error message |
| KPI-TR-05 | Advance Amount Cap | Prevent advance exceeding estimated cost | Setting `advance_amount > estimated_cost` returns 400 Bad Request |
| KPI-TR-06 | Status Transition Integrity | Enforce valid state machine transitions | APPROVED request cannot be submitted again; CANCELLED request cannot be approved; any invalid transition returns 422 |
| KPI-TR-07 | Cancellation by Owner Only | Restrict cancellation to the originating employee | Manager calling PATCH `/travel-requests/:id/cancel` on an employee's request returns 403 Forbidden |

---

#### Module M4: Approval Workflow Engine

| KPI Number | KPI Name | Description | Criteria |
| --- | --- | --- | --- |
| KPI-APP-01 | Workflow Creation on Submission | Approval workflow auto-created on TR or Claim submission | Submitting a travel request creates exactly one approval_workflows record and one or more approval_steps records |
| KPI-APP-02 | SLA Timer & Escalation | Auto-escalate approvals that breach 8-hour SLA | Approval step remaining PENDING for > 8 hours (tracked via due_at) triggers escalation: status set to ESCALATED, escalated_to_id populated, notification sent |
| KPI-APP-03 | Self-Approval Block | Prevent approver from actioning their own submission | If approver_id equals the employee_id of the request, action returns 403 Forbidden |
| KPI-APP-04 | Approval Comment Capture | Require comments on rejection | PATCH /reject without a `reason` field returns 400 Bad Request |
| KPI-APP-05 | Multi-Step Sequential Progression | Ensure step 2 only activates after step 1 completes | step_number = 2 remains PENDING until step_number = 1 transitions to APPROVED; premature actioning of step 2 returns 422 |
| KPI-APP-06 | Manager Hierarchy Boundary | Restrict approvals to the assigned approver | A manager not assigned as approver_id for a step cannot action that step; returns 403 Forbidden |

---

#### Module M5: Expense Claims & Line Items

| KPI Number | KPI Name | Description | Criteria |
| --- | --- | --- | --- |
| KPI-EXP-01 | Single Claim per Travel Request | Enforce one expense claim per approved trip | Creating a second expense claim for an already-claimed travel_request_id returns 409 Conflict |
| KPI-EXP-02 | Claim Code Generation | Auto-generate unique EXP codes | Every claim has claim_number matching `^EXP-\d{6}$`; unique across all claims |
| KPI-EXP-03 | Total Amount Aggregation | Keep claim total in sync with line item sum | total_amount on expense_claims always equals SUM(expense_line_items.amount) for that claim; mismatch detectable via data integrity check |
| KPI-EXP-04 | Expense Date within Trip Range | Prevent line items outside the trip period | Adding line item with expense_date outside [departure_date, return_date] returns 422 Unprocessable Entity |
| KPI-EXP-05 | Negative Amount Block | Reject zero or negative expense amounts | Line item with amount ≤ 0 returns 400 Bad Request |
| KPI-EXP-06 | Claim Submission Block on Violations | Prevent submission of unfixed policy-flagged items | PATCH /submit when claim has unresolved is_policy_flagged = TRUE line items without Finance override returns 422 with list of violations |
| KPI-EXP-07 | Claim Linked to Approved TR Only | Restrict claims to approved travel requests | Creating claim against a DRAFT, REJECTED, or CANCELLED travel request returns 422 |

---

#### Module M6: Policy Compliance Engine

| KPI Number | KPI Name | Description | Criteria |
| --- | --- | --- | --- |
| KPI-POL-01 | Category Amount Limit Enforcement | Flag line items exceeding per-category limits | Hotel line item of ₹7,000 (limit ₹5,000/night) sets is_policy_flagged = TRUE with flag_reason = "Exceeds maximum hotel cost per night (₹5,000)" |
| KPI-POL-02 | Meal Daily Cap Enforcement | Flag meal expenses exceeding ₹500/day | Multiple meal line items on same expense_date with combined amount > ₹500 triggers flag on the item that breaches the cap |
| KPI-POL-03 | Local Transport Daily Cap | Flag transport expenses > ₹800/day | Local transport line items summing > ₹800 on a single date trigger policy flag with reason |
| KPI-POL-04 | Receipt Required Threshold | Flag expenses above ₹500 with no receipt | Line item with amount > 500 and receipt_id IS NULL sets is_policy_flagged = TRUE with flag_reason = "Receipt mandatory for expenses above ₹500" |
| KPI-POL-05 | Duplicate Claim Detection | Block same-employee duplicate claims | Claim with same employee_id, amount, category, and expense_date as an existing SUBMITTED/APPROVED claim returns 409 Conflict; Auditor notified |
| KPI-POL-06 | Advance Notice Rule | Flag travel requests submitted < 3 days before departure | Policy flag surfaced on Manager approval screen with flag_reason = "Travel requested with less than 3 days advance notice" |
| KPI-POL-07 | Inactive Policy Rule Bypass | Deactivated rules must not trigger flags | Line items that would violate a policy rule with is_active = FALSE pass through without flagging |
| KPI-POL-08 | Compliance Officer Rule Management | Allow real-time policy configuration | COMPLIANCE_OFFICER can create, update, and toggle rules via API; changes take effect on the next line item validation without system restart |

---

#### Module M7: Document & Receipt Attachment

| KPI Number | KPI Name | Description | Criteria |
| --- | --- | --- | --- |
| KPI-DOC-01 | Allowed File Type Enforcement | Block non-image/PDF uploads | Uploading .xlsx, .docx, .mp4, or .exe returns 400 Bad Request with message listing allowed types |
| KPI-DOC-02 | File Size Limit Enforcement | Block files exceeding 5 MB | Uploading a 6 MB PDF returns 400 Bad Request / 413 Payload Too Large; file is not written to storage |
| KPI-DOC-03 | UUID Filename Anonymization | Ensure stored files use anonymous names | Uploaded files stored with UUID-based filename (e.g., `a1b2c3d4-...png`); original filename preserved in documents table only |
| KPI-DOC-04 | Claim-Document Linkage | Verify documents are traceable to claims | GET /documents/claim/:claimId returns all documents linked to that claim; Finance can view receipts without navigating away from claim screen |
| KPI-DOC-05 | Orphan Document Prevention | Prevent unlinked document accumulation | Documents uploaded without a valid expenseClaimId return 400 Bad Request; upload rejected |

---

#### Module M8: Finance Audit & Claim Approval

| KPI Number | KPI Name | Description | Criteria |
| --- | --- | --- | --- |
| KPI-FIN-01 | Partial Approval Amount | Finance can approve less than claimed amount | approved_amount field accepts a value ≤ total_amount; difference is visible in reimbursement record |
| KPI-FIN-02 | Finance Notes Capture | Capture Finance review rationale | finance_notes field populated on PATCH /approve or /reject; visible to employee and Auditor |
| KPI-FIN-03 | Finance-Only Approval Restriction | Prevent non-Finance roles from approving claims | MANAGER or EMPLOYEE calling PATCH /expense-claims/:id/approve returns 403 Forbidden |
| KPI-FIN-04 | Claim Queue Visibility | Finance can view all pending claims | GET /expense-claims with status filter returns all SUBMITTED claims across employees; paginated |

---

#### Module M9: Reimbursement Processing

| KPI Number | KPI Name | Description | Criteria |
| --- | --- | --- | --- |
| KPI-RMB-01 | Reimbursement Code Generation | Auto-generate unique RMB codes | Every reimbursement has reimbursement_number matching `^RMB-\d{6}$` |
| KPI-RMB-02 | Approved-Claim-Only Initiation | Prevent reimbursement on unapproved claims | Initiating reimbursement for a claim with status != APPROVED returns 422 |
| KPI-RMB-03 | Bank Payload Completeness | Banking payload must contain all required fields | banking_payload JSONB contains: employee_id, bank_account_number, bank_ifsc_code, amount, currency, reimbursement_number, and initiated_at |
| KPI-RMB-04 | Payment Failure Handling | Graceful handling of bank API failures | On API failure: status set to FAILED, failure_reason captured, retry_count incremented, Finance Executive notified within 1 minute |
| KPI-RMB-05 | Paid Status Reconciliation | Claim marked REIMBURSED when payment confirms | Transitioning reimbursement status to PAID automatically updates associated expense_claim.status to REIMBURSED |
| KPI-RMB-06 | Retry Mechanism | Support Finance-initiated retry on failed payments | Finance can retry a FAILED reimbursement; retry_count tracked; max retries configurable |
| KPI-RMB-07 | Bank Info Prerequisite | Block payment if bank details missing | Initiating reimbursement when employee's bank_account_number or bank_ifsc_code is NULL returns 422 with actionable error |

---

#### Module M10: Notifications

| KPI Number | KPI Name | Description | Criteria |
| --- | --- | --- | --- |
| KPI-NOT-01 | Submission Notification to Manager | Manager alerted when team TR is submitted | Notification record created in notifications table within 500 ms of TR status changing to SUBMITTED |
| KPI-NOT-02 | Approval/Rejection Notification to Employee | Employee alerted on decision | Notification dispatched within 500 ms of approval_step actioned; contains approval outcome and comments/reason |
| KPI-NOT-03 | Finance Notification on Approved Claim | Finance team alerted when claim ready for review | Notification sent to all FINANCE_EXECUTIVE users when expense claim status transitions to SUBMITTED |
| KPI-NOT-04 | SLA Breach Escalation Notification | Notify escalation target | When step escalated, notification sent to escalated_to_id within 1 minute of escalation trigger |
| KPI-NOT-05 | Payment Failure Alert | Finance notified on bank failure | FAILED reimbursement triggers notification to Finance Executive within 60 seconds |

---

#### Module M11: Audit Trail & Compliance

| KPI Number | KPI Name | Description | Criteria |
| --- | --- | --- | --- |
| KPI-AUD-01 | Status Change Logging | All entity status transitions logged | Every change to travel_request.status, expense_claim.status, reimbursement.status writes audit log with entity_id, old_status, new_status, actor_id, and timestamp |
| KPI-AUD-02 | Policy Override Logging | Record all manual policy overrides by Finance | When Finance approves a flagged claim, audit log captures override action, user_id, claim_id, and flag_reasons overridden |
| KPI-AUD-03 | Policy Rule Change Logging | Track compliance rule modifications | Creating, updating, or toggling a policy rule writes audit log with rule_id, changed_by, old_value, new_value, and timestamp |
| KPI-AUD-04 | Auditor Read-Only Access | Auditor cannot modify any data | All PATCH/POST/PUT/DELETE calls from AUDITOR role return 403 Forbidden |
| KPI-AUD-05 | Audit Log Immutability | Audit logs cannot be edited or deleted | No DELETE or UPDATE endpoint exists for audit_logs table; table has no update triggers |
| KPI-AUD-06 | Login Event Capture | Record all authentication events | Successful and failed login attempts logged with user email, IP, user_agent, and outcome |

---

#### Module M12: Reports & Dashboard

| KPI Number | KPI Name | Description | Criteria |
| --- | --- | --- | --- |
| KPI-RPT-01 | Role-Adaptive Dashboard | Dashboard data scoped to user's role | EMPLOYEE sees only own data; MANAGER sees team data; FINANCE sees org-wide claim/payment data; ADMIN sees full system metrics |
| KPI-RPT-02 | Department-Level Spend Reporting | Filter travel spend by department | Admin/Finance can filter expense totals by department and date range; data accurate to last committed transaction |
| KPI-RPT-03 | Purpose-Based Travel Analytics | Classify travel spend by trip purpose | Reports breakdowns available per travel_purpose enum (CLIENT_ENGAGEMENT, AUDIT, TRAINING, CONFERENCE, etc.) |
| KPI-RPT-04 | Claim Status Distribution Report | Show claims at each lifecycle stage | Finance dashboard shows count of DRAFT, SUBMITTED, APPROVED, REJECTED, REIMBURSED claims in real time |
| KPI-RPT-05 | SLA Breach Rate Reporting | Track approval SLA performance | Admin can view percentage of approval steps that exceeded 8-hour SLA in a given period |

---

### STEP 2 – IMPLEMENTATION ROADMAP

---

# Development Timeline

| Sprint | Focus Area | Deliverables |
| --- | --- | --- |
| Sprint 1 (Weeks 1–2) | Foundation & Auth | PostgreSQL schema execution (all 9 migrations + seeds); NestJS project scaffold; JWT auth module; RBAC guards; user profile CRUD; login/profile endpoints; Swagger setup |
| Sprint 2 (Weeks 3–4) | Travel Request Module | Travel request entity + service + controller; DRAFT/SUBMIT/APPROVE/REJECT/CANCEL state machine; advance notice policy check; manager approval queue; SLA timer logic + escalation; TR notifications |
| Sprint 3 (Weeks 5–6) | Expense Claims & Documents | Expense claim entity + line items; one-claim-per-trip constraint; line item CRUD; Multer document upload service; receipt-to-line-item linkage; date range validation; Finance claim review endpoints |
| Sprint 4 (Weeks 7–8) | Policy Engine & Compliance | Policy rules engine service; all 10 default rule validations (amount limits, daily caps, receipt threshold, duplicate detection, advance notice); is_policy_flagged logic; Compliance Officer rule management API; Auditor read-only access |
| Sprint 5 (Weeks 9–10) | Reimbursement & Payments | Reimbursement entity + service; bank payload JSONB generation; status lifecycle management; failure handling + retry; paid-to-reimbursed reconciliation; Finance dashboard |
| Sprint 6 (Weeks 11–12) | Notifications, Audit & Reports | Notifications table + dispatch service; audit log middleware for all state changes; reports endpoints (spend by dept/purpose/status); dashboard aggregation APIs; Admin system metrics |
| Sprint 7 (Weeks 13–14) | Frontend Integration & UAT | React frontend integration against all backend APIs; role-adaptive dashboard UI; dark mode + glassmorphism design system; end-to-end UAT scenarios; bug fixes; performance testing |

---

# Success Criteria

| Category | Success Metric | Target |
| --- | --- | --- |
| Process Digitization | Percentage of travel requests and claims processed entirely through TEMS | 100% within 90 days of go-live |
| Cost Reduction | Reduction in manual admin effort per travel claim (HR + Finance combined) | ≥ 40% reduction versus pre-TEMS baseline |
| Approval Cycle Reduction | Average time from Travel Request submission to Manager approval decision | < 24 hours average |
| Reimbursement Speed | Average time from Finance claim approval to PAID status | < 3 business days |
| User Adoption Rate | Percentage of active traveling employees using TEMS for all submissions | ≥ 95% within 60 days of launch |
| SLA Achievement | Percentage of approval steps actioned within the 8-hour SLA window | ≥ 90% |
| Compliance Rate | Percentage of expense claims auto-validated against policy rules before Finance review | 100% (zero manual policy checks by Finance) |
| Duplicate/Fraud Detection | Percentage of duplicate claim attempts caught and blocked automatically | 100% |
| System Reliability | Platform uptime during business hours | ≥ 99.9% |
| API Performance | 95th percentile response time for all CRUD operations | < 300 ms |

---

## IMPORTANT RULES
1. Never generate generic KPIs.
2. Include governance, audit, security, scalability, compliance, and operational KPIs.
3. Ensure every module has complete KPI coverage.
4. Output must be detailed enough to directly become a BRD, PRD, QA strategy, and UAT checklist foundation.
5. Use markdown tables throughout.
6. Do not skip technical, operational, security, or reporting modules.
