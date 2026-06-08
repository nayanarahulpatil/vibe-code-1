-- ─────────────────────────────────────────────────────────────────
-- Seed: Demo Users (one per role)
-- Password for all: hashed via bcrypt (cost=10)
-- admin@tems.com → Admin@123   | employee@tems.com → Emp@123
-- manager@tems.com → Mgr@123   | finance@tems.com  → Fin@123
-- hr@tems.com → Hr@123         | compliance@tems.com → Comp@123
-- auditor@tems.com → Aud@123
-- ─────────────────────────────────────────────────────────────────

INSERT INTO users (id, employee_id, first_name, last_name, email, password_hash, department, designation, location, is_active) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'EMP-0001', 'System',   'Admin',    'admin@tems.com',       '$2b$10$fitEk66X046/jc8whKypg.U8QtomAl.BUq1AiLjzD8PqHUdTqPbaG', 'IT',         'System Administrator',  'Mumbai',    TRUE),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'EMP-0002', 'Priya',    'Sharma',   'employee@tems.com',    '$2b$10$JEWOA3arXUzazjWDhLhzHO6IgNoj6b5IVz6FKzxtUst70ZX8etcxu', 'Sales',      'Sales Executive',       'Mumbai',    TRUE),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'EMP-0003', 'Rahul',    'Mehta',    'manager@tems.com',     '$2b$10$ZbMr1K1CJPUxlR9qeD4sJekmJs0V0UxHLWR8aYwLi5v6s2iFLUSQC', 'Sales',      'Sales Manager',         'Mumbai',    TRUE),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'EMP-0004', 'Ananya',   'Patel',    'finance@tems.com',     '$2b$10$seWiMnnIzu49RDGcspS.JO4N5V4OjDq.dwCu6nJ.l394iClRwVrbC', 'Finance',    'Finance Executive',     'Delhi',     TRUE),
  ('aaaaaaaa-0000-0000-0000-000000000005', 'EMP-0005', 'Vikram',   'Singh',    'hr@tems.com',          '$2b$10$cTPObCc8aX576kPeX64.NuDH28PkXwq.u9zJ5l3vZz3Oh2a/3admm', 'HR',         'HR Administrator',      'Bangalore', TRUE),
  ('aaaaaaaa-0000-0000-0000-000000000006', 'EMP-0006', 'Sneha',    'Rao',      'compliance@tems.com',  '$2b$10$ZjF7ldOPyk9691zwH74y..Y7siKd.vGWTkwlxb2tXXj3/eyZpjAUu', 'Compliance', 'Compliance Officer',    'Chennai',   TRUE),
  ('aaaaaaaa-0000-0000-0000-000000000007', 'EMP-0007', 'Arjun',    'Nair',     'auditor@tems.com',     '$2b$10$Umoanqg7iKWt9XtBtH6rJeZ5Kf9hWniv06yGi1a56c5NKRg9JeDYq', 'Audit',      'Senior Auditor',        'Hyderabad', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Set manager for employee (Priya reports to Rahul)
UPDATE users SET manager_id = 'aaaaaaaa-0000-0000-0000-000000000003'
  WHERE id = 'aaaaaaaa-0000-0000-0000-000000000002';

-- Assign roles
INSERT INTO user_roles (user_id, role_id) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001'), -- Admin
  ('aaaaaaaa-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000002'), -- Employee
  ('aaaaaaaa-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000003'), -- Manager
  ('aaaaaaaa-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000002'), -- Manager is also Employee
  ('aaaaaaaa-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000004'), -- Finance
  ('aaaaaaaa-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000005'), -- HR Admin
  ('aaaaaaaa-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000006'), -- Compliance
  ('aaaaaaaa-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000007')  -- Auditor
ON CONFLICT (user_id, role_id) DO NOTHING;
