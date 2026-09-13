-- Additive migration: existing pharmacy and client records are preserved.
CREATE TABLE IF NOT EXISTS client_accounts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  last_name VARCHAR(150) NOT NULL,
  email VARCHAR(254) NOT NULL UNIQUE CHECK (email = LOWER(email)),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS client_sessions (
  token_hash TEXT PRIMARY KEY,
  account_id BIGINT NOT NULL REFERENCES client_accounts(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS client_sessions_expiry_idx ON client_sessions(expires_at);
