"use strict";

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SALT_ROUNDS = 10;

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function getRoleForEmail(email) {
  return email.endsWith("@nebula-corp.com") ? "admin" : "standard";
}

function signup(req, res) {
  try {
    const email = normalizeEmail(req.body?.email);
    const password =
      typeof req.body?.password === "string" ? req.body.password : "";

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required" });
    }

    if (!emailPattern.test(email)) {
      return res.status(400).json({ message: "email is invalid" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "password must be at least 8 characters" });
    }

    const existingUser = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email);
    if (existingUser) {
      return res.status(409).json({ message: "email already exists" });
    }

    const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);
    const role = getRoleForEmail(email);

    const insert = db.prepare(
      "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
    );
    const result = insert.run(email, passwordHash, role);

    return res.status(201).json({
      userId: Number(result.lastInsertRowid),
      email,
      role,
    });
  } catch (error) {
    console.error("signup failed:", error);
    return res.status(500).json({ message: "internal server error" });
  }
}

function login(req, res) {
  try {
    const email = normalizeEmail(req.body?.email);
    const password =
      typeof req.body?.password === "string" ? req.body.password : "";

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required" });
    }

    const user = db
      .prepare(
        "SELECT id, email, password_hash, role FROM users WHERE email = ?",
      )
      .get(email);

    if (!user) {
      return res.status(400).json({ message: "invalid email or password" });
    }

    const passwordMatches = bcrypt.compareSync(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(400).json({ message: "invalid email or password" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "JWT_SECRET is not configured" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      secret,
      { expiresIn: "7d" },
    );

    return res.status(200).json({ token });
  } catch (error) {
    console.error("login failed:", error);
    return res.status(500).json({ message: "internal server error" });
  }
}

module.exports = {
  signup,
  login,
};
