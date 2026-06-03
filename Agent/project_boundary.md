# 🗂️ Project Boundary Document
## Enterprise Employee Travel & Expense Management System (ETEMS)
**Version**: 2.6.26  
**Document Type**: Project Boundary & Directory Structure  
**Source Documents**: PRD_ETEMS.md · kpi.md · project_scope.md  
**Date**: 2026-06-03

---

## 1. Project Summary

### 1.1 What We Are Building
The **Enterprise Employee Travel & Expense Management System (ETEMS)** is a full-stack, cloud-ready enterprise platform that digitizes and automates the complete travel and expense lifecycle for a **10,000+ employee organization** operating across multiple locations.

The system eliminates manual workflows — emails, Excel sheets, paper-based approvals, and phone-based coordination — and replaces them with a unified, policy-enforced, auditable digital platform.

### 1.2 Core Problem Solved
| Before (Manual) | After (ETEMS) |
|-----------------|----------------|
| Travel requests via email | Self-service digital submission with auto-entitlements |
| Excel-based expense tracking | Itemized claims with OCR receipt parsing |
| Approval via email chains | Configurable multi-level workflow engine with SLA enforcement |
| Manual reimbursement tracking | Real-time status tracking + ERP/payroll export |
| No policy enforcement | Inline violation detection, exception routing, grade-based entitlements |
| Finance reporting from spreadsheets | Live dashboards, scheduled reports, budget vs actuals |

