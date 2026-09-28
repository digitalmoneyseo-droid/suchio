CREATE TABLE audit_visits (
  receipt_hash TEXT PRIMARY KEY,
  report_code TEXT NOT NULL,
  day TEXT NOT NULL,
  consent_version TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX audit_visits_report_day ON audit_visits(report_code, day);
CREATE INDEX audit_visits_expiry ON audit_visits(expires_at);
CREATE TABLE audit_link_checks (
  report_code TEXT PRIMARY KEY,
  checked_at TEXT NOT NULL,
  ok INTEGER NOT NULL CHECK (ok IN (0, 1))
);
