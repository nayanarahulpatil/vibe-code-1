# Test Cases Document
## Enterprise Employee Travel & Expense Management System

**Document Version:** 1.0  
**Prepared By:** QA Lead / Senior Product Manager  
**Date:** 2026-06-05  
**Reference Documents:** `prd.md` · `kpi.md`  
**Testing Framework:** Jest (Unit/Integration) · Playwright (E2E) · k6 (Load)

---

## Test Case ID Convention

```
TC-[MODULE]-[TYPE]-[NUMBER]
│     │       │       └── Sequence number (001, 002...)
│     │       └──────── F=Functional | NF=Non-Functional | KPI=KPI Validation
│     └──────────────── Module code (AUTH, USR, TR, APR, EXP, REC, POL, RMB, NOT, DSH, RPT, AUD)
└────────────────────── Test Case prefix
```

---

## Test Execution Summary Table

| Module | Functional TCs | NFR TCs | KPI TCs | Total |
|--------|---------------|---------|---------|-------|
| Authentication (AUTH) | 8 | 2 | — | 10 |
| User Management (USR) | 6 | 1 | — | 7 |
| Travel Request (TR) | 10 | 1 | 2 | 13 |
| Approval Workflow (APR) | 8 | 1 | 2 | 11 |
| Expense Claims (EXP) | 8 | 1 | 1 | 10 |
| Receipt Upload (REC) | 5 | 1 | — | 6 |
| Policy Engine (POL) | 7 | 1 | 2 | 10 |
| Reimbursement (RMB) | 7 | 1 | 2 | 10 |
| Notifications (NOT) | 5 | 1 | 1 | 7 |
| Dashboard & Analytics (DSH) | 5 | 2 | 3 | 10 |
| Reports (RPT) | 4 | 1 | — | 5 |
| Audit Logs (AUD) | 5 | 1 | 1 | 7 |
| **Total** | **78** | **14** | **14** | **106** |

---

## Module 1 — Authentication (FR-001)

### TC-AUTH-F-001
**Title:** Valid SSO login redirects to employee dashboard  
**Priority:** P0 — Critical  
**Precondition:** User has valid corporate SSO credentials  
**Steps:**
1. Navigate to the application login page
2. Click "Login with SSO"
3. Enter valid corporate credentials on the IdP page
4. Submit the form

**Expected Result:** User is authenticated, JWT token is issued, and redirected to the employee dashboard based on their role  
**Related:** FR-001, US-001

---

### TC-AUTH-F-002
**Title:** Invalid SSO credentials are rejected  
**Priority:** P0 — Critical  
**Precondition:** User has invalid / expired corporate credentials  
**Steps:**
1. Navigate to the login page
2. Click "Login with SSO"
3. Enter incorrect credentials on the IdP page

**Expected Result:** IdP rejects login; application displays "Authentication Failed" message; no token is issued  
**Related:** FR-001

---

### TC-AUTH-F-003
**Title:** Role-based routing — Employee lands on Employee Portal  
**Priority:** P0 — Critical  
**Precondition:** User has role = EMPLOYEE  
**Steps:**
1. Login with SSO using an account with EMPLOYEE role

**Expected Result:** User is redirected to `/employee/dashboard`; Manager Approval Queue and Finance panels are not visible  
**Related:** FR-001, FR-002

---

### TC-AUTH-F-004
**Title:** Role-based routing — Manager lands on Approval Dashboard  
**Priority:** P0 — Critical  
**Precondition:** User has role = MANAGER  
**Steps:**
1. Login with SSO using an account with MANAGER role

**Expected Result:** User sees Pending Approvals queue; Employee travel request submission form is accessible  
**Related:** FR-001, FR-002

---

### TC-AUTH-F-005
**Title:** Expired session redirects user to login page  
**Priority:** P1 — High  
**Precondition:** User is logged in; JWT token expires  
**Steps:**
1. Login successfully
2. Wait for JWT token to expire (or manually expire session)
3. Attempt to navigate to any protected route

**Expected Result:** User is redirected to the login page with "Session Expired" message; no protected data is accessible  
**Related:** FR-001

---

### TC-AUTH-F-006
**Title:** Unauthorized role cannot access restricted pages  
**Priority:** P1 — High  
**Precondition:** Logged in as EMPLOYEE  
**Steps:**
1. Login as EMPLOYEE
2. Manually navigate to `/admin/users`

**Expected Result:** Application returns HTTP 403 Forbidden; UI displays "Access Denied" page  
**Related:** FR-001, FR-002

---

### TC-AUTH-F-007
**Title:** Logout clears session and invalidates token  
**Priority:** P1 — High  
**Precondition:** User is logged in  
**Steps:**
1. Click the "Logout" button
2. Attempt to access a protected route using the previous token

**Expected Result:** Session is destroyed; token is invalidated; protected routes return 401 Unauthorized  
**Related:** FR-001

---

### TC-AUTH-F-008
**Title:** Concurrent login from two devices is handled  
**Priority:** P2 — Medium  
**Precondition:** Valid SSO credentials  
**Steps:**
1. Login from Device A
2. Login with same credentials from Device B

**Expected Result:** Both sessions are active OR Device A session is invalidated (per configured policy); no system error occurs  
**Related:** FR-001

---

### TC-AUTH-NF-001
**Title:** Login page loads within 3 seconds  
**Priority:** P1 — High  
**Steps:**
1. Navigate to the login URL on a standard broadband connection
2. Measure Time-To-Interactive (TTI)

**Expected Result:** Page TTI ≤ 3 seconds  
**Related:** NFR — Performance

---

### TC-AUTH-NF-002
**Title:** SSO token is transmitted over TLS 1.2+  
**Priority:** P0 — Critical  
**Steps:**
1. Capture network traffic during login using a proxy tool
2. Inspect the connection protocol for the auth token exchange

