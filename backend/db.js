"use strict";

const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const databasePath =
  process.env.DB_PATH || path.join(__dirname, "data", "app.db");
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new Database(databasePath);

db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'standard')),
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
  );
`);

module.exports = db;
