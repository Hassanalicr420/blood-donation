"use strict";

// Single serverless function that serves every /api/* route (see vercel.json rewrites).
module.exports = require("../lib/handler").handler;
