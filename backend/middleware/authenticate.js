"use strict";

const jwt = require("jsonwebtoken");

function parseCookieHeader(cookieHeader) {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(";").reduce((accumulator, part) => {
    const index = part.indexOf("=");
    if (index === -1) {
      return accumulator;
    }

    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    accumulator[key] = decodeURIComponent(value);
    return accumulator;
  }, {});
}

function authenticate(req, res, next) {
  try {
    const authHeader = req.get("authorization");
    const cookieToken = parseCookieHeader(req.headers.cookie).icp_token;
    const bearerToken =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice("Bearer ".length).trim()
        : "";
    const token = cookieToken || bearerToken;

    if (!token) {
      return res
        .status(401)
        .json({ message: "missing or invalid authorization" });
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
