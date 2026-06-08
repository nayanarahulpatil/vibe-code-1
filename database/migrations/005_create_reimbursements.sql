-- ─────────────────────────────────────────────────────────────────
-- Migration 005: Reimbursements
-- ─────────────────────────────────────────────────────────────────

CREATE TYPE reimbursement_status AS ENUM (
  'QUEUED', 'PAYMENT_INITIATED', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED'
);

CREATE TABLE IF NOT EXISTS reimbursements (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reimbursement_number VARCHAR(20) UNIQUE NOT NULL,
  expense_claim_id    UUID NOT NULL REFERENCES expense_claims(id) ON DELETE RESTRICT,
  employee_id         UUID NOT NULL REFERENCES users(id),
  initiated_by        UUID REFERENCES users(id),
  amount              NUMERIC(12, 2) NOT NULL,
  currency            VARCHAR(3) DEFAULT 'INR',
  status              reimbursement_status DEFAULT 'QUEUED',
  bank_account_number VARCHAR(30),
  bank_ifsc_code      VARCHAR(15),
  bank_reference      VARCHAR(100),      -- from banking API
  payment_date        DATE,
  initiated_at        TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  failed_at           TIMESTAMPTZ,
  failure_reason      TEXT,
  retry_count         INT DEFAULT 0,
  banking_payload     JSONB,             -- raw banking API response
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE SEQUENCE IF NOT EXISTS reimbursement_seq START 9000;

CREATE OR REPLACE FUNCTION generate_reimbursement_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.reimbursement_number := 'RMB-' || LPAD(nextval('reimbursement_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reimbursement_number
  BEFORE INSERT ON reimbursements
  FOR EACH ROW EXECUTE FUNCTION generate_reimbursement_number();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reimbursements_employee ON reimbursements(employee_id);
CREATE INDEX IF NOT EXISTS idx_reimbursements_claim    ON reimbursements(expense_claim_id);
CREATE INDEX IF NOT EXISTS idx_reimbursements_status   ON reimbursements(status);
