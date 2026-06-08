-- ─────────────────────────────────────────────────────────────────
-- Migration 006: Policy Rules
-- ─────────────────────────────────────────────────────────────────

CREATE TYPE policy_rule_type AS ENUM (
  'AMOUNT_LIMIT',         -- max amount per category
  'DAILY_LIMIT',          -- max per day
  'ADVANCE_NOTICE_DAYS',  -- min days before travel
  'RECEIPT_REQUIRED',     -- threshold above which receipt is mandatory
  'DUPLICATE_DETECTION'   -- detect duplicate claims
);

CREATE TYPE policy_rule_scope AS ENUM (
  'ALL', 'DEPARTMENT', 'DESIGNATION', 'TRAVEL_PURPOSE'
);

CREATE TABLE IF NOT EXISTS policy_rules (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         VARCHAR(200) NOT NULL,
  description  TEXT,
  rule_type    policy_rule_type NOT NULL,
  category     VARCHAR(50),              -- expense category this applies to (NULL = all)
  limit_amount NUMERIC(12, 2),
  limit_days   INT,
  scope        policy_rule_scope DEFAULT 'ALL',
  scope_value  VARCHAR(100),             -- e.g. department name
  is_active    BOOLEAN DEFAULT TRUE,
  created_by   UUID REFERENCES users(id),
  updated_by   UUID REFERENCES users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_policy_rules_active   ON policy_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_policy_rules_type     ON policy_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_policy_rules_category ON policy_rules(category);
