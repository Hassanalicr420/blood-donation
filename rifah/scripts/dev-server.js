"use strict";

// Local dev: static files from /public + the same API handler Vercel runs.
// Usage: copy .env.example to .env, fill it in, then `npm run dev`.
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const envFile = path.join(__dirname, "..", ".env");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match && !line.trim().startsWith("#") && !(match[1] in process.env)) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

const { handler } = require("../lib/handler");
const PUBLIC = path.join(__dirname, "..", "public");
const PORT = Number(process.env.PORT || 4173);
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon"
};

http.createServer((request, response) => {
  const url = new URL(request.url, "http://localhost");
  if (url.pathname.startsWith("/api/")) return handler(request, response);
  let name;
  try { name = decodeURIComponent(url.pathname); } catch { response.writeHead(400).end(); return; }
  const file = path.resolve(PUBLIC, "." + (name === "/" ? "/index.html" : name));
  if (!file.startsWith(PUBLIC + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    response.writeHead(404).end("Not found");
    return;
  }
  response.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(response);
}).listen(PORT, () => console.log(`Rifah running at http://localhost:${PORT}`));
