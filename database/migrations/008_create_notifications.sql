-- ─────────────────────────────────────────────────────────────────
-- Migration 008: Notifications
-- ─────────────────────────────────────────────────────────────────

CREATE TYPE notification_type AS ENUM (
  'TRAVEL_REQUEST_SUBMITTED', 'TRAVEL_REQUEST_APPROVED', 'TRAVEL_REQUEST_REJECTED',
  'EXPENSE_CLAIM_SUBMITTED', 'EXPENSE_CLAIM_APPROVED', 'EXPENSE_CLAIM_REJECTED',
  'REIMBURSEMENT_INITIATED', 'REIMBURSEMENT_COMPLETED', 'REIMBURSEMENT_FAILED',
  'APPROVAL_PENDING', 'APPROVAL_SLA_WARNING', 'APPROVAL_ESCALATED',
  'POLICY_VIOLATION', 'SYSTEM_ALERT'
);

CREATE TYPE notification_channel AS ENUM ('IN_APP', 'EMAIL', 'BOTH');

CREATE TABLE IF NOT EXISTS notifications (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type         notification_type NOT NULL,
  channel      notification_channel DEFAULT 'BOTH',
  title        VARCHAR(255) NOT NULL,
  body         TEXT NOT NULL,
  entity_type  VARCHAR(100),
  entity_id    UUID,
  entity_ref   VARCHAR(50),
  is_read      BOOLEAN DEFAULT FALSE,
  read_at      TIMESTAMPTZ,
  email_sent   BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user     ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread   ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created  ON notifications(created_at DESC);
