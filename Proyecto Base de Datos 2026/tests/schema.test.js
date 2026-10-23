"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const definitions = require("../server/catalogs/definitions");

test("El código modular mantiene sus definiciones de catálogos en archivos separados", () => {
  assert.ok(Object.keys(definitions).length >= 30);
  const dirs = fs
    .readdirSync(path.join(root, "server/catalogs/definitions"), {
      withFileTypes: true,
    })
    .filter((e) => e.isDirectory());
  const names = dirs.flatMap((d) =>
    fs
      .readdirSync(path.join(root, "server/catalogs/definitions", d.name))
      .filter((f) => f.endsWith(".json")),
  );
  assert.equal(names.length, Object.keys(definitions).length);
  for (const [name, entry] of Object.entries(definitions)) {
    assert.ok(
      entry.columns.some((c) => c.name === entry.pk),
      name,
    );
    assert.ok(entry.path && typeof entry.path === "string", name);
  }
});

test("Se excluyen credenciales y dependencias del control de versiones", () => {
  const ignore = fs.readFileSync(path.join(root, ".gitignore"), "utf8");
  assert.match(ignore, /node_modules\//);
  assert.match(ignore, /(^|\n)\.env(\n|$)/);
});

test("La aplicación web no incluye scripts SQL ni modelos académicos", () => {
  assert.equal(fs.existsSync(path.join(root, "database")), false);
  assert.equal(fs.existsSync(path.join(root, "diagramas")), false);
});
