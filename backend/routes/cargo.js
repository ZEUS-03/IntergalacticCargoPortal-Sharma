"use strict";

/*
Skipped manifest records:
- CRG-005 / Sector-7 Mining Rig / 20 kg -> 20 * 1.45 = 29, rounded to 29, and 29 is prime, so it is skipped.
- CRG-012 / Sector-7 Command Center / 100 kg -> 100 * 1.45 = 145, rounded to 145, and 145 is not prime, so it is saved.
*/

const express = require("express");
const multer = require("multer");
const db = require("../db");
const authenticate = require("../middleware/authenticate");
const isPrime = require("../utils/isPrime");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    const isTextFile = file.originalname.toLowerCase().endsWith(".txt");
    if (!isTextFile) {
      return callback(new Error("Only .txt files are allowed"));
    }
    return callback(null, true);
  },
});

const router = express.Router();

function handleTxtUpload(req, res, next) {
  upload.single("file")(req, res, (error) => {
    if (error) {
      if (error.message === "Only .txt files are allowed") {
        return res.status(400).json({ message: error.message });
      }

      return next(error);
    }

    return next();
  });
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseManifestLine(line) {
  const trimmed = line.trim();
  if (!trimmed) {
    return null;
  }

  const match = trimmed.match(
    /^\[(?<date>[^\]]+)\]\s*\|\|\s*(?<cargoId>CRG-\d{3})\s*::\s*(?<weight>\d+(?:\.\d+)?)\s*>>\s*(?<destination>.+)$/,
  );

  if (!match?.groups) {
    return null;
  }

  return {
    date: match.groups.date.trim(),
    cargoId: match.groups.cargoId.trim(),
    weight: toNumber(match.groups.weight),
    destination: match.groups.destination.trim(),
  };
}

function transformWeight(weight, destination) {
  const boostedWeight = destination.includes("Sector-7")
    ? weight * 1.45
    : weight;
  return Math.round(boostedWeight);
}

router.post(
  "/upload",
  authenticate,
  (req, res, next) => {
    if (req.user?.role !== "admin") {
      return res.status(403).send("Clearance level inadequate.");
    }
    return next();
  },
  handleTxtUpload,
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "file upload is required" });
      }

      const manifest = req.file.buffer.toString("utf8");
      const lines = manifest.split(/\r?\n/);
      const insertCargo = db.prepare(
        "INSERT INTO cargo (cargo_id, date, weight_kg, destination) VALUES (?, ?, ?, ?)",
      );
      const insertMany = db.transaction((records) => {
        for (const record of records) {
          insertCargo.run(
            record.cargoId,
            record.date,
            record.weightKg,
            record.destination,
          );
        }
      });

      const recordsToSave = [];

      for (const line of lines) {
        const parsed = parseManifestLine(line);
        if (!parsed || parsed.weight === null) {
          continue;
        }

        const weightKg = transformWeight(parsed.weight, parsed.destination);
        if (isPrime(weightKg)) {
          continue;
        }

        recordsToSave.push({
          cargoId: parsed.cargoId,
          date: parsed.date,
          weightKg,
          destination: parsed.destination,
        });
      }

      if (recordsToSave.length > 0) {
        insertMany(recordsToSave);
      }

      return res.status(201).json({
        saved: recordsToSave.length,
      });
    } catch (error) {
      console.error("cargo upload failed:", error);
      return res.status(500).json({ message: "internal server error" });
    }
  },
);

module.exports = router;
