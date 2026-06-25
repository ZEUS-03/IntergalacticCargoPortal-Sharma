"use strict";

const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  try {
    const authHeader = req.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "missing or invalid authorization header" });
    }

    const token = authHeader.slice("Bearer ".length).trim();
    if (!token) {
      return res
        .status(401)
        .json({ message: "missing or invalid authorization header" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "JWT_SECRET is not configured" });
    }

    const payload = jwt.verify(token, secret);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "invalid or expired token" });
  }
}

module.exports = authenticate;