**Expected Result:** All auth traffic uses TLS 1.2 or higher; no plaintext token transmission  
**Related:** NFR — Security

---

## Module 2 — User Management (FR-002)

### TC-USR-F-001
**Title:** Admin can create a new employee profile  
**Priority:** P0 — Critical  
**Precondition:** Logged in as ADMIN  
**Steps:**
1. Navigate to Admin > User Management
2. Click "Add User"
3. Enter employee ID, name, email, department, designation, manager
4. Assign role = EMPLOYEE
5. Click Save

**Expected Result:** New employee profile is created; user appears in the user list; a welcome notification is sent to the employee's email  
**Related:** FR-002

---

### TC-USR-F-002
**Title:** Admin can update a user's role  
**Priority:** P1 — High  
**Precondition:** Logged in as ADMIN; target user exists  
**Steps:**
1. Navigate to Admin > User Management > Select user
2. Change role from EMPLOYEE to MANAGER
3. Click Save

**Expected Result:** Role is updated immediately; user's next login reflects new role-based routing and permissions  
**Related:** FR-002

---

### TC-USR-F-003
**Title:** Admin can deactivate an employee account  
**Priority:** P1 — High  
**Precondition:** Logged in as ADMIN; target user is active  
**Steps:**
1. Navigate to Admin > User Management > Select user
2. Click "Deactivate Account"
3. Confirm the action

**Expected Result:** Account is deactivated; user cannot login; existing pending requests remain visible to managers  
**Related:** FR-002

---

### TC-USR-F-004
**Title:** HRMS sync updates employee data correctly  
**Priority:** P1 — High  
**Precondition:** HRMS integration is active  
**Steps:**
1. Update an employee's designation in the HRMS system
2. Trigger or wait for the HRMS sync job

**Expected Result:** Employee profile in the system reflects the updated designation within the configured sync interval  
**Related:** FR-002

---

### TC-USR-F-005
**Title:** Duplicate employee ID is rejected during creation  
**Priority:** P1 — High  
**Precondition:** Logged in as ADMIN; Employee ID EMP-001 already exists  
**Steps:**
1. Navigate to Add User
2. Enter Employee ID = EMP-001 (duplicate)
3. Click Save

**Expected Result:** System returns a validation error: "Employee ID already exists"; record is not created  
**Related:** FR-002

---

### TC-USR-F-006
**Title:** Org hierarchy is correctly reflected in the system  
**Priority:** P2 — Medium  
**Precondition:** Org hierarchy is configured in Admin panel  
**Steps:**
1. Navigate to Admin > Org Hierarchy
2. Select a department
3. View the reporting structure

**Expected Result:** Correct manager-employee relationships are displayed; travel request routing matches the configured hierarchy  
**Related:** FR-002, FR-004

---

### TC-USR-NF-001
**Title:** User list API returns 1,000 records within 2 seconds  
**Priority:** P1 — High  
**Steps:**
1. Seed 1,000 employee records
2. Call `GET /api/users?page=1&limit=50`
3. Measure API response time

**Expected Result:** Response time ≤ 2 seconds; paginated results returned correctly  
**Related:** NFR — Performance

---

## Module 3 — Travel Request (FR-003)

### TC-TR-F-001
**Title:** Employee can create a new travel request  
**Priority:** P0 — Critical  
**Precondition:** Logged in as EMPLOYEE  
**Steps:**
1. Navigate to Travel Requests > New Request
2. Fill in: purpose, origin, destination, travel dates, estimated cost, advance required (Yes/No)
3. Click Submit

**Expected Result:** Travel request is created with status = SUBMITTED; request ID is generated; confirmation notification is sent; request is routed to the employee's manager  
**Related:** FR-003, US-001

---

### TC-TR-F-002
**Title:** Employee can save a travel request as draft  
**Priority:** P2 — Medium  
**Precondition:** Logged in as EMPLOYEE  
**Steps:**
1. Fill in partial travel request details
2. Click "Save as Draft"

**Expected Result:** Request is saved with status = DRAFT; not routed for approval; accessible in "My Drafts"  
**Related:** FR-003

---

### TC-TR-F-003
**Title:** Mandatory fields are validated on travel request submission  
**Priority:** P1 — High  
**Precondition:** Logged in as EMPLOYEE  
**Steps:**
1. Navigate to New Travel Request
2. Leave "Destination" and "Travel Dates" empty
3. Click Submit

**Expected Result:** Validation errors are shown for all mandatory fields; form is not submitted  
**Related:** FR-003

---

### TC-TR-F-004
**Title:** Employee can view all their travel requests with status  
**Priority:** P1 — High  
**Precondition:** Employee has submitted at least 3 travel requests  
**Steps:**
1. Navigate to "My Travel Requests"

**Expected Result:** All requests are listed with correct status labels (Draft, Submitted, Approved, Rejected, Cancelled); sortable by date  
**Related:** FR-003, US-001

---

### TC-TR-F-005
**Title:** Employee can edit a travel request in DRAFT status  
**Priority:** P2 — Medium  
**Precondition:** A travel request exists in DRAFT status  
**Steps:**
1. Navigate to My Travel Requests > Select Draft
2. Update the estimated cost
3. Click Save

**Expected Result:** Draft is updated with new values; no approval re-trigger  
**Related:** FR-003

---

### TC-TR-F-006
**Title:** Employee cannot edit a SUBMITTED travel request  
**Priority:** P1 — High  
**Precondition:** A travel request exists in SUBMITTED status  
**Steps:**
1. Navigate to My Travel Requests > Select Submitted request
2. Attempt to edit any field

**Expected Result:** Edit fields are disabled or not accessible; "Request is under review" message is shown  
**Related:** FR-003

---

