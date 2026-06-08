-- ─────────────────────────────────────────────────────────────────
-- Migration 009: Documents (Receipt Uploads)
-- ─────────────────────────────────────────────────────────────────

CREATE TYPE document_type AS ENUM ('RECEIPT', 'INVOICE', 'BOARDING_PASS', 'VISA', 'OTHER');

CREATE TABLE IF NOT EXISTS documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_name   VARCHAR(500) NOT NULL,
  stored_name     VARCHAR(500) NOT NULL,    -- UUID-based stored filename
  mime_type       VARCHAR(100) NOT NULL,
  size_bytes      BIGINT NOT NULL,
  document_type   document_type DEFAULT 'RECEIPT',
  storage_path    VARCHAR(1000) NOT NULL,   -- local path or S3 key
  uploaded_by     UUID NOT NULL REFERENCES users(id),
  expense_claim_id UUID REFERENCES expense_claims(id) ON DELETE SET NULL,
  line_item_id    UUID REFERENCES expense_line_items(id) ON DELETE SET NULL,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK from expense_line_items to documents (circular dependency resolved here)
ALTER TABLE expense_line_items
  ADD CONSTRAINT fk_line_item_receipt
  FOREIGN KEY (receipt_id) REFERENCES documents(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by  ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_claim        ON documents(expense_claim_id);
CREATE INDEX IF NOT EXISTS idx_documents_line_item    ON documents(line_item_id);
