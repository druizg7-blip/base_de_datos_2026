"use strict";

const db = require("./db");

async function start(app) {
  await db.init();
  const port = Number(process.env.PORT) || 3000;
  const server = app.listen(port, () => {
    console.log(`La Casa del Constructor de Derek: http://localhost:${port}`);
  });

  const shutdown = async () => {
    server.close();
    try {
      await db.close();
    } finally {
      process.exit(0);
    }
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  return server;
}

module.exports = { start };