### TC-TR-F-007
**Title:** Employee can cancel a SUBMITTED travel request  
**Priority:** P2 — Medium  
**Precondition:** A travel request is in SUBMITTED status  
**Steps:**
1. Navigate to the request detail
2. Click "Cancel Request"
3. Confirm cancellation with a reason

**Expected Result:** Request status changes to CANCELLED; manager receives a cancellation notification  
**Related:** FR-003

---

### TC-TR-F-008
**Title:** Past travel dates are not accepted  
**Priority:** P1 — High  
**Precondition:** Logged in as EMPLOYEE  
**Steps:**
1. Navigate to New Travel Request
2. Enter a travel start date = yesterday's date
3. Click Submit

**Expected Result:** Validation error: "Travel date cannot be in the past"; form not submitted  
**Related:** FR-003

---

### TC-TR-F-009
**Title:** Return date must be after departure date  
**Priority:** P1 — High  
**Steps:**
1. Enter departure date = 2026-07-10, return date = 2026-07-05
2. Click Submit

**Expected Result:** Validation error: "Return date must be after departure date"; form not submitted  
**Related:** FR-003

---

### TC-TR-F-010
**Title:** Estimated cost field only accepts positive numeric values  
**Priority:** P2 — Medium  
**Steps:**
1. Enter estimated cost = -5000
2. Click Submit

**Expected Result:** Validation error: "Cost must be a positive number"; form not submitted  
**Related:** FR-003

---

### TC-TR-NF-001
**Title:** Travel request creation API responds within 2 seconds  
**Priority:** P1 — High  
**Steps:**
1. Submit a valid travel request via API
2. Measure response time under 100 concurrent users

**Expected Result:** `POST /api/travel-requests` responds in ≤ 2 seconds at p95  
**Related:** NFR — Performance

---

### TC-TR-KPI-001
**Title:** Travel request processing time is under 8 hours  
**Priority:** P0 — Critical  
**Steps:**
1. Submit a travel request at T=0
2. Manager approves the request
3. Record timestamp of final approval

**Expected Result:** Time from T=0 (submission) to final approval ≤ 8 hours for standard (non-exception) requests  
**Related:** KPI — Travel Request Processing Time

---

### TC-TR-KPI-002
**Title:** 100% of travel requests are submitted digitally  
**Priority:** P0 — Critical  
**Steps:**
1. After Go-Live, query total travel requests created in the system
2. Verify zero paper/email submissions recorded

**Expected Result:** Digital Submission Rate = 100%; no offline submissions exist in the system  
**Related:** KPI — Digital Submission Rate

---

## Module 4 — Approval Workflow (FR-004)

### TC-APR-F-001
**Title:** Travel request is routed to correct manager on submission  
**Priority:** P0 — Critical  
**Precondition:** Employee's manager is configured in org hierarchy  
**Steps:**
1. Employee submits a travel request
2. Login as the employee's configured manager

**Expected Result:** Request appears in the manager's approval queue immediately  
**Related:** FR-004, US-002

---

### TC-APR-F-002
**Title:** Manager can approve a travel request with comments  
**Priority:** P0 — Critical  
**Precondition:** A travel request is pending in the manager's queue  
**Steps:**
1. Login as MANAGER
2. Open the pending request
3. Enter approval comments
4. Click "Approve"

**Expected Result:** Request status changes to APPROVED (or escalated to next level if multi-level); employee receives approval notification  
**Related:** FR-004, US-002

---

### TC-APR-F-003
**Title:** Manager can reject a travel request with mandatory reason  
**Priority:** P0 — Critical  
**Precondition:** A travel request is pending  
**Steps:**
1. Login as MANAGER
2. Open the pending request
3. Attempt to reject without entering a reason
4. Then reject with a valid reason

**Expected Result:** Step 3 — System requires rejection reason; Step 4 — Request status = REJECTED; employee notified with reason  
**Related:** FR-004

---

### TC-APR-F-004
**Title:** Multi-level approval chain is enforced in sequence  
**Priority:** P0 — Critical  
**Precondition:** Policy requires Manager → HOD → Finance approval  
**Steps:**
1. Employee submits request
2. Manager approves
3. Check if HOD receives the request before Finance

**Expected Result:** HOD receives the request only after Manager approves; Finance receives only after HOD approves; sequence is strictly enforced  
**Related:** FR-004

---

### TC-APR-F-005
**Title:** SLA timer triggers escalation when approval is not done in time  
**Priority:** P1 — High  
**Precondition:** SLA = 4 hours for Manager approval  
**Steps:**
1. Employee submits travel request
2. Manager takes no action for 4 hours

**Expected Result:** System auto-escalates to the manager's supervisor; escalation notification is sent to both the manager and supervisor  
**Related:** FR-004

---

### TC-APR-F-006
**Title:** Approved request cannot be re-approved or re-rejected  
**Priority:** P1 — High  
**Precondition:** Request is already in APPROVED status  
**Steps:**
1. Navigate to the approved request
2. Attempt to click Approve or Reject again

**Expected Result:** Approve/Reject buttons are disabled; request is read-only  
**Related:** FR-004

---

### TC-APR-F-007
**Title:** Finance approval is triggered after all manager-level approvals  
**Priority:** P0 — Critical  
**Precondition:** All manager-level approvals are complete  
**Steps:**
1. Manager and HOD both approve a request
2. Login as Finance Executive

**Expected Result:** Request appears in Finance queue for final financial review and approval  
**Related:** FR-004, FR-008

---

### TC-APR-F-008
**Title:** Manager dashboard shows all pending requests count  
**Priority:** P1 — High  
**Precondition:** 5 requests are pending for a manager  
**Steps:**
1. Login as MANAGER
2. View the Approval Dashboard

