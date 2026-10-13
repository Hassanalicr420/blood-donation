"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { promisify } = require("node:util");
const { DatabaseSync } = require("node:sqlite");

const scrypt = promisify(crypto.scrypt);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const DB_PATH = path.join(DATA_DIR, "rifah.sqlite");
const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 4173);
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;
const MAX_REQUEST_BYTES = 4 * 1024 * 1024;
const BLOOD_GROUPS = new Set(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]);
const REQUEST_STATUSES = new Set(["pending", "accepted", "matched", "fulfilled", "cancelled"]);
const sessions = new Map();
const loginAttempts = new Map();

fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new DatabaseSync(DB_PATH);
db.exec(`
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;
  PRAGMA busy_timeout = 5000;
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_salt BLOB NOT NULL,
    password_hash BLOB NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS blood_requests (
    id INTEGER PRIMARY KEY,
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
    report_image BLOB,
    report_type TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'accepted', 'matched', 'fulfilled', 'cancelled')),
    admin_note TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS donors (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    blood_group TEXT NOT NULL,
    city TEXT NOT NULL,
    age INTEGER NOT NULL,
    last_donation TEXT,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS status_history (
    id INTEGER PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES blood_requests(id),
    old_status TEXT,
    new_status TEXT NOT NULL,
    note TEXT,
    changed_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS blood_requests_status_created
    ON blood_requests(status, created_at);
  CREATE INDEX IF NOT EXISTS donors_blood_group
    ON donors(blood_group, city);
`);

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

function securityHeaders(response) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "same-origin");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'");
  if (process.env.NODE_ENV === "production") {
    response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
}

function sendError(response, status, message) {
  json(response, status, { error: message });
}

