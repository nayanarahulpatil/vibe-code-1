# Enterprise Travel & Expense Management System (TEMS)

> A fully digital, centralized platform for enterprise travel requests, expense claims, multi-level approvals, policy compliance, reimbursements, and audit management.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js · TypeScript · Vite · Redux Toolkit · React Query |
| Backend | Node.js · NestJS · TypeScript |
| Database | PostgreSQL · Redis |
| Infrastructure | Docker · Docker Compose |
| Styling | CSS3 (Dark Glassmorphism Design System) |

---

## Quick Start (Local Dev)

### Prerequisites
- Node.js 18+
- Docker Desktop
- Git

### 1. Clone & Install
```bash
git clone <repo-url>
cd enterprise-tems
cp .env.example .env
npm install
```

### 2. Start Infrastructure (PostgreSQL + Redis)
```bash
npm run docker:up
```

### 3. Run Database Migrations & Seeds
```bash
npm run db:migrate
npm run db:seed
```

### 4. Start Backend & Frontend
```bash
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **API Docs (Swagger):** http://localhost:3000/api/docs
- **pgAdmin:** http://localhost:5050

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| System Admin | admin@tems.com | Admin@123 |
| Employee | employee@tems.com | Emp@123 |
| Manager | manager@tems.com | Mgr@123 |
| Finance Executive | finance@tems.com | Fin@123 |
| HR Administrator | hr@tems.com | Hr@123 |
| Compliance Officer | compliance@tems.com | Comp@123 |
| Auditor | auditor@tems.com | Aud@123 |

---

## Project Structure

```
enterprise-tems/
├── Agent/          ← Planning documents (PRD, KPI, Scope, Boundary, Test Cases)
├── frontend/       ← React.js Vite application
├── backend/        ← NestJS REST API
├── database/       ← SQL migrations and seed data
├── infrastructure/ ← Docker, Kubernetes, CI/CD
└── docs/           ← Technical documentation
```

---

## Module Overview

| Module | Endpoint Prefix | Description |
|--------|----------------|-------------|
| Auth | `/api/auth` | JWT login, token refresh |
| Users | `/api/users` | Employee profiles, RBAC |
| Travel Requests | `/api/travel-requests` | Request lifecycle |
| Approvals | `/api/approvals` | Workflow engine |
| Expense Claims | `/api/expense-claims` | Claim submission |
| Documents | `/api/documents` | Receipt upload |
| Policy Engine | `/api/policy-rules` | Rule evaluation |
| Reimbursements | `/api/reimbursements` | Payment workflow |
| Notifications | `/api/notifications` | Alerts & emails |
| Reports | `/api/reports` | Operational reports |
| Audit Logs | `/api/audit-logs` | Immutable trail |
| Dashboard | `/api/dashboard` | KPI analytics |

---

## KPI Targets

| KPI | Baseline | Target |
|-----|----------|--------|
| Travel Request Processing | 3 Days | < 8 Hours |
| Reimbursement Turnaround | 15 Days | < 3 Days |
| Policy Compliance Rate | 70% | > 98% |
| System Adoption Rate | 0% | > 95% |
| Employee Satisfaction | 2.5/5 | > 4.5/5 |
