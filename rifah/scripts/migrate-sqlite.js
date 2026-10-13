"use strict";

// Optional: copy existing data from the old local rifah.sqlite into Postgres.
// Usage: DATABASE_URL=... node --no-warnings scripts/migrate-sqlite.js path/to/rifah.sqlite
const { DatabaseSync } = require("node:sqlite");
const { query, ready } = require("../lib/db");

(async () => {
  const file = process.argv[2];
  if (!file) { console.error("Usage: node --no-warnings scripts/migrate-sqlite.js path/to/rifah.sqlite"); process.exit(1); }
  const sqlite = new DatabaseSync(file, { readOnly: true });
  await ready();
  const idMap = new Map();
  for (const r of sqlite.prepare("SELECT * FROM blood_requests ORDER BY id").all()) {
    const { rows } = await query(
      `INSERT INTO blood_requests (tracking_id, patient_name, phone, blood_group, city, hospital, needed_by,
        hemoglobin, condition_text, extra_info, report_image, report_type, status, admin_note, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       ON CONFLICT (tracking_id) DO NOTHING RETURNING id`,
      [r.tracking_id, r.patient_name, r.phone, r.blood_group, r.city, r.hospital, r.needed_by, r.hemoglobin,
       r.condition_text, r.extra_info, r.report_image ? Buffer.from(r.report_image) : null, r.report_type,
       r.status, r.admin_note, r.created_at, r.updated_at]
    );
    if (rows[0]) idMap.set(r.id, rows[0].id);
  }
  for (const h of sqlite.prepare("SELECT * FROM status_history ORDER BY id").all()) {
    if (!idMap.has(h.request_id)) continue;
    await query(
      "INSERT INTO status_history (request_id, old_status, new_status, note, changed_at) VALUES ($1,$2,$3,$4,$5)",
      [idMap.get(h.request_id), h.old_status, h.new_status, h.note, h.changed_at]
    );
  }
  for (const d of sqlite.prepare("SELECT * FROM donors ORDER BY id").all()) {
    await query(
      "INSERT INTO donors (name, phone, blood_group, city, age, last_donation, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)",
      [d.name, d.phone, d.blood_group, d.city, d.age, d.last_donation, d.created_at]
    );
  }
  console.log(`Migrated ${idMap.size} requests.`);
  process.exit(0);
})().catch((error) => { console.error(error.message); process.exit(1); });
