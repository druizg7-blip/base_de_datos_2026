"use strict";

const app = require("./server/app");
const { start: boot } = require("./server/bootstrap");

const start = () => boot(app);

if (require.main === module) {
  start().catch(err => {
    console.error("No fue posible conectar con Oracle:", err.message);
    process.exitCode = 1;
  });
}

module.exports = { app, start };
