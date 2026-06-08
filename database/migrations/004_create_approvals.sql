-- ─────────────────────────────────────────────────────────────────
-- Migration 004: Approval Workflows & Steps
-- ─────────────────────────────────────────────────────────────────

CREATE TYPE approval_step_status AS ENUM (
  'PENDING', 'APPROVED', 'REJECTED', 'SKIPPED', 'ESCALATED'
);

CREATE TYPE approvals_entity_type AS ENUM (
  'TRAVEL_REQUEST', 'EXPENSE_CLAIM'
);

CREATE TABLE IF NOT EXISTS approval_workflows (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type  approvals_entity_type NOT NULL,
  entity_id    UUID NOT NULL,
  current_step INT DEFAULT 1,
  total_steps  INT NOT NULL,
  is_complete  BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_type, entity_id)
);

CREATE TABLE IF NOT EXISTS approval_steps (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id     UUID NOT NULL REFERENCES approval_workflows(id) ON DELETE CASCADE,
  step_number     INT NOT NULL,
  step_name       VARCHAR(100) NOT NULL,   -- e.g. 'Manager Approval', 'Finance Review'
  approver_id     UUID NOT NULL REFERENCES users(id),
  status          approval_step_status DEFAULT 'PENDING',
  action_at       TIMESTAMPTZ,
  comments        TEXT,
  sla_hours       INT DEFAULT 8,
  due_at          TIMESTAMPTZ,
  escalated_to_id UUID REFERENCES users(id),
  escalated_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workflow_id, step_number)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workflows_entity     ON approval_workflows(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_steps_workflow       ON approval_steps(workflow_id);
CREATE INDEX IF NOT EXISTS idx_steps_approver       ON approval_steps(approver_id);
CREATE INDEX IF NOT EXISTS idx_steps_status         ON approval_steps(status);
CREATE INDEX IF NOT EXISTS idx_steps_due            ON approval_steps(due_at);