**Expected Result:** Dashboard badge shows "5 Pending"; all 5 requests are listed with employee name, destination, and submission date  
**Related:** FR-004, FR-010

---

### TC-APR-NF-001
**Title:** Approval action API responds within 2 seconds  
**Priority:** P1 — High  
**Steps:**
1. Submit an approval decision via API: `POST /api/approvals/{id}/approve`
2. Measure response time

**Expected Result:** Response time ≤ 2 seconds; workflow next step is triggered synchronously or via queue within 30 seconds  
**Related:** NFR — Performance

---

### TC-APR-KPI-001
**Title:** Approval time is under 8 hours end-to-end  
**Priority:** P0 — Critical  
**Steps:**
1. Measure time from travel request submission to final approval across 50 test requests
2. Calculate average and p95 approval time

**Expected Result:** Average approval time ≤ 8 hours; KPI dashboard reflects correct processing time  
**Related:** KPI — Travel Request Processing Time

---

### TC-APR-KPI-002
**Title:** Manual intervention rate is below 10%  
**Priority:** P1 — High  
**Steps:**
1. Process 100 travel requests through the system
2. Count requests that required manual override or off-system handling

**Expected Result:** ≤ 10 requests require manual intervention; remaining 90+ are fully auto-routed  
**Related:** KPI — Manual Intervention Rate

---

## Module 5 — Expense Claims (FR-005)

### TC-EXP-F-001
**Title:** Employee can submit an expense claim for an approved trip  
**Priority:** P0 — Critical  
**Precondition:** Travel request is in APPROVED status  
**Steps:**
1. Navigate to Expense Claims > New Claim
2. Select the linked travel request
3. Add line items: category, amount, date, description
4. Click Submit

**Expected Result:** Expense claim is created and linked to the travel request; status = SUBMITTED; forwarded to Finance queue  
**Related:** FR-005, US-001

---

### TC-EXP-F-002
**Title:** Expense claim cannot be created for a non-approved travel request  
**Priority:** P1 — High  
**Precondition:** Travel request is in SUBMITTED (pending approval) status  
**Steps:**
1. Navigate to New Expense Claim
2. Attempt to link a non-approved travel request

**Expected Result:** System displays error: "Expense can only be claimed for approved travel requests"; claim not created  
**Related:** FR-005

---

### TC-EXP-F-003
**Title:** Multiple expense line items can be added to one claim  
**Priority:** P1 — High  
**Steps:**
1. Create an expense claim
2. Add 5 line items: Flights, Hotel, Meals, Cab, Miscellaneous

**Expected Result:** All 5 line items are saved; total amount is auto-calculated; each line item shows category, amount, and date  
**Related:** FR-005

---

### TC-EXP-F-004
**Title:** Duplicate expense claim for the same trip is rejected  
**Priority:** P0 — Critical  
**Precondition:** An expense claim already exists for Travel Request ID TR-001  
**Steps:**
1. Attempt to submit another expense claim for TR-001

**Expected Result:** System rejects with error: "An expense claim already exists for this travel request"; duplicate not created  
**Related:** FR-005, KPI — Duplicate Claim Rate

---

### TC-EXP-F-005
**Title:** Employee can view claim status in real time  
**Priority:** P1 — High  
**Steps:**
1. Submit an expense claim
2. Navigate to "My Claims"
3. Monitor status updates as Finance processes the claim

**Expected Result:** Status updates are reflected in real time: SUBMITTED → UNDER REVIEW → APPROVED → REIMBURSED  
**Related:** FR-005, US-001

---

### TC-EXP-F-006
**Title:** Zero-amount expense line item is rejected  
**Priority:** P2 — Medium  
**Steps:**
1. Add an expense line item with amount = 0
2. Click Submit

**Expected Result:** Validation error: "Amount must be greater than zero"  
**Related:** FR-005

---

### TC-EXP-F-007
**Title:** Expense claim with missing receipt attachment is flagged  
**Priority:** P1 — High  
**Precondition:** Policy requires receipt for amounts > ₹500  
**Steps:**
1. Add expense line item: Hotel, ₹3,000
2. Do not attach a receipt
3. Click Submit

**Expected Result:** System warns: "Receipt required for claims above ₹500"; claim cannot be submitted without attachment  
**Related:** FR-005, FR-006, FR-007

---

### TC-EXP-F-008
**Title:** Finance can reject an expense claim with reason  
**Priority:** P0 — Critical  
**Precondition:** Expense claim is in Finance queue  
**Steps:**
1. Login as FINANCE EXECUTIVE
2. Open the claim
3. Enter rejection reason
4. Click Reject

**Expected Result:** Claim status = REJECTED; employee notified with reason; claim can be re-submitted after correction  
**Related:** FR-005

---

### TC-EXP-NF-001
**Title:** Expense claim list loads 200 records within 2 seconds  
**Priority:** P1 — High  
**Steps:**
1. Login as Finance Executive with 200 claims in the queue
2. Navigate to the Finance Dashboard expense queue

**Expected Result:** Page renders with all 200 records (paginated) within 2 seconds  
**Related:** NFR — Performance

---

### TC-EXP-KPI-001
**Title:** Expense claim processing time is under 2 days  
**Priority:** P0 — Critical  
**Steps:**
1. Submit an expense claim at T=0
2. Finance completes verification and reimbursement
3. Record time taken

**Expected Result:** Total processing time (submission to reimbursement initiation) ≤ 2 business days  
**Related:** KPI — Expense Claim Processing Time

---

## Module 6 — Receipt Upload (FR-006)

### TC-REC-F-001
**Title:** Employee can upload a receipt in PDF format  
**Priority:** P0 — Critical  
**Steps:**
1. Add an expense line item
2. Click "Upload Receipt"
3. Select a valid PDF file (< 5 MB)

