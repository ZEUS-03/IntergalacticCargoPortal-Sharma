"use strict";

const path = require("path");
const express = require("express");
const dotenv = require("dotenv");

const result = dotenv.config({ path: path.join(__dirname, ".env") });

require("./db");

const { signup, login, session, logout } = require("./auth");
const cargoRoutes = require("./routes/cargo");

const app = express();

app.use(express.json());

app.post("/signup", signup);
app.post("/login", login);
app.get("/session", session);
app.post("/logout", logout);
app.use("/api", cargoRoutes);

app.use((req, res) => {
  return res.status(404).json({ message: "not found" });
});

const port = Number(process.env.PORT) || 3001;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

module.exports = app;
