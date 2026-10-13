"use strict";

// Create or reset the admin account directly in the database.
// Usage: DATABASE_URL=... node scripts/set-admin-password.js admin@example.com "new-password-12+chars"
const { query, ready, hashPassword } = require("../lib/db");

(async () => {
  const [email, password] = process.argv.slice(2);
  if (!email || !password || password.length < 12) {
    console.error('Usage: node scripts/set-admin-password.js <email> "<password, 12+ chars>"');
    process.exit(1);
  }
  await ready();
  const { salt, hash } = await hashPassword(password);
  await query("DELETE FROM admins WHERE LOWER(email) = $1", [email.toLowerCase()]);
  await query(
    "INSERT INTO admins (email, password_salt, password_hash, created_at) VALUES ($1,$2,$3,$4)",
    [email.toLowerCase(), salt, hash, new Date().toISOString()]
  );
  console.log(`Admin ${email.toLowerCase()} is ready.`);
  process.exit(0);
})().catch((error) => { console.error(error.message); process.exit(1); });
