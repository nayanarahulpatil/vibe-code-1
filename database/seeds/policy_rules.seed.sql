-- ─────────────────────────────────────────────────────────────────
-- Seed: Policy Rules (Standard Travel Policy)
-- ─────────────────────────────────────────────────────────────────

INSERT INTO policy_rules (name, description, rule_type, category, limit_amount, limit_days, scope, is_active) VALUES
  -- Amount Limits per category
  ('Flight Limit Per Trip',       'Maximum flight cost per trip',          'AMOUNT_LIMIT', 'FLIGHTS',          15000, NULL, 'ALL', TRUE),
  ('Hotel Limit Per Night',       'Maximum hotel cost per night',          'AMOUNT_LIMIT', 'HOTEL',            5000,  NULL, 'ALL', TRUE),
  ('Meal Daily Limit',            'Maximum meal expense per day',          'DAILY_LIMIT',  'MEALS',            500,   1,    'ALL', TRUE),
  ('Local Transport Daily Limit', 'Maximum local cab/transport per day',   'DAILY_LIMIT',  'LOCAL_TRANSPORT',  800,   1,    'ALL', TRUE),
  ('Conference Fee Limit',        'Maximum conference/seminar fee',        'AMOUNT_LIMIT', 'CONFERENCE_FEE',   25000, NULL, 'ALL', TRUE),
  ('Visa Fee Limit',              'Maximum visa processing fee',           'AMOUNT_LIMIT', 'VISA',             5000,  NULL, 'ALL', TRUE),
  ('Miscellaneous Limit',         'Maximum miscellaneous expense per trip','AMOUNT_LIMIT', 'MISCELLANEOUS',    2000,  NULL, 'ALL', TRUE),

  -- Advance Notice Policy
  ('Advance Notice Requirement',  'Travel request must be submitted at least 3 days in advance',
   'ADVANCE_NOTICE_DAYS', NULL, NULL, 3, 'ALL', TRUE),

  -- Receipt Requirements
  ('Receipt Required Threshold',  'Receipt mandatory for expenses above ₹500',
   'RECEIPT_REQUIRED', NULL, 500, NULL, 'ALL', TRUE),

  -- Duplicate Detection
  ('Duplicate Claim Detection',   'Detect duplicate claims: same employee, same amount, same date, same category',
   'DUPLICATE_DETECTION', NULL, NULL, NULL, 'ALL', TRUE)

ON CONFLICT DO NOTHING;