**Expected Result:** File is uploaded and linked to the line item; thumbnail/icon is displayed; file is stored securely  
**Related:** FR-006

---

### TC-REC-F-002
**Title:** Employee can upload a receipt in JPG/PNG format  
**Priority:** P1 — High  
**Steps:**
1. Upload a JPG file (< 5 MB) as a receipt

**Expected Result:** File is accepted and stored; preview image is displayed  
**Related:** FR-006

---

### TC-REC-F-003
**Title:** Files exceeding the maximum size limit are rejected  
**Priority:** P1 — High  
**Steps:**
1. Attempt to upload a 20 MB PDF file

**Expected Result:** System rejects the file with error: "File size exceeds the 5 MB limit"  
**Related:** FR-006

---

### TC-REC-F-004
**Title:** Unsupported file types are rejected  
**Priority:** P1 — High  
**Steps:**
1. Attempt to upload an `.exe` or `.zip` file

**Expected Result:** System rejects with error: "Only PDF, JPG, and PNG files are allowed"  
**Related:** FR-006

---

### TC-REC-F-005
**Title:** Auditor can download original receipt files  
**Priority:** P1 — High  
**Precondition:** Logged in as AUDITOR  
**Steps:**
1. Navigate to an expense claim
2. Click "Download Receipt" on a line item

**Expected Result:** Original file is downloaded in its original format; file integrity is maintained  
**Related:** FR-006, FR-012

---

### TC-REC-NF-001
**Title:** Receipt upload completes within 5 seconds for a 4 MB file  
**Priority:** P1 — High  
**Steps:**
1. Upload a 4 MB JPG receipt file
2. Measure upload and processing time

**Expected Result:** File is stored and linked within ≤ 5 seconds  
**Related:** NFR — Performance

---

## Module 7 — Policy Engine (FR-007)

### TC-POL-F-001
**Title:** Expense exceeding daily meal per-diem limit is flagged  
**Priority:** P0 — Critical  
**Precondition:** Policy: Meal per-diem = ₹500/day  
**Steps:**
1. Submit an expense claim with Meal expense = ₹800 for 1 day

**Expected Result:** System flags the claim in real time: "Meal expense exceeds per-diem limit of ₹500/day"; employee must acknowledge or revise  
**Related:** FR-007, US-003

---

### TC-POL-F-002
**Title:** Hotel expense within policy limit is approved without flag  
**Priority:** P1 — High  
**Precondition:** Policy: Hotel limit = ₹5,000/night  
**Steps:**
1. Submit hotel expense = ₹4,500/night

**Expected Result:** No policy flag raised; claim passes validation  
**Related:** FR-007

---

### TC-POL-F-003
**Title:** Hotel expense exceeding policy limit is flagged  
**Priority:** P0 — Critical  
**Precondition:** Policy: Hotel limit = ₹5,000/night  
**Steps:**
1. Submit hotel expense = ₹7,000/night

**Expected Result:** System flags: "Hotel expense exceeds policy limit of ₹5,000/night"; requires manager justification  
**Related:** FR-007

---

### TC-POL-F-004
**Title:** Advance notice policy is enforced on travel request  
**Priority:** P1 — High  
**Precondition:** Policy: Minimum 3 days advance notice for travel  
**Steps:**
1. Submit a travel request with travel date = tomorrow (1 day advance)

**Expected Result:** Policy flag raised: "Travel request must be submitted at least 3 days in advance"; request is flagged for exception review  
**Related:** FR-007, FR-003

---

### TC-POL-F-005
**Title:** Admin can add a new policy rule via the UI  
**Priority:** P1 — High  
**Precondition:** Logged in as ADMIN or COMPLIANCE OFFICER  
**Steps:**
1. Navigate to Policy Rules > Add Rule
2. Enter: Category = "Flight", Limit = ₹15,000, Type = "Per Trip"
3. Click Save

**Expected Result:** New rule is active immediately; all new expense submissions are validated against it  
**Related:** FR-007

---

### TC-POL-F-006
**Title:** Policy validation runs automatically on every claim submission  
**Priority:** P0 — Critical  
**Steps:**
1. Submit an expense claim with 5 line items
2. 2 items violate policy limits

**Expected Result:** Both violations are flagged immediately upon submission; claim cannot proceed without acknowledgment  
**Related:** FR-007

---

### TC-POL-F-007
**Title:** Duplicate claim detection flags identical amounts from the same employee on the same date  
**Priority:** P0 — Critical  
**Steps:**
1. Employee submits a claim: Cab, ₹500, 2026-06-01
2. Same employee submits another claim: Cab, ₹500, 2026-06-01

**Expected Result:** System flags second claim as a potential duplicate; Finance is alerted before processing  
**Related:** FR-007, KPI — Duplicate Claim Rate

---

### TC-POL-NF-001
**Title:** Policy validation completes within 1 second of submission  
**Priority:** P1 — High  
**Steps:**
1. Submit an expense claim with 10 line items
2. Measure time from submission to policy validation response

**Expected Result:** All 10 rules are evaluated and results returned in ≤ 1 second  
**Related:** NFR — Performance

---

### TC-POL-KPI-001
**Title:** Policy compliance rate reaches above 98%  
**Priority:** P0 — Critical  
**Steps:**
1. Process 1,000 expense claims through the system
2. Count claims with zero policy violations

**Expected Result:** ≥ 980 claims pass without policy violation; Policy Compliance Rate ≥ 98%  
**Related:** KPI — Policy Compliance Rate

---

### TC-POL-KPI-002
**Title:** Policy violation rate is below 2%  
**Priority:** P1 — High  
**Steps:**
1. Review 1,000 expense claims
2. Count claims with at least one policy violation

**Expected Result:** ≤ 20 claims have violations; Policy Violation Rate ≤ 2%  
**Related:** KPI — Policy Violation Rate

