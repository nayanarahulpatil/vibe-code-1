-- ─────────────────────────────────────────────────────────────────
-- Migration 007: Audit Logs (Immutable)
-- ─────────────────────────────────────────────────────────────────

CREATE TYPE audit_action AS ENUM (
  'LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE',
  'REJECT', 'SUBMIT', 'CANCEL', 'UPLOAD', 'DOWNLOAD',
  'PAYMENT_INITIATE', 'PAYMENT_COMPLETE', 'PAYMENT_FAIL',
  'POLICY_FLAG', 'ESCALATE', 'CONFIG_CHANGE'
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  user_email   VARCHAR(255),              -- snapshot at time of action
  role_name    VARCHAR(50),               -- snapshot
  action       audit_action NOT NULL,
  entity_type  VARCHAR(100),              -- e.g. 'TravelRequest', 'ExpenseClaim'
  entity_id    UUID,
  entity_ref   VARCHAR(50),               -- human-readable ref (TR-001234)
  description  TEXT,
  old_value    JSONB,                     -- before state
  new_value    JSONB,                     -- after state
  ip_address   INET,
  user_agent   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW() -- immutable timestamp
);

-- Make audit_logs append-only: deny UPDATE and DELETE
CREATE OR REPLACE RULE no_update_audit_logs AS
  ON UPDATE TO audit_logs DO INSTEAD NOTHING;

CREATE OR REPLACE RULE no_delete_audit_logs AS
  ON DELETE TO audit_logs DO INSTEAD NOTHING;

-- Indexes for search
CREATE INDEX IF NOT EXISTS idx_audit_logs_user      ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action    ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity    ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created   ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_email ON audit_logs(user_email);