function readBody(request, limit = MAX_REQUEST_BYTES) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let length = 0;
    request.on("data", (chunk) => {
      length += chunk.length;
      if (length > limit) {
        reject(Object.assign(new Error("Request body too large"), { status: 413 }));
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
    throw Object.assign(new Error("Please submit valid form data."), { status: 400 });
  }
}

function validText(value, label, maxLength, { required = true } = {}) {
  if (typeof value !== "string") {
    if (!required && (value == null || value === "")) return "";
    throw Object.assign(new Error(`${label} is required.`), { status: 400 });
  }
  const cleaned = value.trim();
  if ((!cleaned && required) || cleaned.length > maxLength) {
    throw Object.assign(new Error(`${label} must be ${required ? "provided and " : ""}under ${maxLength} characters.`), { status: 400 });
  }
  return cleaned;
}

function safeEqual(left, right) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function hashPassword(password, salt = crypto.randomBytes(16)) {
  const result = await scrypt(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return { salt, hash: Buffer.from(result) };
}

async function passwordMatches(password, admin) {
  const candidate = await hashPassword(password, admin.password_salt);
  return safeEqual(candidate.hash, admin.password_hash);
}

function cookieValue(header, name) {
  const pair = (header || "").split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : "";
}

function makeCookie(value, maxAge) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `rifah_admin=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}

function currentSession(request) {
  const id = cookieValue(request.headers.cookie, "rifah_admin");
  const session = sessions.get(id);
  if (!session || session.expiresAt < Date.now()) {
    if (id) sessions.delete(id);
    return null;
  }
  session.expiresAt = Date.now() + SESSION_DURATION_MS;
  return session;
}

function requireSession(request, response) {
  const session = currentSession(request);
  if (!session) {
    sendError(response, 401, "Please sign in to the admin panel.");
    return null;
  }
  return session;
}

function checkSameOrigin(request, response) {
  const origin = request.headers.origin;
  const expected = process.env.PUBLIC_ORIGIN
    ? new URL(process.env.PUBLIC_ORIGIN).origin
    : `${request.socket.encrypted ? "https" : "http"}://${request.headers.host}`;
  if (!origin || origin !== expected) {
    sendError(response, 403, "This request origin is not allowed.");
    return false;
  }
  return true;
}

function checkCsrf(request, response, session) {
  if (!checkSameOrigin(request, response)) return false;
  const token = request.headers["x-csrf-token"] || "";
  if (!safeEqual(token, session.csrfToken)) {
    sendError(response, 403, "Your session token expired. Refresh and sign in again.");
    return false;
  }
  return true;
}

function rateLimited(request) {
  const address = request.socket.remoteAddress || "unknown";
  const record = loginAttempts.get(address);
  const now = Date.now();
  if (!record || record.resetAt <= now) {
    loginAttempts.set(address, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return false;
  }
  record.count += 1;
  return record.count > 6;
}

function clearLoginAttempts(request) {
  loginAttempts.delete(request.socket.remoteAddress || "unknown");
}

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
    hasReport: Boolean(row.report_image),
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

async function submitBloodRequest(request, response) {
  const contentType = request.headers["content-type"] || "";
  if (!contentType.startsWith("multipart/form-data;")) {
    sendError(response, 415, "Please submit the blood request form.");
    return;
  }
  const body = await readBody(request, MAX_REQUEST_BYTES);
  const form = await new Request("http://localhost/", {
    method: "POST",
    headers: { "content-type": contentType },
    body
  }).formData();
  if (form.get("consent") !== "on") {
    sendError(response, 400, "Consent is required before submitting a request.");
    return;
  }
  const group = validText(form.get("bloodGroup"), "Blood group", 3);
  if (!BLOOD_GROUPS.has(group)) {
    sendError(response, 400, "Choose a valid blood group.");
    return;
  }
  const neededBy = validText(form.get("neededBy"), "Blood needed date", 40);
  if (!Number.isFinite(Date.parse(neededBy))) {
    sendError(response, 400, "Enter a valid blood needed date and time.");
    return;
  }
  let reportImage = null;
  let reportType = null;
  const image = form.get("reportImage");
  if (image && typeof image === "object" && image.size > 0) {
    reportType = image.type;
    reportImage = Buffer.from(await image.arrayBuffer());
    if (!["image/jpeg", "image/png", "image/webp"].includes(reportType) ||
        reportImage.length > 3 * 1024 * 1024 || !imageMatchesType(reportImage, reportType)) {
      sendError(response, 400, "Choose a valid JPG, PNG, or WEBP report image up to 3 MB.");
      return;
    }
  }

  const trackingId = `RF-${crypto.randomBytes(12).toString("hex").toUpperCase()}`;
  const now = new Date().toISOString();
  const result = db.prepare(`
    INSERT INTO blood_requests (
      tracking_id, patient_name, phone, blood_group, city, hospital, needed_by,
      hemoglobin, condition_text, extra_info, report_image, report_type, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
  `).run(
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
    now,
    now
  );
  db.prepare("INSERT INTO status_history (request_id, new_status, changed_at) VALUES (?, 'pending', ?)")
    .run(result.lastInsertRowid, now);
  json(response, 201, { trackingId });
}

function createDonor(values) {
  const group = validText(values.bloodGroup, "Blood group", 3);
  const age = Number(values.age);
  if (!BLOOD_GROUPS.has(group) || !Number.isInteger(age) || age < 18 || age > 65) {
    sendError(response, 400, "Choose a valid blood group and an age between 18 and 65.");
    return;
  }
  const lastDonation = validText(values.lastDonation, "Last donation date", 20, { required: false });
  if (lastDonation && !Number.isFinite(Date.parse(lastDonation))) {
    sendError(response, 400, "Enter a valid last donation date.");
    return;
  }
  const result = db.prepare(`
    INSERT INTO donors (name, phone, blood_group, city, age, last_donation, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    validText(values.name, "Name", 80),
    validText(values.phone, "Phone number", 20),
    group,
    validText(values.city, "City or village", 80),
    age,
    lastDonation || null,
    new Date().toISOString()
  );
  return Number(result.lastInsertRowid);
}

async function submitDonor(request, response) {
  const values = await readJson(request);
  if (values.consent !== true) {
    sendError(response, 400, "Consent is required before registering as a donor.");
    return;
  }
  const id = createDonor(values);
  json(response, 201, { id });
}

function documentHtmlEscape(value) {
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
    `<tr><th>${documentHtmlEscape(label)}</th><td>${documentHtmlEscape(value)}</td></tr>`
  ).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;margin:36px;color:#282834}h1{color:#8f1b31}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:10px;text-align:left;vertical-align:top}th{width:30%;background:#fff5f5}</style></head><body><h1>Rifah Welfare Society</h1><h2>Blood request completion report</h2><table>${rows}</table><p>Generated by the Rifah Blood Donation admin panel.</p></body></html>`;
}

async function routeApi(request, response, url) {
  const method = request.method;
  const pathname = url.pathname;

  if (method === "GET" && pathname === "/api/health") {
    json(response, 200, { ok: true });
    return;
  }
  if (method === "POST" && pathname === "/api/requests") {
    if (!checkSameOrigin(request, response)) return;
    await submitBloodRequest(request, response);
    return;
  }
  if (method === "POST" && pathname === "/api/donors") {
    if (!checkSameOrigin(request, response)) return;
    await submitDonor(request, response);
    return;
  }
  const publicRequestMatch = pathname.match(/^\/api\/requests\/(RF-[A-F0-9]{24})$/);
  if (method === "GET" && publicRequestMatch) {
    const row = db.prepare(`
      SELECT tracking_id, blood_group, hospital, needed_by, status, created_at, updated_at
      FROM blood_requests WHERE tracking_id = ?
    `).get(publicRequestMatch[1]);
    if (!row) {
      sendError(response, 404, "No request was found for that tracking ID.");
      return;
    }
    json(response, 200, {
      trackingId: row.tracking_id,
      bloodGroup: row.blood_group,
      hospital: row.hospital,
      neededBy: row.needed_by,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
    return;
  }
  const publicCancelMatch = pathname.match(/^\/api\/requests\/(RF-[A-F0-9]{24})\/cancel$/);
  if (method === "POST" && publicCancelMatch) {
    if (!checkSameOrigin(request, response)) return;
    const body = await readJson(request);
    const trackingId = publicCancelMatch[1];
    const row = db.prepare("SELECT id, status FROM blood_requests WHERE tracking_id = ?").get(trackingId);
    if (!row) {
      sendError(response, 404, "No request was found for that tracking ID.");
      return;
    }
    if (row.status !== "pending") {
      sendError(response, 409, "Only a request that is still awaiting review can be cancelled here.");
      return;
    }
    if (!safeEqual(String(body.confirmation || ""), trackingId)) {
      sendError(response, 400, "Confirm the tracking ID to cancel this request.");
      return;
    }
    const now = new Date().toISOString();
    db.prepare("UPDATE blood_requests SET status = 'cancelled', updated_at = ? WHERE id = ?").run(now, row.id);
    db.prepare("INSERT INTO status_history (request_id, old_status, new_status, changed_at) VALUES (?, 'pending', 'cancelled', ?)")
      .run(row.id, now);
    json(response, 200, { status: "cancelled" });
    return;
  }

  if (method === "GET" && pathname === "/api/admin/session") {
    const session = currentSession(request);
    json(response, 200, { authenticated: Boolean(session), csrfToken: session?.csrfToken || null, email: session?.email || null });
    return;
  }
  if (method === "POST" && pathname === "/api/admin/login") {
    if (!checkSameOrigin(request, response)) return;
    if (rateLimited(request)) {
      sendError(response, 429, "Too many sign-in attempts. Please wait 15 minutes and try again.");
      return;
    }
    const values = await readJson(request);
    const email = validText(values.email, "Email", 254).toLowerCase();
    const password = validText(values.password, "Password", 200);
    const admin = db.prepare("SELECT id, email, password_salt, password_hash FROM admins WHERE email = ?").get(email);
    const matches = admin ? await passwordMatches(password, admin) : false;
    if (!matches) {
      sendError(response, 401, "The email or password is incorrect.");
      return;
    }
    clearLoginAttempts(request);
    const sessionId = crypto.randomBytes(32).toString("hex");
    const session = {
      adminId: admin.id,
      email: admin.email,
      csrfToken: crypto.randomBytes(32).toString("hex"),
      expiresAt: Date.now() + SESSION_DURATION_MS
    };
    sessions.set(sessionId, session);
    json(response, 200, { authenticated: true, csrfToken: session.csrfToken, email: session.email }, {
      "Set-Cookie": makeCookie(sessionId, SESSION_DURATION_MS / 1000)
    });
    return;
  }

  if (method === "POST" && pathname === "/api/admin/logout") {
    const session = requireSession(request, response);
    if (!session || !checkCsrf(request, response, session)) return;
    const sessionId = cookieValue(request.headers.cookie, "rifah_admin");
    sessions.delete(sessionId);
    json(response, 200, { ok: true }, { "Set-Cookie": makeCookie("", 0) });
    return;
  }

  if (pathname.startsWith("/api/admin/")) {
    const session = requireSession(request, response);
    if (!session) return;
    if (method === "GET" && pathname === "/api/admin/overview") {
      const totals = db.prepare(`
        SELECT
          (SELECT COUNT(*) FROM blood_requests WHERE status = 'pending') AS new_requests,
          (SELECT COUNT(*) FROM blood_requests) AS total_requests,
          (SELECT COUNT(*) FROM donors) AS total_donors,
          (SELECT COUNT(*) FROM blood_requests WHERE status = 'fulfilled') AS fulfilled_requests
      `).get();
      json(response, 200, { ...totals, email: session.email });
      return;
    }
    if (method === "GET" && pathname === "/api/admin/requests") {
      const rows = db.prepare("SELECT * FROM blood_requests ORDER BY CASE status WHEN 'pending' THEN 0 ELSE 1 END, created_at DESC LIMIT 300").all();
      json(response, 200, { requests: rows.map(requestRecord) });
      return;
    }
    if (method === "GET" && pathname === "/api/admin/donors") {
      const rows = db.prepare("SELECT * FROM donors ORDER BY created_at DESC LIMIT 500").all();
      json(response, 200, { donors: rows.map(donorRecord) });
      return;
    }
    if (method === "POST" && pathname === "/api/admin/donors") {
      if (!checkCsrf(request, response, session)) return;
      const values = await readJson(request);
      json(response, 201, { id: createDonor(values) });
      return;
    }
    const statusMatch = pathname.match(/^\/api\/admin\/requests\/(\d+)\/status$/);
    if (method === "PATCH" && statusMatch) {
      if (!checkCsrf(request, response, session)) return;
      const values = await readJson(request);
      if (!REQUEST_STATUSES.has(values.status)) {
        sendError(response, 400, "Choose a valid request status.");
        return;
      }
      const note = validText(values.note ?? "", "Admin note", 500, { required: false });
      const row = db.prepare("SELECT id, status FROM blood_requests WHERE id = ?").get(Number(statusMatch[1]));
      if (!row) {
        sendError(response, 404, "Request not found.");
        return;
      }
      const now = new Date().toISOString();
      db.prepare("UPDATE blood_requests SET status = ?, admin_note = ?, updated_at = ? WHERE id = ?")
        .run(values.status, note, now, row.id);
      db.prepare("INSERT INTO status_history (request_id, old_status, new_status, note, changed_at) VALUES (?, ?, ?, ?, ?)")
        .run(row.id, row.status, values.status, note || null, now);
      json(response, 200, { status: values.status, updatedAt: now });
      return;
    }
    const reportMatch = pathname.match(/^\/api\/admin\/requests\/(\d+)\/report$/);
    if (method === "GET" && reportMatch) {
      const row = db.prepare("SELECT tracking_id, report_image, report_type FROM blood_requests WHERE id = ?").get(Number(reportMatch[1]));
      if (!row || !row.report_image) {
        sendError(response, 404, "No medical report is attached to this request.");
        return;
      }
      const extension = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" })[row.report_type];
      response.writeHead(200, {
        "Content-Type": row.report_type,
        "Content-Length": row.report_image.length,
        "Content-Disposition": `attachment; filename="report-${row.tracking_id}.${extension}"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff"
      });
      response.end(row.report_image);
      return;
    }
    const documentMatch = pathname.match(/^\/api\/admin\/requests\/(\d+)\/document$/);
    if (method === "GET" && documentMatch) {
      const row = db.prepare("SELECT * FROM blood_requests WHERE id = ?").get(Number(documentMatch[1]));
      if (!row) {
        sendError(response, 404, "Request not found.");
        return;
      }
      if (row.status !== "fulfilled") {
        sendError(response, 409, "Mark this request as fulfilled before downloading its Word report.");
        return;
      }
      const document = wordDocument(row);
      response.writeHead(200, {
        "Content-Type": "application/msword; charset=utf-8",
        "Content-Length": Buffer.byteLength(document),
        "Content-Disposition": `attachment; filename="rifah-request-${row.tracking_id}.doc"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff"
      });
      response.end(document);
      return;
    }
    sendError(response, 404, "Admin endpoint not found.");
    return;
  }
  sendError(response, 404, "API endpoint not found.");
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon"
};

function serveStatic(urlPath, response) {
  let pathname;
  try {
    pathname = decodeURIComponent(urlPath);
  } catch {
    sendError(response, 400, "Invalid URL path.");
    return;
  }
  const requested = pathname === "/" ? "/index.html" : pathname;
  const absolute = path.resolve(ROOT, `.${requested}`);
  if (!absolute.startsWith(`${ROOT}${path.sep}`) || !fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
    sendError(response, 404, "Page not found.");
    return;
  }
  const type = MIME_TYPES[path.extname(absolute).toLowerCase()];
  if (!type) {
    sendError(response, 404, "File type not found.");
    return;
  }
  response.writeHead(200, {
    "Content-Type": type,
    "Content-Length": fs.statSync(absolute).size,
    "Cache-Control": "no-cache",
    "X-Content-Type-Options": "nosniff"
  });
  fs.createReadStream(absolute).pipe(response);
}

async function createInitialAdmin() {
  const initialEmail = (process.env.INITIAL_ADMIN_EMAIL || "rifahwelfaresociety@gmail.com").trim().toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  if (!password || password.length < 12) {
    throw new Error("First-time setup needs INITIAL_ADMIN_PASSWORD with at least 12 characters. Run start.ps1 to set it securely.");
  }
  try {
    const { salt, hash } = await hashPassword(password);
    db.prepare("INSERT INTO admins (email, password_salt, password_hash, created_at) VALUES (?, ?, ?, ?)")
      .run(initialEmail, salt, hash, new Date().toISOString());
  } finally {
    process.env.INITIAL_ADMIN_PASSWORD = "";
  }
}

async function main() {
  const adminCount = db.prepare("SELECT COUNT(*) AS count FROM admins").get().count;
  if (process.env.NODE_ENV === "production") {
    if (!process.env.PUBLIC_ORIGIN || new URL(process.env.PUBLIC_ORIGIN).protocol !== "https:") {
      throw new Error("Production mode requires PUBLIC_ORIGIN to be your HTTPS site origin.");
    }
  }
  if (process.argv.includes("--needs-admin")) {
    db.close();
    process.exit(Number(adminCount) === 0 ? 2 : 0);
  }
  if (process.argv.includes("--initialize-admin")) {
    if (Number(adminCount) !== 0) {
      throw new Error("An admin account already exists; refusing to replace it.");
    }
    await createInitialAdmin();
    db.close();
    process.exit(0);
  }
  if (Number(adminCount) === 0) await createInitialAdmin();

  setInterval(() => {
    const now = Date.now();
    for (const [id, session] of sessions) if (session.expiresAt < now) sessions.delete(id);
    for (const [address, entry] of loginAttempts) if (entry.resetAt < now) loginAttempts.delete(address);
  }, 60_000).unref();

  const server = http.createServer(async (request, response) => {
    securityHeaders(response);
    try {
      const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
      if (url.pathname.startsWith("/api/")) {
        await routeApi(request, response, url);
      } else if (request.method === "GET" || request.method === "HEAD") {
        serveStatic(url.pathname, response);
      } else {
        sendError(response, 405, "This request method is not allowed.");
      }
    } catch (error) {
      if (response.headersSent || response.destroyed) return;
      const status = error.status || 500;
      if (status >= 500) console.error("Request failed:", error);
      sendError(response, status, status >= 500 ? "The server could not complete this request." : error.message);
    }
  });

  server.listen(PORT, HOST, () => {
    console.log(`Rifah Blood Donation is available at http://${HOST}:${PORT}`);
    console.log(`Database: ${DB_PATH}`);
    console.log("For use outside this computer, deploy behind HTTPS; do not expose this HTTP server directly to the internet.");
  });

  const shutdown = () => server.close(() => {
    for (const session of sessions.values()) session.csrfToken = "";
    sessions.clear();
    db.close();
    process.exit(0);
  });
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  console.error(error.message);
  db.close();
  process.exitCode = 1;
});