---

## Module 8 — Reimbursement (FR-008)

### TC-RMB-F-001
**Title:** Finance can initiate reimbursement for an approved expense claim  
**Priority:** P0 — Critical  
**Precondition:** Expense claim is in FINANCE APPROVED status  
**Steps:**
1. Login as FINANCE EXECUTIVE
2. Open the claim
3. Click "Initiate Reimbursement"
4. Confirm payment details

**Expected Result:** Reimbursement request is sent to the banking API; claim status = PAYMENT INITIATED; employee notified  
**Related:** FR-008

---

### TC-RMB-F-002
**Title:** Payment status is updated when banking API confirms transfer  
**Priority:** P0 — Critical  
**Precondition:** Reimbursement is in PAYMENT INITIATED status  
**Steps:**
1. Banking API sends payment confirmation webhook
2. Check claim status in the system

**Expected Result:** Status updates to REIMBURSED; payment date and transaction reference are recorded; employee receives confirmation notification  
**Related:** FR-008

---

### TC-RMB-F-003
**Title:** Failed payment is reflected in the system and re-queued  
**Priority:** P1 — High  
**Precondition:** Banking API returns a payment failure  
**Steps:**
1. Simulate a banking API failure response
2. Check the system status

**Expected Result:** Claim status = PAYMENT FAILED; Finance Executive receives an alert; item is re-queued for retry  
**Related:** FR-008

---

### TC-RMB-F-004
**Title:** Finance cannot process reimbursement for a non-approved claim  
**Priority:** P1 — High  
**Precondition:** Expense claim is still in SUBMITTED status  
**Steps:**
1. Attempt to initiate reimbursement for a SUBMITTED (not yet approved) claim

**Expected Result:** "Initiate Reimbursement" button is disabled; action is not permitted  
**Related:** FR-008

---

### TC-RMB-F-005
**Title:** Employee can view reimbursement history  
**Priority:** P1 — High  
**Steps:**
1. Login as EMPLOYEE
2. Navigate to My Claims > Reimbursement History

**Expected Result:** All past reimbursements are listed with: trip name, amount, date paid, bank reference number  
**Related:** FR-008, US-001

---

### TC-RMB-F-006
**Title:** Bulk reimbursement batch can be processed by Finance  
**Priority:** P2 — Medium  
**Precondition:** 20 claims are approved and ready for reimbursement  
**Steps:**
1. Login as FINANCE EXECUTIVE
2. Select all 20 approved claims
3. Click "Process Batch Reimbursement"

**Expected Result:** All 20 payments are initiated via banking API in a single batch; each claim status is updated individually  
**Related:** FR-008

---

### TC-RMB-F-007
**Title:** Reimbursement amount matches the approved claim total  
**Priority:** P0 — Critical  
**Steps:**
1. Expense claim approved for ₹12,500
2. Initiate reimbursement

**Expected Result:** Payment amount sent to banking API = ₹12,500; no rounding or truncation errors  
**Related:** FR-008

---

### TC-RMB-NF-001
**Title:** Reimbursement initiation API responds within 2 seconds  
**Priority:** P1 — High  
**Steps:**
1. Call `POST /api/reimbursements/initiate` with a valid claim ID
2. Measure response time

**Expected Result:** API acknowledges the request in ≤ 2 seconds; banking API call is async  
**Related:** NFR — Performance

---

### TC-RMB-KPI-001
**Title:** Reimbursement turnaround time is under 3 days  
**Priority:** P0 — Critical  
**Steps:**
1. Record time from expense claim submission (T=0) to payment confirmation
2. Test across 50 sample claims

**Expected Result:** Average turnaround time ≤ 3 calendar days; p95 ≤ 3 days  
**Related:** KPI — Reimbursement Turnaround Time

---

### TC-RMB-KPI-002
**Title:** Cost per expense claim is below ₹75  
**Priority:** P1 — High  
**Steps:**
1. Calculate total operational cost (admin, processing, system cost) over 1 month
2. Divide by total claims processed

**Expected Result:** Cost per claim ≤ ₹75; measurable after 90 days post-launch  
**Related:** KPI — Cost per Expense Claim

---

## Module 9 — Notifications (FR-009)

### TC-NOT-F-001
**Title:** Employee receives email notification on travel request submission  
**Priority:** P1 — High  
**Steps:**
1. Submit a travel request
2. Check the employee's registered email inbox

**Expected Result:** Email received within 2 minutes with: request ID, destination, dates, and "pending approval" status  
**Related:** FR-009

---

### TC-NOT-F-002
**Title:** Manager receives in-app notification for new approval request  
**Priority:** P1 — High  
**Steps:**
1. Employee submits a travel request
2. Manager logs in and checks notification bell

**Expected Result:** Unread notification badge appears; notification shows employee name, trip destination, and a link to the request  
**Related:** FR-009

---

### TC-NOT-F-003
**Title:** Employee receives notification when request is approved  
**Priority:** P1 — High  
**Steps:**
1. Manager approves a travel request
2. Check the employee's email and in-app notifications

**Expected Result:** Both email and in-app notification received within 2 minutes; message states "Your travel request TR-XXXX has been approved"  
**Related:** FR-009

---

### TC-NOT-F-004
**Title:** Employee receives notification when request is rejected with reason  
**Priority:** P1 — High  
**Steps:**
1. Manager rejects a travel request with reason "Budget exceeded"
2. Check employee notifications

**Expected Result:** Notification includes rejection reason "Budget exceeded"; employee can act on it  
**Related:** FR-009

---

### TC-NOT-F-005
**Title:** SLA reminder notification is sent to approver before escalation  
**Priority:** P1 — High  
**Precondition:** SLA threshold = 4 hours; 3 hours have passed without action  
**Steps:**
1. Submit a travel request
2. Wait until 75% of SLA time has elapsed with no action

