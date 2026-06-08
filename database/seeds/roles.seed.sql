-- ─────────────────────────────────────────────────────────────────
-- Seed: Roles
-- ─────────────────────────────────────────────────────────────────

INSERT INTO roles (id, name, description) VALUES
  ('11111111-0000-0000-0000-000000000001', 'SYSTEM_ADMIN',       'Full system access and configuration'),
  ('11111111-0000-0000-0000-000000000002', 'EMPLOYEE',           'Submit travel requests and expense claims'),
  ('11111111-0000-0000-0000-000000000003', 'MANAGER',            'Approve team travel requests'),
  ('11111111-0000-0000-0000-000000000004', 'FINANCE_EXECUTIVE',  'Verify claims and initiate reimbursements'),
  ('11111111-0000-0000-0000-000000000005', 'HR_ADMIN',           'Manage employee profiles and org hierarchy'),
  ('11111111-0000-0000-0000-000000000006', 'COMPLIANCE_OFFICER', 'Configure and audit policy rules'),
  ('11111111-0000-0000-0000-000000000007', 'AUDITOR',            'Read-only access to audit trail and reports')
ON CONFLICT (name) DO NOTHING;
