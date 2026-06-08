-- ─────────────────────────────────────────────────────────────────
-- Migration 002: Travel Requests
-- ─────────────────────────────────────────────────────────────────

CREATE TYPE travel_request_status AS ENUM (
  'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED'
);

CREATE TYPE travel_purpose AS ENUM (
  'CLIENT_ENGAGEMENT', 'AUDIT', 'TRAINING', 'CONFERENCE',
  'INTERNAL_MEETING', 'SITE_VISIT', 'OTHER'
);

CREATE TABLE IF NOT EXISTS travel_requests (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_number      VARCHAR(20) UNIQUE NOT NULL,
  employee_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose             travel_purpose NOT NULL,
  purpose_description TEXT,
  origin              VARCHAR(200) NOT NULL,
  destination         VARCHAR(200) NOT NULL,
  departure_date      DATE NOT NULL,
  return_date         DATE NOT NULL,
  estimated_cost      NUMERIC(12, 2) NOT NULL DEFAULT 0,
  advance_required    BOOLEAN DEFAULT FALSE,
  advance_amount      NUMERIC(12, 2) DEFAULT 0,
  status              travel_request_status DEFAULT 'DRAFT',
  submitted_at        TIMESTAMPTZ,
  approved_at         TIMESTAMPTZ,
  rejected_at         TIMESTAMPTZ,
  rejection_reason    TEXT,
  cancelled_at        TIMESTAMPTZ,
  cancellation_reason TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-generate request number
CREATE SEQUENCE IF NOT EXISTS travel_request_seq START 1000;

CREATE OR REPLACE FUNCTION generate_request_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.request_number := 'TR-' || LPAD(nextval('travel_request_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_travel_request_number
  BEFORE INSERT ON travel_requests
  FOR EACH ROW EXECUTE FUNCTION generate_request_number();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_travel_requests_employee  ON travel_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_travel_requests_status    ON travel_requests(status);
CREATE INDEX IF NOT EXISTS idx_travel_requests_departure ON travel_requests(departure_date);
