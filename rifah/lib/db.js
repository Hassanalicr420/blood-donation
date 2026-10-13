"use strict";

const crypto = require("node:crypto");
const { promisify } = require("node:util");
const { Pool } = require("pg");

const scrypt = promisify(crypto.scrypt);

function connectionString() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || "";
}

function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

let pool;
function getPool() {
  if (pool) return pool;
  const url = connectionString();
  if (!url) {
    throw httpError(503, "Database is not configured. Set DATABASE_URL in Vercel Environment Variables.");
  }
  const isLocal = /@(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/.test(url);
  const hasSslMode = /[?&]sslmode=/.test(url);
  pool = new Pool({
    connectionString: url,
    // Serverless: keep the pool tiny, every function instance has its own.
    max: 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
    ssl: isLocal || hasSslMode ? undefined : { rejectUnauthorized: false }
  });
  pool.on("error", (error) => console.error("Postgres pool error:", error.message));
  return pool;
}

function query(text, params = []) {
  return getPool().query(text, params);
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    password_salt BYTEA NOT NULL,
    password_hash BYTEA NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE UNIQUE INDEX IF NOT EXISTS admins_email_lower ON admins (LOWER(email));
  CREATE TABLE IF NOT EXISTS blood_requests (
    id SERIAL PRIMARY KEY,
    tracking_id TEXT NOT NULL UNIQUE,
    patient_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    blood_group TEXT NOT NULL,
    city TEXT NOT NULL,
    hospital TEXT NOT NULL,
    needed_by TEXT NOT NULL,
    hemoglobin TEXT,
    condition_text TEXT,
    extra_info TEXT,
    report_image BYTEA,
    report_type TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'accepted', 'matched', 'fulfilled', 'cancelled')),
    admin_note TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS donors (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    blood_group TEXT NOT NULL,
    city TEXT NOT NULL,
    age INTEGER NOT NULL,
    last_donation TEXT,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS status_history (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES blood_requests(id),
    old_status TEXT,
    new_status TEXT NOT NULL,
    note TEXT,
    changed_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS login_attempts (
    ip TEXT PRIMARY KEY,
    count INTEGER NOT NULL,
    reset_at BIGINT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS blood_requests_status_created ON blood_requests(status, created_at);
  CREATE INDEX IF NOT EXISTS donors_blood_group ON donors(blood_group, city);
`;

async function hashPassword(password, salt = crypto.randomBytes(16)) {
  const result = await scrypt(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return { salt, hash: Buffer.from(result) };
}

async function createInitialAdminIfNeeded() {
  const { rows } = await query("SELECT COUNT(*)::int AS count FROM admins");
  if (rows[0].count > 0) return;
  const email = (process.env.INITIAL_ADMIN_EMAIL || "rifahwelfaresociety@gmail.com").trim().toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  if (!password || password.length < 12) {
    console.warn("No admin exists yet. Set INITIAL_ADMIN_PASSWORD (12+ characters) in Vercel and redeploy.");
    return;
  }
  const { salt, hash } = await hashPassword(password);
  await query(
    "INSERT INTO admins (email, password_salt, password_hash, created_at) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING",
    [email, salt, hash, new Date().toISOString()]
  );
}

// Runs once per cold start: creates tables if missing and seeds the first admin.
let readyPromise;
function ready() {
  if (!readyPromise) {
    readyPromise = (async () => {
      // Advisory lock: several cold starts at once must not race on CREATE TABLE.
      const client = await getPool().connect();
      try {
        await client.query("BEGIN");
        await client.query("SELECT pg_advisory_xact_lock(727274)");
        await client.query(SCHEMA);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        throw error;
      } finally {
        client.release();
      }
      await createInitialAdminIfNeeded();
    })().catch((error) => {
      readyPromise = undefined; // retry on next request
      throw error;
    });
  }
  return readyPromise;
}

module.exports = { query, ready, hashPassword, httpError, connectionString };
