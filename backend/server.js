"use strict";

const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

const result = dotenv.config({ path: path.join(__dirname, ".env") });
const cors = require("cors");

require("./db");

const { signup, login, session, logout } = require("./auth");
const cargoRoutes = require("./routes/cargo");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.post("/signup", signup);
app.post("/login", login);
app.get("/session", session);
app.post("/logout", logout);
app.use("/api", cargoRoutes);

const spaRoutes = new Set(["/", "/login", "/dashboard"]);

app.use((req, res) => {
  if (req.method === "GET" && spaRoutes.has(req.path)) {
    return res.redirect(`http://localhost:5173${req.originalUrl}`);
  }

  const apiRoutes = ["/api", "/login", "/signup", "/session", "/logout"];
  const isApiRoute = apiRoutes.some((route) => req.path.startsWith(route));

  if (isApiRoute) {
    return res.status(404).json({ message: "not found" });
  }

  return res.redirect("http://localhost:5173");
});

const port = Number(process.env.PORT) || 3001;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

module.exports = app;
