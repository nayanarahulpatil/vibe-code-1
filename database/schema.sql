-- ═════════════════════════════════════════════════════════════════
-- TEMS Master Schema (Consolidated)
-- Runs all migrations in order
-- ═════════════════════════════════════════════════════════════════

\i /database/migrations/001_create_users.sql
\i /database/migrations/002_create_travel_requests.sql
\i /database/migrations/003_create_expense_claims.sql
\i /database/migrations/004_create_approvals.sql
\i /database/migrations/005_create_reimbursements.sql
\i /database/migrations/006_create_policy_rules.sql
\i /database/migrations/007_create_audit_logs.sql
\i /database/migrations/008_create_notifications.sql
\i /database/migrations/009_create_documents.sql