**Expected Result:** System sends a reminder to the approver: "You have 1 hour to review travel request TR-XXXX before escalation"  
**Related:** FR-009, FR-004

---

### TC-NOT-NF-001
**Title:** Email notification is delivered within 2 minutes of trigger  
**Priority:** P1 — High  
**Steps:**
1. Trigger an approval event
2. Measure time from event to email delivery

**Expected Result:** Email delivered within 2 minutes (120 seconds)  
**Related:** NFR — Performance

---

### TC-NOT-KPI-001
**Title:** Helpdesk ticket volume drops to below 100/month  
**Priority:** P1 — High  
**Steps:**
1. After Go-Live, measure helpdesk ticket submissions over a 30-day period
2. Categorize tickets (notification failures, lost receipts, status confusion)

**Expected Result:** Total tickets < 100/month by Day 90; compared against baseline of 500/month  
**Related:** KPI — Helpdesk Ticket Volume

---

## Module 10 — Dashboard & Analytics (FR-010)

### TC-DSH-F-001
**Title:** Employee dashboard shows current request status summary  
**Priority:** P1 — High  
**Precondition:** Employee has 2 submitted, 1 approved, 1 rejected request  
**Steps:**
1. Login as EMPLOYEE
2. View the Employee Dashboard

**Expected Result:** Dashboard shows correct counts: 2 Pending, 1 Approved, 1 Rejected; quick-access links to each status  
**Related:** FR-010

---

### TC-DSH-F-002
**Title:** Finance dashboard displays real-time spend visibility  
**Priority:** P0 — Critical  
**Steps:**
1. Login as FINANCE EXECUTIVE
2. View the Finance Dashboard spend widget

**Expected Result:** Total approved spend, pending claims, and reimbursed amount are shown with department breakdown; data is current within 15 minutes  
**Related:** FR-010, KPI — Travel Spend Visibility

---

### TC-DSH-F-003
**Title:** KPI dashboard shows adoption rate widget  
**Priority:** P1 — High  
**Precondition:** 9,500 out of 10,000 employees have logged in at least once  
**Steps:**
1. Login as ADMIN
2. Navigate to KPI Dashboard

**Expected Result:** System Adoption Rate widget shows 95%; trend graph shows week-over-week growth  
**Related:** FR-010, KPI — System Adoption Rate

---

### TC-DSH-F-004
**Title:** Compliance rate widget reflects real-time policy adherence  
**Priority:** P1 — High  
**Steps:**
1. Process 1,000 expense claims (20 with violations)
2. View KPI Dashboard

**Expected Result:** Policy Compliance Rate widget shows 98%; violation count shows 20  
**Related:** FR-010, KPI — Policy Compliance Rate

---

### TC-DSH-F-005
**Title:** Dashboard data does not lag more than 15 minutes  
**Priority:** P1 — High  
**Steps:**
1. Submit a new expense claim
2. Check the Finance Dashboard spend total immediately, then at T+15 minutes

**Expected Result:** Spend total is updated within 15 minutes of the claim submission  
**Related:** FR-010, KPI — Spend Visibility constraint

---

### TC-DSH-NF-001
**Title:** KPI dashboard page loads within 3 seconds  
**Priority:** P1 — High  
**Steps:**
1. Login as ADMIN
2. Navigate to KPI Dashboard
3. Measure page load time

**Expected Result:** Full dashboard loads within 3 seconds including chart rendering  
**Related:** NFR — Performance

---

### TC-DSH-NF-002
**Title:** Dashboard remains performant with 1,000 concurrent users  
**Priority:** P1 — High  
**Steps:**
1. Simulate 1,000 concurrent users accessing dashboards using k6
2. Measure response times

**Expected Result:** p95 response time ≤ 2 seconds; no timeouts or errors  
**Related:** NFR — Scalability

---

### TC-DSH-KPI-001
**Title:** Travel spend visibility is 100%  
**Priority:** P0 — Critical  
**Steps:**
1. Submit 100 travel expense claims across departments
2. Verify all 100 are reflected in the Finance spend dashboard

**Expected Result:** 100% of submitted spend is visible in the dashboard; no claims are missing  
**Related:** KPI — Travel Spend Visibility

---

### TC-DSH-KPI-002
**Title:** Employee satisfaction score is captured via in-app survey  
**Priority:** P1 — High  
**Steps:**
1. Trigger a reimbursement completion
2. Verify in-app survey prompt appears for the employee

**Expected Result:** Survey is auto-triggered post-reimbursement; response is captured and contributes to the Employee Satisfaction Score widget  
**Related:** KPI — Employee Satisfaction Score

---

### TC-DSH-KPI-003
**Title:** Budget adherence rate is monitored and alerted  
**Priority:** P1 — High  
**Precondition:** Department budget = ₹5,00,000 for the month  
**Steps:**
1. Process claims totaling ₹4,90,000 for the department
2. Submit a new claim for ₹20,000 (exceeds budget)

**Expected Result:** System flags: "Department budget limit reached"; new claim requires HOD/Finance exception approval  
**Related:** KPI — Budget Adherence Rate

---

## Module 11 — Reports (FR-011)

### TC-RPT-F-001
**Title:** Travel spend report by department is generated correctly  
**Priority:** P1 — High  
**Precondition:** 3 months of expense data exists  
**Steps:**
1. Navigate to Reports > Travel Spend by Department
2. Select date range: Last Quarter
3. Click Generate

**Expected Result:** Report shows spend per department with total; data matches the Finance Dashboard figures  
**Related:** FR-011

---

### TC-RPT-F-002
**Title:** Policy violations report lists all flagged claims  
**Priority:** P1 — High  
**Steps:**
1. Navigate to Reports > Policy Violations
2. Filter by current month
3. Generate report

