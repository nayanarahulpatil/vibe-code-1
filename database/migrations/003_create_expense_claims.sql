-- ─────────────────────────────────────────────────────────────────
-- Migration 003: Expense Claims & Line Items
-- ─────────────────────────────────────────────────────────────────

CREATE TYPE expense_claim_status AS ENUM (
  'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED',
  'PAYMENT_INITIATED', 'REIMBURSED'
);

CREATE TYPE expense_category AS ENUM (
  'FLIGHTS', 'HOTEL', 'MEALS', 'LOCAL_TRANSPORT', 'FUEL',
  'CONFERENCE_FEE', 'VISA', 'INTERNET', 'MISCELLANEOUS'
);

CREATE TABLE IF NOT EXISTS expense_claims (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_number        VARCHAR(20) UNIQUE NOT NULL,
  travel_request_id   UUID NOT NULL REFERENCES travel_requests(id) ON DELETE RESTRICT,
  employee_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_amount        NUMERIC(12, 2) NOT NULL DEFAULT 0,
  approved_amount     NUMERIC(12, 2),
  currency            VARCHAR(3) DEFAULT 'INR',
  status              expense_claim_status DEFAULT 'DRAFT',
  submitted_at        TIMESTAMPTZ,
  approved_at         TIMESTAMPTZ,
  rejected_at         TIMESTAMPTZ,
  rejection_reason    TEXT,
  finance_notes       TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(travel_request_id)  -- one claim per trip
);

CREATE TABLE IF NOT EXISTS expense_line_items (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_claim_id UUID NOT NULL REFERENCES expense_claims(id) ON DELETE CASCADE,
  category         expense_category NOT NULL,
  description      TEXT NOT NULL,
  amount           NUMERIC(12, 2) NOT NULL,
  expense_date     DATE NOT NULL,
  receipt_id       UUID,   -- FK added after documents table
  is_policy_flagged BOOLEAN DEFAULT FALSE,
  flag_reason      TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Auto claim number
CREATE SEQUENCE IF NOT EXISTS expense_claim_seq START 5000;

CREATE OR REPLACE FUNCTION generate_claim_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.claim_number := 'EXP-' || LPAD(nextval('expense_claim_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_claim_number
  BEFORE INSERT ON expense_claims
  FOR EACH ROW EXECUTE FUNCTION generate_claim_number();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_expense_claims_employee       ON expense_claims(employee_id);
CREATE INDEX IF NOT EXISTS idx_expense_claims_travel_request ON expense_claims(travel_request_id);
CREATE INDEX IF NOT EXISTS idx_expense_claims_status         ON expense_claims(status);
CREATE INDEX IF NOT EXISTS idx_line_items_claim              ON expense_line_items(expense_claim_id);
CREATE INDEX IF NOT EXISTS idx_line_items_date               ON expense_line_items(expense_date);
