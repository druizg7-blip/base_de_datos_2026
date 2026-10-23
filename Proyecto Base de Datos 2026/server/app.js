"use strict";

const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const errorHandler = require("./middleware/error-handler");

const app = express();
app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "150kb" }));

app.use("/api/auth/login", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Intente más tarde." },
}));

app.use("/api", require("./routes"));
app.use("/api", (_req, res) => res.status(404).json({ error: "Ruta de API inexistente" }));

const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));
app.get("*", (_req, res) => res.sendFile(path.join(publicPath, "index.html")));
app.use(errorHandler);

module.exports = app;
