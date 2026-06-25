"use strict";

const path = require("path");
const express = require("express");
const dotenv = require("dotenv");

const result = dotenv.config({ path: path.join(__dirname, ".env") });

require("./db");

const { signup, login } = require("./auth");

const app = express();

app.use(express.json());

app.post("/signup", signup);
app.post("/login", login);

app.use((req, res) => {
  return res.status(404).json({ message: "not found" });
});

const port = Number(process.env.PORT) || 3000;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

module.exports = app;
