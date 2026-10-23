"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const root = path.join(__dirname, "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
function files(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory()
        ? files(path.join(dir, e.name))
        : e.name.endsWith(".js")
          ? [path.join(dir, e.name)]
          : [],
    );
}

test("La página principal inicia módulos ES nativos", () => {
  assert.match(
    read("public/index.html"),
    /script type="module" src="\/app.js"/,
  );
  assert.match(read("public/app.js"), /import \{.*boot.*\} from/);
  assert.match(
    read("public/js/core/navigation.js"),
    /async function openPage\(path\)/,
  );
});

test("Cada import local apunta a un archivo existente y los JS tienen sintaxis válida", () => {
  const js = [
    ...files(path.join(root, "server")),
    ...files(path.join(root, "public")),
  ];
  for (const file of js) {
    const result = spawnSync(process.execPath, ["--check", file], {
      encoding: "utf8",
    });
    assert.equal(result.status, 0, `${file}: ${result.stderr}`);
    const src = fs.readFileSync(file, "utf8");
    for (const m of src.matchAll(
      /^import\s+\{[^}]+\}\s+from\s+["']([^"']+)["'];/gm,
    )) {
      assert.ok(
        fs.existsSync(path.resolve(path.dirname(file), m[1])),
        file + " " + m[1],
      );
    }
  }
});

test("La pantalla conserva el login y los estilos ocultan los elementos hidden", () => {
  assert.match(read("public/app.js"), /\$\("loginForm"\)\.onsubmit/);
  assert.match(
    read("public/js/core/navigation.js"),
    /\$\("loginView"\)\.hidden = true/,
  );
  assert.match(
    read("public/css/base.css"),
    /\[hidden\]\{display:none!important\}/,
  );
});

test("Menú superior jerárquico sin barra lateral ni emblemas decorativos", () => {
  const html = read("public/index.html");
  assert.match(html, /id="navWrap"/);
  assert.match(html, /class="site-nav"/);
  assert.doesNotMatch(
    html,
    /class="sidebar"|class="identity-mark"|class="brand-seal"|id="avatar"|Datos Oracle/,
  );
  const nav = read("public/js/core/navigation.js");
  assert.match(nav, /PUEDE_CONSULTAR/);
  assert.match(nav, /nav-category/);
  assert.match(nav, /nav-dropdown/);
  assert.match(nav, /aria-expanded/);
});