**Expected Result:** Report lists all claims with violations: employee name, claim ID, category, amount, policy breached  
**Related:** FR-011, FR-007

---

### TC-RPT-F-003
**Title:** Reimbursement aging report shows overdue payments  
**Priority:** P1 — High  
**Precondition:** 10 claims are pending reimbursement for > 3 days  
**Steps:**
1. Generate Reimbursement Aging Report

**Expected Result:** All 10 overdue claims are listed with days-since-approval highlighted in red; Finance team can take action  
**Related:** FR-011

---

### TC-RPT-F-004
**Title:** Report export to CSV/PDF works correctly  
**Priority:** P2 — Medium  
**Steps:**
1. Generate any report
2. Click "Export" > Select CSV
3. Download and open the file

**Expected Result:** File downloads successfully; data matches the on-screen report; all columns are correctly mapped  
**Related:** FR-011

---

### TC-RPT-NF-001
**Title:** Report generation completes within 10 seconds for 10,000 records  
**Priority:** P1 — High  
**Steps:**
1. Generate a Travel Spend Report with 10,000 expense records

**Expected Result:** Report renders within 10 seconds; no timeout error  
**Related:** NFR — Performance

---

## Module 12 — Audit Logs (FR-012)

### TC-AUD-F-001
**Title:** All approval actions are recorded in the audit log  
**Priority:** P0 — Critical  
**Steps:**
1. Manager approves a travel request
2. Finance rejects an expense claim
3. Navigate to Audit Logs > Search by request/claim ID

**Expected Result:** Both actions appear in the log with: user name, role, action, timestamp, and IP address  
**Related:** FR-012, US-004

---

### TC-AUD-F-002
**Title:** Audit log cannot be modified or deleted  
**Priority:** P0 — Critical  
**Precondition:** Logged in as ADMIN  
**Steps:**
1. Navigate to Audit Logs
2. Attempt to delete or edit any log entry via the UI
3. Attempt to delete via direct API call

**Expected Result:** No delete or edit option is available in the UI; API returns 403 Forbidden for any write operation on audit logs  
**Related:** FR-012

---

### TC-AUD-F-003
**Title:** Auditor can search audit logs by date range and user  
**Priority:** P1 — High  
**Precondition:** Logged in as AUDITOR  
**Steps:**
1. Navigate to Audit Log Viewer
2. Filter: User = "john.doe@company.com", Date = Last 30 days
3. Click Search

**Expected Result:** All actions performed by John Doe in the last 30 days are returned with correct timestamps  
**Related:** FR-012

---

### TC-AUD-F-004
**Title:** Audit log captures login and logout events  
**Priority:** P1 — High  
**Steps:**
1. Login as EMPLOYEE
2. Perform 2 actions
3. Logout
4. Auditor searches for the user's session

**Expected Result:** Login event, 2 action events, and logout event are all recorded with timestamps  
**Related:** FR-012

---

### TC-AUD-F-005
**Title:** Audit logs can be exported by the Auditor  
**Priority:** P1 — High  
**Steps:**
1. Login as AUDITOR
2. Filter logs for a specific period
3. Click Export > CSV

**Expected Result:** Exported file contains all log entries in the filtered range with all fields intact  
**Related:** FR-012

---

### TC-AUD-NF-001
**Title:** Audit log search returns results within 3 seconds for 1 million records  
**Priority:** P1 — High  
**Steps:**
1. Seed 1 million audit log entries
2. Search with a date range filter spanning 30 days

**Expected Result:** Search results returned within 3 seconds; pagination is applied  
**Related:** NFR — Performance, Scalability

---

### TC-AUD-KPI-001
**Title:** Audit findings are reduced by 80% post Go-Live  
**Priority:** P1 — High  
**Steps:**
1. Conduct a quarterly audit post-launch
2. Count audit findings (missing docs, untracked approvals, incomplete records)
3. Compare against pre-system baseline

**Expected Result:** Audit findings ≤ 20% of baseline count; attributed to immutable logs and digital receipt capture  
**Related:** KPI — Audit Finding Reduction

---

## Appendix A — Test Priority Legend

| Priority | Label | Description |
|----------|-------|-------------|
| P0 | Critical | System cannot go live without passing; blocks release |
| P1 | High | Must pass for UAT sign-off; no workaround acceptable |
| P2 | Medium | Should pass before Go-Live; minor workaround acceptable |
| P3 | Low | Nice-to-have; can be deferred to a patch release |

---

## Appendix B — Test Environment Requirements

| Environment | Purpose | Data Requirement |
|------------|---------|-----------------|
| Dev | Developer unit + integration testing | Synthetic seed data |
| UAT | Business acceptance testing with pilot users | Anonymized prod-like data (200 users) |
| Load Test | Performance & scalability validation | 10,000 synthetic users, 1M records |
| Production | Smoke tests post-deployment | Live data (read-only smoke) |

---

## Appendix C — KPI Test Validation Schedule

| KPI | Test Method | Measurement Point |
|-----|------------|------------------|
| Adoption Rate | User login analytics | Day 30, Day 60, Day 90 post-launch |
| Processing Time | Timestamped workflow logs | Weekly after Go-Live |
| Compliance Rate | Policy engine audit report | Monthly |
| Reimbursement Turnaround | Claim lifecycle timestamps | Weekly |
| Satisfaction Score | In-app survey responses | Monthly |
| Duplicate Claim Rate | Policy engine duplicate log | Monthly |
| Audit Finding Reduction | External audit comparison | Quarterly |

---

*This test case document covers all 12 functional requirements from the PRD and all KPI validation scenarios from the KPI document. All test cases must be executed in the UAT environment with pilot users before the Gate 4 sign-off.*
