CREATE TABLE audit_admin_sessions (
  token_hash TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  credential_version TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX audit_admin_sessions_expiry ON audit_admin_sessions (expires_at);