### 1.3 System Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│                        ETEMS Platform                           │
│                                                                 │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────────────┐  │
│  │  Web App    │   │ Mobile App  │   │    Admin Portal     │  │
│  │ (React/TS)  │   │(React Native│   │   (HR / Finance)    │  │
│  └──────┬──────┘   └──────┬──────┘   └──────────┬──────────┘  │
│         └─────────────────┴──────────────────────┘             │
│                            │  REST API (OpenAPI v1/v2)          │
│                    ┌───────▼────────┐                           │
│                    │  Spring Boot   │                           │
│                    │  API Gateway   │                           │
│                    └───────┬────────┘                           │
│         ┌──────────────────┼──────────────────┐                │
│         ▼                  ▼                  ▼                 │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐        │
│  │  PostgreSQL │  │    Redis     │  │  AWS S3 / Blob  │        │
│  │  (Primary)  │  │  (Cache/SLA) │  │  (Files/OCR)    │        │
│  └─────────────┘  └──────────────┘  └─────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
         │                  │                   │
   ┌─────▼──────┐   ┌───────▼───────┐   ┌──────▼───────┐
   │   HRMS     │   │  ERP/Payroll  │   │  GDS / Forex │
   │  (Sync)    │   │  SAP/Oracle   │   │  Twilio/FCM  │
   └────────────┘   └───────────────┘   └──────────────┘
```

### 1.4 Actors & Roles
| Role | Primary Responsibilities |
|------|------------------------|
| **Employee** | Submit travel requests, expense claims, view status |
| **Line Manager** | First-level approval of travel requests and claims |
| **Department Head** | Second-level approval, budget visibility |
| **Finance Analyst** | Final finance review, reimbursement processing, ERP export |
| **HR Admin** | Policy configuration, workflow setup, user management |
| **Travel Desk** | Booking management, vendor coordination, GDS interaction |
| **Auditor** | Read-only audit trail access, compliance reporting |
| **Super Admin** | System-level configuration, role management |

### 1.5 Key Metrics & Scale
| Parameter | Target |
|-----------|--------|
| Users | 10,000+ employees |
| Concurrent Sessions | 10,000+ |
| API Response Time (P95) | < 500 ms |
| System Uptime | 99.9% SLA |
| Unit Test Coverage | ≥ 80% |
| Mobile Platforms | iOS 14+, Android 10+ |
| Web Accessibility | WCAG 2.1 AA |

---

## 2. Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Web** | React.js 18+, TypeScript, Tailwind CSS, Recharts/Chart.js, Lucide Icons, React Query |
| **Mobile** | React Native (iOS 14+, Android 10+) |
| **Backend** | Java 17+, Spring Boot 3.x, Spring Security, Spring State Machine / Camunda BPM |
| **Database** | PostgreSQL 15+ (primary), Redis 7+ (cache, sessions, rate limiting) |
| **ORM & Migrations** | Hibernate JPA, Flyway |
| **Authentication** | SAML 2.0 / OAuth 2.0 SSO, JWT (RS256), BCrypt |
| **File Storage** | AWS S3 / Azure Blob Storage (AES-256 at rest, signed URLs) |
| **OCR** | AWS Textract (primary), Tesseract (fallback) |
| **Notifications** | SendGrid (email), Twilio (SMS/WhatsApp), Firebase FCM (push) |
| **Search/Logging** | Elasticsearch, Logstash, Kibana (ELK Stack) |
| **Monitoring** | Prometheus, Grafana |
| **Containerization** | Docker, Docker Compose, Kubernetes (Helm Charts) |
| **CI/CD** | GitHub Actions / Jenkins |
| **Secrets** | HashiCorp Vault / AWS Secrets Manager |
| **Testing** | JUnit 5, Mockito, React Testing Library, Cypress, JMeter |
| **API Docs** | OpenAPI 3.0 / Swagger UI |

---

## 3. Full Directory / Folder Structure

```
etems/                                          ← Project root
│
├── 📁 backend/                                 ← Java Spring Boot application
│   ├── 📄 pom.xml                              ← Maven build file
│   ├── 📄 Dockerfile                           ← Backend container image
│   ├── 📄 .env.example                         ← Environment variable template
│   │
│   └── 📁 src/
│       ├── 📁 main/
│       │   ├── 📁 java/com/etems/
│       │   │   │
│       │   │   ├── 📁 config/                  ← Application configuration
│       │   │   │   ├── SecurityConfig.java      ← JWT, CORS, RBAC security config
│       │   │   │   ├── SsoConfig.java           ← SAML 2.0 / OAuth2 config
│       │   │   │   ├── RedisConfig.java         ← Redis cache & session config
│       │   │   │   ├── SwaggerConfig.java       ← OpenAPI / Swagger config
│       │   │   │   ├── FlywayConfig.java        ← DB migration config
│       │   │   │   └── AppProperties.java       ← Typed env properties
│       │   │   │
│       │   │   ├── 📁 auth/                    ← Authentication & session (KPI 1)
│       │   │   │   ├── controller/
│       │   │   │   │   └── AuthController.java
│       │   │   │   ├── service/
│       │   │   │   │   ├── AuthService.java
│       │   │   │   │   ├── JwtService.java
│       │   │   │   │   └── SsoService.java
│       │   │   │   ├── model/
│       │   │   │   │   ├── User.java
│       │   │   │   │   ├── Role.java
│       │   │   │   │   └── Session.java
│       │   │   │   ├── repository/
│       │   │   │   │   └── UserRepository.java
│       │   │   │   └── dto/
│       │   │   │       ├── LoginRequest.java
│       │   │   │       └── AuthResponse.java
│       │   │   │
│       │   │   ├── 📁 user/                    ← User & profile management (KPI 1)
│       │   │   │   ├── controller/
│       │   │   │   │   └── UserController.java
│       │   │   │   ├── service/
│       │   │   │   │   ├── UserService.java
│       │   │   │   │   ├── DelegationService.java
│       │   │   │   │   └── HrmsSyncService.java
│       │   │   │   ├── model/
│       │   │   │   │   ├── UserProfile.java
│       │   │   │   │   └── Delegation.java
│       │   │   │   ├── repository/
│       │   │   │   │   ├── UserProfileRepository.java
│       │   │   │   │   └── DelegationRepository.java
│       │   │   │   └── dto/
│       │   │   │       └── UserProfileDto.java
│       │   │   │
│       │   │   ├── 📁 travel/                  ← Travel request module (KPI 2)
│       │   │   │   ├── controller/
│       │   │   │   │   └── TravelRequestController.java
│       │   │   │   ├── service/
│       │   │   │   │   ├── TravelRequestService.java
│       │   │   │   │   ├── ItineraryService.java
│       │   │   │   │   ├── AdvanceRequestService.java
│       │   │   │   │   └── BlackoutPeriodService.java
│       │   │   │   ├── model/
│       │   │   │   │   ├── TravelRequest.java
│       │   │   │   │   ├── TravelItinerary.java
│       │   │   │   │   ├── AdvanceRequest.java
│       │   │   │   │   └── TravelStatus.java   ← Enum: state machine states
│       │   │   │   ├── repository/
│       │   │   │   │   ├── TravelRequestRepository.java
│       │   │   │   │   └── AdvanceRequestRepository.java
│       │   │   │   └── dto/
│       │   │   │       ├── TravelRequestDto.java
│       │   │   │       └── AdvanceRequestDto.java
│       │   │   │
│       │   │   ├── 📁 approval/                ← Approval workflow engine (KPI 3)
│       │   │   │   ├── controller/
│       │   │   │   │   └── ApprovalController.java
│       │   │   │   ├── service/
│       │   │   │   │   ├── ApprovalWorkflowService.java
│       │   │   │   │   ├── EscalationService.java
│       │   │   │   │   ├── BulkApprovalService.java
│       │   │   │   │   └── AuditTrailService.java
│       │   │   │   ├── engine/
│       │   │   │   │   ├── WorkflowEngine.java  ← Spring State Machine / Camunda
│       │   │   │   │   ├── ApprovalChainResolver.java
│       │   │   │   │   └── SlaScheduler.java
│       │   │   │   ├── model/
│       │   │   │   │   ├── ApprovalChain.java
│       │   │   │   │   ├── ApprovalAction.java
│       │   │   │   │   └── AuditLog.java
│       │   │   │   ├── repository/
│       │   │   │   │   ├── ApprovalChainRepository.java
│       │   │   │   │   └── AuditLogRepository.java
│       │   │   │   └── dto/
│       │   │   │       └── ApprovalActionDto.java
│       │   │   │
│       │   │   ├── 📁 expense/                 ← Expense claim management (KPI 4)
│       │   │   │   ├── controller/
│       │   │   │   │   └── ExpenseClaimController.java
│       │   │   │   ├── service/
│       │   │   │   │   ├── ExpenseClaimService.java
│       │   │   │   │   ├── OcrService.java       ← AWS Textract integration
│       │   │   │   │   ├── CurrencyConversionService.java
│       │   │   │   │   ├── PerDiemService.java
│       │   │   │   │   └── DuplicateDetectionService.java
│       │   │   │   ├── model/
│       │   │   │   │   ├── ExpenseClaim.java
│       │   │   │   │   ├── ExpenseLineItem.java
│       │   │   │   │   └── ExpenseCategory.java  ← Enum
│       │   │   │   ├── repository/
│       │   │   │   │   ├── ExpenseClaimRepository.java
│       │   │   │   │   └── ExpenseLineItemRepository.java
│       │   │   │   └── dto/
│       │   │   │       ├── ExpenseClaimDto.java
│       │   │   │       └── ExpenseLineItemDto.java
│       │   │   │
│       │   │   ├── 📁 policy/                  ← Policy & compliance engine (KPI 5)
│       │   │   │   ├── controller/
│       │   │   │   │   └── PolicyController.java
│       │   │   │   ├── service/
│       │   │   │   │   ├── PolicyService.java
│       │   │   │   │   ├── ViolationDetectionService.java
│       │   │   │   │   ├── EntitlementService.java
│       │   │   │   │   └── PolicyVersionService.java
│       │   │   │   ├── model/
│       │   │   │   │   ├── TravelPolicy.java
│       │   │   │   │   ├── PolicyVersion.java
│       │   │   │   │   ├── BlackoutPeriod.java
│       │   │   │   │   └── VendorList.java
│       │   │   │   ├── repository/
│       │   │   │   │   └── PolicyRepository.java
│       │   │   │   └── dto/
│       │   │   │       └── PolicyConfigDto.java
│       │   │   │
│       │   │   ├── 📁 finance/                 ← Finance & reimbursement (KPI 6)
│       │   │   │   ├── controller/
│       │   │   │   │   └── FinanceController.java
│       │   │   │   ├── service/
│       │   │   │   │   ├── ReimbursementService.java
│       │   │   │   │   ├── AdvanceSettlementService.java
│       │   │   │   │   ├── ErpExportService.java
│       │   │   │   │   ├── TaxHandlingService.java
│       │   │   │   │   └── HoldWorkflowService.java
│       │   │   │   ├── model/
│       │   │   │   │   ├── Reimbursement.java
│       │   │   │   │   └── ErpExportRecord.java
│       │   │   │   ├── repository/
│       │   │   │   │   └── ReimbursementRepository.java
│       │   │   │   └── dto/
│       │   │   │       └── ReimbursementDto.java
│       │   │   │
│       │   │   ├── 📁 booking/                 ← Booking & vendor management (KPI 7)
│       │   │   │   ├── controller/
│       │   │   │   │   └── BookingController.java
│       │   │   │   ├── service/
│       │   │   │   │   ├── TravelDeskService.java
│       │   │   │   │   ├── GdsIntegrationService.java   ← Amadeus/Sabre read-only
│       │   │   │   │   ├── CorporateCardService.java
│       │   │   │   │   └── VisaTrackingService.java
│       │   │   │   ├── model/
│       │   │   │   │   ├── Booking.java
│       │   │   │   │   └── VisaApplication.java
│       │   │   │   ├── repository/
│       │   │   │   │   └── BookingRepository.java
│       │   │   │   └── dto/
│       │   │   │       └── BookingDto.java
│       │   │   │
│       │   │   ├── 📁 notification/            ← Notification service (KPI 8)
│       │   │   │   ├── controller/
│       │   │   │   │   └── NotificationController.java
│       │   │   │   ├── service/
│       │   │   │   │   ├── NotificationService.java
│       │   │   │   │   ├── EmailService.java        ← SendGrid
│       │   │   │   │   ├── SmsService.java          ← Twilio
│       │   │   │   │   ├── PushNotificationService.java  ← Firebase FCM
│       │   │   │   │   └── TemplateService.java
│       │   │   │   ├── model/
│       │   │   │   │   ├── NotificationTemplate.java
│       │   │   │   │   └── NotificationLog.java
│       │   │   │   ├── repository/
│       │   │   │   │   └── NotificationTemplateRepository.java
│       │   │   │   └── scheduler/
│       │   │   │       └── ReminderScheduler.java   ← Post-travel + SLA reminders
│       │   │   │
│       │   │   ├── 📁 reporting/               ← Reporting & analytics (KPI 9)
│       │   │   │   ├── controller/
│       │   │   │   │   └── ReportingController.java
│       │   │   │   ├── service/
│       │   │   │   │   ├── DashboardService.java
│       │   │   │   │   ├── SpendReportService.java
│       │   │   │   │   ├── PolicyViolationReportService.java
│       │   │   │   │   ├── AuditReportService.java
│       │   │   │   │   └── ReportExportService.java  ← Excel, PDF, CSV
│       │   │   │   └── dto/
│       │   │   │       ├── DashboardDto.java
│       │   │   │       └── SpendReportDto.java
│       │   │   │
│       │   │   ├── 📁 budget/                  ← Budget management (KPI 10)
│       │   │   │   ├── controller/
│       │   │   │   │   └── BudgetController.java
│       │   │   │   ├── service/
│       │   │   │   │   ├── BudgetService.java
│       │   │   │   │   ├── BudgetAlertService.java
│       │   │   │   │   └── BudgetRevisionService.java
│       │   │   │   ├── model/
│       │   │   │   │   ├── Budget.java
│       │   │   │   │   └── BudgetRevision.java
│       │   │   │   ├── repository/
│       │   │   │   │   └── BudgetRepository.java
│       │   │   │   └── dto/
│       │   │   │       └── BudgetDto.java
│       │   │   │
│       │   │   ├── 📁 integration/             ← External system integrations (KPI 14)
│       │   │   │   ├── hrms/
│       │   │   │   │   ├── HrmsApiClient.java
│       │   │   │   │   └── HrmsSyncJob.java      ← Scheduled daily sync
│       │   │   │   ├── erp/
│       │   │   │   │   └── ErpApiClient.java
│       │   │   │   ├── gds/
│       │   │   │   │   └── GdsApiClient.java     ← Amadeus/Sabre read
│       │   │   │   ├── forex/
│       │   │   │   │   └── ForexApiClient.java   ← Daily exchange rates
│       │   │   │   └── webhook/
│       │   │   │       └── WebhookDispatcher.java
│       │   │   │
│       │   │   ├── 📁 storage/                 ← File handling (S3/Blob)
│       │   │   │   ├── StorageService.java
│       │   │   │   └── VirusScanService.java
│       │   │   │
│       │   │   ├── 📁 exception/               ← Global error handling
│       │   │   │   ├── GlobalExceptionHandler.java
│       │   │   │   ├── ErrorResponse.java
│       │   │   │   └── EtemsException.java
│       │   │   │
│       │   │   └── 📄 EtemsApplication.java    ← Spring Boot entry point
│       │   │
│       │   └── 📁 resources/
│       │       ├── 📄 application.yml           ← Main config (env vars)
│       │       ├── 📄 application-dev.yml
│       │       ├── 📄 application-prod.yml
│       │       └── 📁 db/migration/             ← Flyway SQL migrations
│       │           ├── V1__init_schema.sql
│       │           ├── V2__user_roles.sql
│       │           ├── V3__travel_request.sql
│       │           ├── V4__expense_claim.sql
│       │           ├── V5__approval_workflow.sql
│       │           ├── V6__policy_engine.sql
│       │           ├── V7__budget.sql
│       │           └── V8__notifications.sql
│       │
│       └── 📁 test/
│           └── 📁 java/com/etems/
│               ├── 📁 auth/
│               │   └── AuthServiceTest.java
│               ├── 📁 travel/
│               │   └── TravelRequestServiceTest.java
│               ├── 📁 approval/
│               │   └── ApprovalWorkflowServiceTest.java
│               ├── 📁 expense/
│               │   └── ExpenseClaimServiceTest.java
│               ├── 📁 policy/
│               │   └── PolicyServiceTest.java
│               ├── 📁 finance/
│               │   └── ReimbursementServiceTest.java
│               ├── 📁 integration/
│               │   └── TravelRequestIntegrationTest.java
│               └── 📁 performance/
│                   └── LoadTest.jmx              ← JMeter test plan
│
├── 📁 frontend/                                  ← React + TypeScript web app
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   ├── 📄 tailwind.config.ts
│   ├── 📄 vite.config.ts
│   ├── 📄 Dockerfile                             ← Frontend container image
│   ├── 📄 .env.example
│   │
│   ├── 📁 public/
│   │   ├── favicon.ico
│   │   └── manifest.json
│   │
│   └── 📁 src/
│       ├── 📄 main.tsx                           ← React entry point
│       ├── 📄 App.tsx                            ← Root component + routing
│       │
│       ├── 📁 assets/                            ← Images, fonts, icons
│       │
│       ├── 📁 styles/
│       │   └── index.css                         ← Tailwind base + custom vars
│       │
│       ├── 📁 config/
│       │   ├── api.ts                            ← Axios base config
│       │   └── routes.ts                         ← Route constants
│       │
│       ├── 📁 types/                             ← Shared TypeScript types
│       │   ├── auth.types.ts
│       │   ├── travel.types.ts
│       │   ├── expense.types.ts
│       │   ├── approval.types.ts
│       │   ├── finance.types.ts
│       │   └── reporting.types.ts
│       │
│       ├── 📁 hooks/                             ← Custom React hooks
│       │   ├── useAuth.ts
│       │   ├── useTravelRequest.ts
│       │   ├── useExpenseClaim.ts
│       │   ├── useApproval.ts
│       │   └── useNotifications.ts
│       │
│       ├── 📁 context/                           ← React Context providers
│       │   ├── AuthContext.tsx
│       │   └── ThemeContext.tsx
│       │
│       ├── 📁 services/                          ← API call functions (React Query)
│       │   ├── auth.service.ts
│       │   ├── travel.service.ts
│       │   ├── expense.service.ts
│       │   ├── approval.service.ts
│       │   ├── finance.service.ts
│       │   ├── notification.service.ts
│       │   ├── reporting.service.ts
│       │   └── budget.service.ts
│       │
│       ├── 📁 components/                        ← Shared/reusable components
│       │   ├── 📁 ui/
│       │   │   ├── Button.tsx
│       │   │   ├── Input.tsx
│       │   │   ├── Modal.tsx
│       │   │   ├── Table.tsx
│       │   │   ├── Badge.tsx
│       │   │   ├── StatusTimeline.tsx
│       │   │   ├── FileUpload.tsx
│       │   │   ├── NotificationBell.tsx
│       │   │   └── ThemeToggle.tsx
│       │   ├── 📁 charts/
│       │   │   ├── SpendGauge.tsx
│       │   │   ├── TrendSparkline.tsx
│       │   │   ├── DepartmentBarChart.tsx
│       │   │   └── BudgetUtilization.tsx
│       │   └── 📁 layout/
│       │       ├── AppShell.tsx
│       │       ├── Sidebar.tsx
│       │       ├── TopNav.tsx
│       │       └── MobileTabBar.tsx
│       │
│       └── 📁 pages/                             ← Role-aware page views
│           ├── 📁 auth/
│           │   ├── LoginPage.tsx
│           │   └── PasswordResetPage.tsx
│           ├── 📁 dashboard/
│           │   ├── EmployeeDashboard.tsx
│           │   ├── ManagerDashboard.tsx
│           │   ├── FinanceDashboard.tsx
│           │   └── ExecutiveDashboard.tsx
│           ├── 📁 travel/
│           │   ├── TravelRequestForm.tsx
│           │   ├── TravelRequestList.tsx
│           │   └── TravelRequestDetail.tsx
│           ├── 📁 expense/
│           │   ├── ExpenseClaimForm.tsx
│           │   ├── ExpenseClaimList.tsx
│           │   └── ExpenseClaimDetail.tsx
│           ├── 📁 approval/
│           │   ├── ApprovalQueue.tsx
│           │   ├── BulkApprovalPage.tsx
│           │   └── AuditTrailPage.tsx
│           ├── 📁 finance/
│           │   ├── FinanceReviewQueue.tsx
│           │   └── ReimbursementTracker.tsx
│           ├── 📁 booking/
│           │   └── TravelDeskPortal.tsx
│           ├── 📁 reporting/
│           │   ├── SpendReportPage.tsx
│           │   ├── PolicyViolationReport.tsx
│           │   └── BudgetVsActuals.tsx
│           ├── 📁 budget/
│           │   └── BudgetManagementPage.tsx
│           └── 📁 admin/
│               ├── PolicyConfigPage.tsx
│               ├── WorkflowConfigPage.tsx
│               ├── NotificationTemplatePage.tsx
│               └── UserManagementPage.tsx
│
├── 📁 mobile/                                    ← React Native mobile app
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   ├── 📄 app.json                               ← Expo / RN config
│   │
│   └── 📁 src/
│       ├── 📁 screens/
│       │   ├── LoginScreen.tsx
│       │   ├── TravelRequestScreen.tsx
│       │   ├── ExpenseClaimScreen.tsx            ← Camera + OCR receipt
│       │   ├── ApprovalScreen.tsx
│       │   └── NotificationScreen.tsx
│       ├── 📁 components/
│       │   ├── CameraCapture.tsx
│       │   ├── BiometricAuth.tsx
│       │   └── OfflineBanner.tsx
│       ├── 📁 services/
│       │   ├── offlineSync.ts                    ← Local storage + sync queue
│       │   └── pushNotification.ts               ← FCM integration
│       └── 📁 navigation/
│           └── AppNavigator.tsx
│
├── 📁 infrastructure/                            ← DevOps & deployment (KPI 15)
│   ├── 📁 docker/
│   │   ├── 📄 docker-compose.yml                 ← Local + staging multi-container
│   │   ├── 📄 docker-compose.prod.yml
│   │   └── 📁 nginx/
│   │       └── nginx.conf                        ← Reverse proxy config
│   │
│   ├── 📁 kubernetes/
│   │   ├── 📁 helm/
│   │   │   └── 📁 etems/
│   │   │       ├── Chart.yaml
│   │   │       ├── values.yaml
│   │   │       ├── values-prod.yaml
│   │   │       └── 📁 templates/
│   │   │           ├── backend-deployment.yaml
│   │   │           ├── frontend-deployment.yaml
│   │   │           ├── postgres-statefulset.yaml
│   │   │           ├── redis-deployment.yaml
│   │   │           ├── ingress.yaml
│   │   │           └── hpa.yaml                  ← Horizontal Pod Autoscaler
│   │   └── 📁 manifests/
│   │       └── secrets.yaml.template
│   │
│   ├── 📁 monitoring/
│   │   ├── prometheus.yml
│   │   ├── grafana-dashboard.json
│   │   └── elk/
│   │       ├── logstash.conf
│   │       └── kibana-dashboard.json
│   │
│   └── 📁 scripts/
│       ├── deploy.sh
│       ├── rollback.sh
│       └── db-backup.sh
│
├── 📁 .github/                                   ← CI/CD pipeline (KPI 15)
│   └── 📁 workflows/
│       ├── ci.yml                                ← Build, test, lint
│       ├── cd-staging.yml                        ← Deploy to staging
│       └── cd-production.yml                     ← Deploy to production
│
├── 📁 docs/                                      ← Documentation (KPI 16)
│   ├── 📄 openapi.yaml                           ← OpenAPI 3.0 spec
│   ├── 📄 user-guide.md                          ← Employee / Manager / Finance guide
│   ├── 📄 admin-guide.md                         ← HR Admin + system config guide
│   ├── 📄 architecture.md                        ← System architecture overview
│   ├── 📄 api-changelog.md                       ← API version history
│   └── 📁 diagrams/
│       ├── system-context.png
│       ├── approval-workflow.png
│       └── er-diagram.png
│
├── 📁 Agent/                                     ← Agent reference documents
│   ├── 📄 project_scope.md                       ← KPI constraints, FR/NFR, stopping points
│   └── 📄 project_boundary.md                    ← THIS FILE — summary + folder structure
│
├── 📁 prd-kpi-2.6.26/                            ← Source requirement documents
│   ├── 📄 PRD_ETEMS.md
│   └── 📄 kpi.md
│
├── 📄 .gitignore
├── 📄 README.md
└── 📄 LICENSE
```

---

## 4. Module-to-KPI Mapping

| Module / Folder | KPI(s) Covered |
|-----------------|----------------|
| `backend/auth/` | KPI 1 – User Management & Access Control |
| `backend/user/` | KPI 1 – Profile, Delegation, HRMS Sync |
| `backend/travel/` | KPI 2 – Travel Request Management |
| `backend/approval/` | KPI 3 – Approval Workflow Engine |
| `backend/expense/` | KPI 4 – Expense Claim Management |
| `backend/policy/` | KPI 5 – Policy & Compliance Engine |
| `backend/finance/` | KPI 6 – Reimbursement & Finance Processing |
| `backend/booking/` | KPI 7 – Booking & Vendor Management |
| `backend/notification/` | KPI 8 – Notifications & Communication |
| `backend/reporting/` | KPI 9 – Reporting & Analytics |
| `backend/budget/` | KPI 10 – Budget Management |
| `mobile/` | KPI 11 – Mobile Application |
| `frontend/` (responsive) | KPI 12 – Responsive Web Design |
| `backend/config/SecurityConfig` | KPI 13 – Security & Compliance |
| `backend/integration/` | KPI 14 – Integration & Interoperability |
| `infrastructure/` + `.github/` | KPI 15 – Docker & Deployment |
| `test/` + `docs/` | KPI 16 – Testing & Documentation |

---

## 5. Database Schema Boundaries

### Core Entities
```
users                   ← All system users, roles, grades
user_profiles           ← Extended profile (bank, dept, cost center)
delegations             ← Approval delegations per user
travel_requests         ← Parent travel request entity
travel_itineraries      ← Per-leg itinerary entries
advance_requests        ← Cash advance linked to travel request
expense_claims          ← Expense claim header per travel request
expense_line_items      ← Itemized expenses with OCR data
receipts                ← Receipt file metadata (S3 keys)
approval_chains         ← Configured workflow chain definitions
approval_actions        ← Per-action log (approve/reject/return)
audit_logs              ← Immutable system-wide audit trail
travel_policies         ← Policy config by grade/category/destination
policy_versions         ← Historical policy snapshots with effective dates
blackout_periods        ← Restricted travel date ranges
vendor_list             ← Approved vendor registry
bookings                ← Flight/hotel/cab booking records
visa_applications       ← Visa tracking per travel request
reimbursements          ← Finance processing records
erp_export_records      ← ERP/payroll export payloads and status
budgets                 ← Annual budget allocations
budget_revisions        ← Mid-year revision requests
notification_templates  ← Configurable message templates
notification_logs       ← Sent notification records
```

---

## 6. Integration Boundary Map

```
ETEMS Backend
     │
     ├──► HRMS System           (Scheduled API sync — 24hr cadence)
     │        Syncs: employees, org hierarchy, grade, cost center, manager
     │
     ├──► ERP / Payroll         (Nightly batch + real-time API)
     │        Pushes: approved reimbursements, GL code, cost center, tax meta
     │        Supports: SAP, Oracle, Workday
     │
     ├──► Corporate IdP (SSO)   (Per-request JWT validation)
     │        Protocol: SAML 2.0 / OAuth 2.0
     │        Handles: login, session, credential reset
     │
     ├──► GDS (Amadeus/Sabre)   (Phase 1: Read-only PNR fetch)
     │        Used by: Travel Desk portal only
     │
     ├──► AWS Textract           (Per-receipt OCR call)
     │        Extracts: vendor, amount, currency, date, GST
     │        Fallback: Tesseract (local)
     │
     ├──► Forex API             (Daily scheduled fetch)
     │        Provides: daily exchange rates per currency pair
     │        Rate stored per claim line item at time of submission
     │
     ├──► AWS S3 / Azure Blob   (File upload/download)
     │        Stores: receipts, travel documents
     │        Access: signed time-limited URLs only
     │
     ├──► SendGrid              (Transactional email)
     ├──► Twilio                (SMS / WhatsApp alerts)
     └──► Firebase FCM          (Mobile push notifications)
```

---

## 7. Deployment Boundary

```
Local Dev                   Staging                     Production
─────────────               ─────────────               ─────────────
docker-compose.yml          docker-compose.prod.yml     Kubernetes (Helm)
  ├─ frontend               Same stack + env vars       ├─ frontend pods (HPA)
  ├─ backend                Deployed via CI/CD          ├─ backend pods (HPA)
  ├─ postgres               on PR merge to develop      ├─ postgres (StatefulSet)
  ├─ redis                                              ├─ redis
  └─ elasticsearch          Secrets via .env file       └─ elasticsearch
                                                        Secrets via Vault/Secrets Mgr
                                                        Zero-downtime rolling deploy
                                                        Cross-region S3 replication
                                                        Prometheus + Grafana metrics
                                                        ELK centralized logging
```

---

## 8. Phase Boundaries

### Phase 1 (In Scope — Current Build)
- All 16 KPIs as defined in `kpi.md`
- English-only UI
- GDS read-only integration for Travel Desk
- Primary operating geography payroll/ERP only
- New employee data only (no historical migration)

### Phase 2 (Future — Not In Scope)
| Feature | Notes |
|---------|-------|
| Direct GDS booking by employees | Self-service booking without Travel Desk |
| AI/ML recommendations | Travel suggestions, expense anomaly detection |
| Carbon footprint tracking | Per-trip emissions reporting |
| Multi-country payroll | Beyond primary geography |
| Historical data migration | Excel/paper record import |
| Multi-language / i18n | Regional language support |
| Native vendor marketplace | Employee self-service booking portal |
| GDS write operations | Full booking create/modify via Amadeus/Sabre |

---

## 9. Document Index (Agent Reference)

| Document | Location | Purpose |
|----------|----------|---------|
| `PRD_ETEMS.md` | `prd-kpi-2.6.26/` | Full product requirements document |
| `kpi.md` | `prd-kpi-2.6.26/` | 16 KPIs with acceptance criteria |
| `project_scope.md` | `Agent/` | KPI constraints, FR/NFR, stopping points |
| `project_boundary.md` | `Agent/` | Project summary + complete folder structure |
