"use strict";

const crypto = require("node:crypto");
const { query, ready, hashPassword, httpError, connectionString } = require("./db");

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;
const MAX_REQUEST_BYTES = 4 * 1024 * 1024;
const BLOOD_GROUPS = new Set(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]);
const REQUEST_STATUSES = new Set(["pending", "accepted", "matched", "fulfilled", "cancelled"]);
const COOKIE_NAME = "rifah_admin";
const IS_PROD = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);

/* ---------- helpers ---------- */

function json(response, status, payload, extraHeaders = {}) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
    ...extraHeaders
  });
  response.end(body);
}

function readBody(request, limit = MAX_REQUEST_BYTES) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let length = 0;
    request.on("data", (chunk) => {
      length += chunk.length;
      if (length > limit) {
        reject(httpError(413, "Request body too large"));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

async function readJson(request) {
  const raw = await readBody(request, 64 * 1024);
  try {
    const value = JSON.parse(raw.toString("utf8"));
    if (!value || Array.isArray(value) || typeof value !== "object") throw new Error("Invalid JSON object");
    return value;
  } catch {
    throw httpError(400, "Please submit valid form data.");
  }
}

function validText(value, label, maxLength, { required = true } = {}) {
  if (typeof value !== "string") {
    if (!required && (value == null || value === "")) return "";
    throw httpError(400, `${label} is required.`);
  }
  const cleaned = value.trim();
  if ((!cleaned && required) || cleaned.length > maxLength) {
    throw httpError(400, `${label} must be ${required ? "provided and " : ""}under ${maxLength} characters.`);
  }
  return cleaned;
}

function safeEqual(left, right) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function passwordMatches(password, admin) {
  const candidate = await hashPassword(password, admin.password_salt);
  return safeEqual(candidate.hash, admin.password_hash);
}

function clientIp(request) {
  const forwarded = request.headers["x-forwarded-for"];
  if (forwarded) return String(forwarded).split(",")[0].trim();
  return request.socket?.remoteAddress || "unknown";
}

/* ---------- stateless signed sessions (works on serverless) ---------- */

function sessionSecret() {
  return process.env.SESSION_SECRET ||
    crypto.createHash("sha256").update(`rifah-session:${connectionString()}`).digest("hex");
}

function sign(data) {
  return crypto.createHmac("sha256", sessionSecret()).update(data).digest("base64url");
}

function createToken(session) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function readToken(token) {
  const [payload, signature] = String(token || "").split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return session && session.exp > Date.now() ? session : null;
  } catch {
    return null;
  }
}

function cookieValue(header, name) {
  const pair = (header || "").split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  if (!pair) return "";
  try {
    return decodeURIComponent(pair.slice(name.length + 1));
  } catch {
    return "";
  }
}

function makeCookie(value, maxAgeSeconds) {
  const secure = IS_PROD ? "; Secure" : "";
  return `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSeconds}${secure}`;
}

function issueSession(admin) {
  return {
    adminId: admin.id,
    email: admin.email,
    csrfToken: crypto.randomBytes(32).toString("hex"),
    exp: Date.now() + SESSION_DURATION_MS
  };
}

function currentSession(request, response) {
  const session = readToken(cookieValue(request.headers.cookie, COOKIE_NAME));
  if (!session) return null;
  // Sliding expiry: renew the cookie once half of the lifetime has passed.
  if (response && session.exp - Date.now() < SESSION_DURATION_MS / 2) {
    session.exp = Date.now() + SESSION_DURATION_MS;
    response.setHeader("Set-Cookie", makeCookie(createToken(session), SESSION_DURATION_MS / 1000));
  }
  return session;
}

function requireSession(request, response) {
  const session = currentSession(request, response);
  if (!session) throw httpError(401, "Please sign in to the admin panel.");
  return session;
}

function expectedOrigins(request) {
  const origins = new Set();
  const host = request.headers["x-forwarded-host"] || request.headers.host;
  const proto = String(request.headers["x-forwarded-proto"] || (IS_PROD ? "https" : "http")).split(",")[0].trim();
  if (host) origins.add(`${proto}://${String(host).split(",")[0].trim()}`);
  if (process.env.PUBLIC_ORIGIN) {
    try { origins.add(new URL(process.env.PUBLIC_ORIGIN).origin); } catch { /* ignore bad value */ }
  }
  return origins;
}

function checkSameOrigin(request) {
  const origin = request.headers.origin;
  if (!origin || !expectedOrigins(request).has(origin)) {
    throw httpError(403, "This request origin is not allowed.");
  }
}

function checkCsrf(request, session) {
  checkSameOrigin(request);
  const token = request.headers["x-csrf-token"] || "";
  if (!safeEqual(String(token), session.csrfToken)) {
    throw httpError(403, "Your session token expired. Refresh and sign in again.");
  }
}

async function loginRateLimited(request) {
  const now = Date.now();
  const { rows } = await query(
    `INSERT INTO login_attempts (ip, count, reset_at) VALUES ($1, 1, $2)
     ON CONFLICT (ip) DO UPDATE SET
       count = CASE WHEN login_attempts.reset_at <= $3 THEN 1 ELSE login_attempts.count + 1 END,
       reset_at = CASE WHEN login_attempts.reset_at <= $3 THEN $2 ELSE login_attempts.reset_at END
     RETURNING count`,
    [clientIp(request), now + 15 * 60 * 1000, now]
  );
  return rows[0].count > 6;
}

/* ---------- records ---------- */

function requestRecord(row) {
  return {
    id: row.id,
    trackingId: row.tracking_id,
    patientName: row.patient_name,
    phone: row.phone,
    bloodGroup: row.blood_group,
    city: row.city,
    hospital: row.hospital,
    neededBy: row.needed_by,
    hemoglobin: row.hemoglobin,
    condition: row.condition_text,
    extraInfo: row.extra_info,
    hasReport: Boolean(row.has_report),
    status: row.status,
    adminNote: row.admin_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function donorRecord(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    bloodGroup: row.blood_group,
    city: row.city,
    age: row.age,
    lastDonation: row.last_donation,
    createdAt: row.created_at
  };
}

function imageMatchesType(buffer, type) {
  if (type === "image/jpeg") return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (type === "image/png") return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  return type === "image/webp" && buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
}

/* ---------- blood requests ---------- */

async function submitBloodRequest(request, response) {
  const contentType = request.headers["content-type"] || "";
  if (!contentType.startsWith("multipart/form-data;")) {
    throw httpError(415, "Please submit the blood request form.");
  }
  const body = await readBody(request, MAX_REQUEST_BYTES);
  const form = await new Request("http://localhost/", {
    method: "POST",
    headers: { "content-type": contentType },
    body
  }).formData();
  if (form.get("consent") !== "on") throw httpError(400, "Consent is required before submitting a request.");
  const group = validText(form.get("bloodGroup"), "Blood group", 3);
  if (!BLOOD_GROUPS.has(group)) throw httpError(400, "Choose a valid blood group.");
  const neededBy = validText(form.get("neededBy"), "Blood needed date", 40);
  if (!Number.isFinite(Date.parse(neededBy))) throw httpError(400, "Enter a valid blood needed date and time.");

  let reportImage = null;
  let reportType = null;
  const image = form.get("reportImage");
  if (image && typeof image === "object" && image.size > 0) {
    reportType = image.type;
    reportImage = Buffer.from(await image.arrayBuffer());
    if (!["image/jpeg", "image/png", "image/webp"].includes(reportType) ||
        reportImage.length > 3 * 1024 * 1024 || !imageMatchesType(reportImage, reportType)) {
      throw httpError(400, "Choose a valid JPG, PNG, or WEBP report image up to 3 MB.");
    }
  }

  const trackingId = `RF-${crypto.randomBytes(12).toString("hex").toUpperCase()}`;
  const now = new Date().toISOString();
  const values = [
    trackingId,
    validText(form.get("patientName"), "Patient name", 80),
    validText(form.get("phone"), "Phone number", 20),
    group,
    validText(form.get("city"), "City or village", 80),
    validText(form.get("hospital"), "Hospital", 120),
    neededBy,
    validText(form.get("hemoglobin"), "Hemoglobin", 8, { required: false }),
    validText(form.get("condition"), "Medical details", 160, { required: false }),
    validText(form.get("extraInfo"), "Additional information", 500, { required: false }),
    reportImage,
    reportType,
    now
  ];
  // One statement = request row + first history row, atomically.
  await query(
    `WITH inserted AS (
       INSERT INTO blood_requests (
         tracking_id, patient_name, phone, blood_group, city, hospital, needed_by,
         hemoglobin, condition_text, extra_info, report_image, report_type, status, created_at, updated_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'pending',$13,$13)
       RETURNING id
     )
     INSERT INTO status_history (request_id, new_status, changed_at)
     SELECT id, 'pending', $13 FROM inserted`,
    values
  );
  json(response, 201, { trackingId });
}

async function createDonor(values) {
  const group = validText(values.bloodGroup, "Blood group", 3);
  const age = Number(values.age);
  if (!BLOOD_GROUPS.has(group) || !Number.isInteger(age) || age < 18 || age > 65) {
    throw httpError(400, "Choose a valid blood group and an age between 18 and 65.");
  }
  const lastDonation = validText(values.lastDonation, "Last donation date", 20, { required: false });
  if (lastDonation && !Number.isFinite(Date.parse(lastDonation))) {
    throw httpError(400, "Enter a valid last donation date.");
  }
  const { rows } = await query(
    `INSERT INTO donors (name, phone, blood_group, city, age, last_donation, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
    [
      validText(values.name, "Name", 80),
      validText(values.phone, "Phone number", 20),
      group,
      validText(values.city, "City or village", 80),
      age,
      lastDonation || null,
      new Date().toISOString()
    ]
  );
  return rows[0].id;
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function statusName(status) {
  return ({
    pending: "Request received",
    accepted: "Accepted",
    matched: "Donor matched",
    fulfilled: "Fulfilled",
    cancelled: "Cancelled"
  })[status] || status;
}

function wordDocument(row) {
  const details = [
    ["Patient name", row.patient_name],
    ["Tracking ID", row.tracking_id],
    ["Status", statusName(row.status)],
    ["Blood group", row.blood_group],
    ["Contact number", row.phone],
    ["City / village", row.city],
    ["Hospital", row.hospital],
    ["Blood needed by", row.needed_by],
    ["Hemoglobin (Hb)", row.hemoglobin],
    ["Medical details", row.condition_text],
    ["Additional information", row.extra_info],
    ["Admin note", row.admin_note],
    ["Submitted", row.created_at],
    ["Last updated", row.updated_at]
  ];
  const rows = details.filter(([, value]) => value).map(([label, value]) =>
    `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`
  ).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;margin:36px;color:#282834}h1{color:#8f1b31}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:10px;text-align:left;vertical-align:top}th{width:30%;background:#fff5f5}</style></head><body><h1>Rifah Welfare Society</h1><h2>Blood request completion report</h2><table>${rows}</table><p>Generated by the Rifah Blood Donation admin panel.</p></body></html>`;
}

/* ---------- router ---------- */

const REQUEST_COLUMNS = `id, tracking_id, patient_name, phone, blood_group, city, hospital, needed_by,
  hemoglobin, condition_text, extra_info, (report_image IS NOT NULL) AS has_report,
  status, admin_note, created_at, updated_at`;

async function routeApi(request, response, url) {
  const method = request.method;
  const pathname = url.pathname.replace(/\/+$/, "") || "/";

  if (method === "GET" && pathname === "/api/health") {
    await ready();
    await query("SELECT 1");
    return json(response, 200, { ok: true, database: "connected" });
  }

  await ready();

  if (method === "POST" && pathname === "/api/requests") {
    checkSameOrigin(request);
    return submitBloodRequest(request, response);
  }
  if (method === "POST" && pathname === "/api/donors") {
    checkSameOrigin(request);
    const values = await readJson(request);
    if (values.consent !== true) throw httpError(400, "Consent is required before registering as a donor.");
    return json(response, 201, { id: await createDonor(values) });
  }

  const publicRequestMatch = pathname.match(/^\/api\/requests\/(RF-[A-F0-9]{24})$/);
  if (method === "GET" && publicRequestMatch) {
    const { rows } = await query(
      `SELECT tracking_id, blood_group, hospital, needed_by, status, created_at, updated_at
       FROM blood_requests WHERE tracking_id = $1`,
      [publicRequestMatch[1]]
    );
    const row = rows[0];
    if (!row) throw httpError(404, "No request was found for that tracking ID.");
    return json(response, 200, {
      trackingId: row.tracking_id,
      bloodGroup: row.blood_group,
      hospital: row.hospital,
      neededBy: row.needed_by,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }

  const publicCancelMatch = pathname.match(/^\/api\/requests\/(RF-[A-F0-9]{24})\/cancel$/);
  if (method === "POST" && publicCancelMatch) {
    checkSameOrigin(request);
    const body = await readJson(request);
    const trackingId = publicCancelMatch[1];
    const { rows } = await query("SELECT id, status FROM blood_requests WHERE tracking_id = $1", [trackingId]);
    const row = rows[0];
    if (!row) throw httpError(404, "No request was found for that tracking ID.");
    if (row.status !== "pending") {
      throw httpError(409, "Only a request that is still awaiting review can be cancelled here.");
    }
    if (!safeEqual(String(body.confirmation || ""), trackingId)) {
      throw httpError(400, "Confirm the tracking ID to cancel this request.");
    }
    const now = new Date().toISOString();
    const updated = await query(
      `WITH upd AS (
         UPDATE blood_requests SET status = 'cancelled', updated_at = $2
         WHERE id = $1 AND status = 'pending' RETURNING id
       )
       INSERT INTO status_history (request_id, old_status, new_status, changed_at)
       SELECT id, 'pending', 'cancelled', $2 FROM upd RETURNING id`,
      [row.id, now]
    );
    if (!updated.rowCount) throw httpError(409, "Only a request that is still awaiting review can be cancelled here.");
    return json(response, 200, { status: "cancelled" });
  }

  if (method === "GET" && pathname === "/api/admin/session") {
    const session = currentSession(request, response);
    return json(response, 200, {
      authenticated: Boolean(session),
      csrfToken: session?.csrfToken || null,
      email: session?.email || null
    });
  }

  if (method === "POST" && pathname === "/api/admin/login") {
    checkSameOrigin(request);
    if (await loginRateLimited(request)) {
      throw httpError(429, "Too many sign-in attempts. Please wait 15 minutes and try again.");
    }
    const values = await readJson(request);
    const email = validText(values.email, "Email", 254).toLowerCase();
    const password = validText(values.password, "Password", 200);
    const { rows } = await query(
      "SELECT id, email, password_salt, password_hash FROM admins WHERE LOWER(email) = $1",
      [email]
    );
    const admin = rows[0];
    if (!admin && !(await query("SELECT 1 FROM admins LIMIT 1")).rowCount) {
      throw httpError(503, "Admin account is not set up yet. Set INITIAL_ADMIN_PASSWORD in Vercel and redeploy.");
    }
    const matches = admin ? await passwordMatches(password, admin) : false;
    if (!matches) throw httpError(401, "The email or password is incorrect.");
    await query("DELETE FROM login_attempts WHERE ip = $1", [clientIp(request)]);
    const session = issueSession(admin);
    return json(response, 200, { authenticated: true, csrfToken: session.csrfToken, email: session.email }, {
      "Set-Cookie": makeCookie(createToken(session), SESSION_DURATION_MS / 1000)
    });
  }

  if (method === "POST" && pathname === "/api/admin/logout") {
    const session = requireSession(request, response);
    checkCsrf(request, session);
    return json(response, 200, { ok: true }, { "Set-Cookie": makeCookie("", 0) });
  }

  if (pathname.startsWith("/api/admin/")) {
    const session = requireSession(request, response);

    if (method === "GET" && pathname === "/api/admin/overview") {
      const { rows } = await query(`
        SELECT
          (SELECT COUNT(*) FROM blood_requests WHERE status = 'pending')::int AS new_requests,
          (SELECT COUNT(*) FROM blood_requests)::int AS total_requests,
          (SELECT COUNT(*) FROM donors)::int AS total_donors,
          (SELECT COUNT(*) FROM blood_requests WHERE status = 'fulfilled')::int AS fulfilled_requests`);
      return json(response, 200, { ...rows[0], email: session.email });
    }
    if (method === "GET" && pathname === "/api/admin/requests") {
      const { rows } = await query(
        `SELECT ${REQUEST_COLUMNS} FROM blood_requests
         ORDER BY CASE status WHEN 'pending' THEN 0 ELSE 1 END, created_at DESC LIMIT 3000`
      );
      return json(response, 200, { requests: rows.map(requestRecord) });
    }
    if (method === "GET" && pathname === "/api/admin/donors") {
      const { rows } = await query("SELECT * FROM donors ORDER BY created_at DESC LIMIT 3000");
      return json(response, 200, { donors: rows.map(donorRecord) });
    }
    if (method === "POST" && pathname === "/api/admin/donors") {
      checkCsrf(request, session);
      return json(response, 201, { id: await createDonor(await readJson(request)) });
    }

    const statusMatch = pathname.match(/^\/api\/admin\/requests\/(\d+)\/status$/);
    if (method === "PATCH" && statusMatch) {
      checkCsrf(request, session);
      const values = await readJson(request);
      if (!REQUEST_STATUSES.has(values.status)) throw httpError(400, "Choose a valid request status.");
      const note = validText(values.note ?? "", "Admin note", 500, { required: false });
      const now = new Date().toISOString();
      const { rows } = await query(
        `WITH old AS (SELECT id, status FROM blood_requests WHERE id = $1 FOR UPDATE),
         upd AS (
           UPDATE blood_requests SET status = $2, admin_note = $3, updated_at = $4
           WHERE id = $1 RETURNING id
         )
         INSERT INTO status_history (request_id, old_status, new_status, note, changed_at)
         SELECT old.id, old.status, $2, $5, $4 FROM old JOIN upd ON upd.id = old.id RETURNING id`,
        [Number(statusMatch[1]), values.status, note, now, note || null]
      );
      if (!rows.length) throw httpError(404, "Request not found.");
      return json(response, 200, { status: values.status, updatedAt: now });
    }

    const reportMatch = pathname.match(/^\/api\/admin\/requests\/(\d+)\/report$/);
    if (method === "GET" && reportMatch) {
      const { rows } = await query(
        "SELECT tracking_id, report_image, report_type FROM blood_requests WHERE id = $1",
        [Number(reportMatch[1])]
      );
      const row = rows[0];
      if (!row || !row.report_image) throw httpError(404, "No medical report is attached to this request.");
      const extension = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" })[row.report_type];
      response.writeHead(200, {
        "Content-Type": row.report_type,
        "Content-Length": row.report_image.length,
        "Content-Disposition": `attachment; filename="report-${row.tracking_id}.${extension}"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff"
      });
      return response.end(row.report_image);
    }

    const documentMatch = pathname.match(/^\/api\/admin\/requests\/(\d+)\/document$/);
    if (method === "GET" && documentMatch) {
      const { rows } = await query("SELECT * FROM blood_requests WHERE id = $1", [Number(documentMatch[1])]);
      const row = rows[0];
      if (!row) throw httpError(404, "Request not found.");
      if (row.status !== "fulfilled") {
        throw httpError(409, "Mark this request as fulfilled before downloading its Word report.");
      }
      const document = wordDocument(row);
      response.writeHead(200, {
        "Content-Type": "application/msword; charset=utf-8",
        "Content-Length": Buffer.byteLength(document),
        "Content-Disposition": `attachment; filename="rifah-request-${row.tracking_id}.doc"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff"
      });
      return response.end(document);
    }
    throw httpError(404, "Admin endpoint not found.");
  }
  throw httpError(404, "API endpoint not found.");
}

async function handler(request, response) {
  try {
    const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
    await routeApi(request, response, url);
  } catch (error) {
    if (response.headersSent || response.destroyed) return;
    const status = error.status || 500;
    if (status >= 500) console.error("Request failed:", error);
    const message = status >= 500 && status !== 503
      ? "The server could not complete this request."
      : error.message;
    json(response, status, { error: message });
  }
}

module.exports = { handler };
