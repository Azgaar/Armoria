import assert from "node:assert/strict";
import {afterEach, beforeEach, test} from "node:test";
import {fileURLToPath} from "node:url";
import {createServer} from "vite";
import {get} from "svelte/store";

const root = fileURLToPath(new URL("../", import.meta.url));
let server, saved, storage, status, read, defaults;
const priorWindow = globalThis.window;
beforeEach(async () => {
  saved = new Map();
  globalThis.window = {
    localStorage: {
      getItem: key => saved.get(key) ?? null,
      setItem: (key, value) => saved.set(key, String(value)),
      removeItem: key => saved.delete(key)
    }
  };
  server = await createServer({
    root,
    configFile: false,
    logLevel: "silent",
    server: {middlewareMode: true, hmr: false, watch: null},
    optimizeDeps: {noDiscovery: true, include: []},
    resolve: {alias: {$lib: root + "src/lib"}},
    plugins: [
      {
        name: "settings-browser",
        resolveId(id) {
          if (id === "$app/environment") return "\0settings-browser";
        },
        load(id) {
          if (id === "\0settings-browser") return "export const browser = true;";
        }
      }
    ]
  });
  ({readSavedSettings: read} = await server.ssrLoadModule("/src/lib/data/settings.ts"));
  ({settingsStorage: storage, storageStatus: status} = await server.ssrLoadModule("/src/lib/data/storage.ts"));
  defaults = await server.ssrLoadModule("/src/lib/config/defaults.ts");
});
afterEach(async () => {
  await server?.close();
  if (priorWindow === undefined) delete globalThis.window;
  else globalThis.window = priorWindow;
});
const upload = {category: "uploaded", type: "vector", data: {colors: 1}, content: '<g id="mycrest"><path d="M0 0h10v10z"/></g>'};

test("missing settings use independent defaults without writing storage", () => {
  const options = read();
  assert.deepEqual(options.colors, defaults.DEFAULT_COLORS);
  assert.deepEqual(options.tinctures, defaults.DEFAULT_TINCTURES);
  assert.equal(options.borderWidth, 1);
  assert.equal(options.showGrid, false);
  options.colors.or = "#000000";
  assert.notEqual(read().colors.or, "#000000");
  assert.equal(saved.size, 0);
  assert.deepEqual(get(status), {recovered: false, unavailable: false});
});

test("malformed JSON is isolated without erasing other settings or uploaded charges", () => {
  saved.set("colors", "{");
  saved.set("borderWidth", "0");
  saved.set("uploaded", JSON.stringify({mycrest: upload}));
  const before = new Map(saved);
  const options = read();
  assert.deepEqual(options.colors, defaults.DEFAULT_COLORS);
  assert.equal(options.borderWidth, 0);
  assert.deepEqual(options.uploaded.mycrest, upload);
  assert.deepEqual(saved, before, "recovery never deletes or overwrites raw saved data");
  assert.equal(get(status).recovered, true);
});

test("wrong collection shapes and unsupported settings recover independently", () => {
  for (const [key, value] of Object.entries({
    colors: "[]",
    fonts: "42",
    uploaded: '"text"',
    tinctures: "[]",
    showGrid: '"true"',
    shield: "missing",
    diaper: "missing",
    grad: "missing",
    border: "url(bad)"
  }))
    saved.set(key, value);
  const options = read();
  assert.deepEqual(options.uploaded, {});
  assert.deepEqual(options.fonts, defaults.DEFAULT_FONTS);
  assert.deepEqual(options.tinctures, defaults.DEFAULT_TINCTURES);
  assert.equal(options.showGrid, false);
  assert.notEqual(options.shield, "missing");
  assert.equal(storage.getItem("shield"), null, "an invalid shield does not remain locked");
  assert.equal(saved.get("shield"), "missing", "raw data remains available for recovery");
});

test("numeric settings preserve zero where supported and enforce finite bounds", () => {
  for (const [key, value] of Object.entries({borderWidth: "0", scale: "0.2", grid: "50", size: "80", showGrid: "false"}))
    saved.set(key, value);
  const valid = read();
  assert.equal(valid.borderWidth, 0);
  assert.equal(valid.scale, 0.2);
  assert.equal(valid.grid, 50);
  assert.equal(valid.size, 80);
  assert.equal(valid.showGrid, false);
  // Fresh keys have not been replaced in memory by reads of valid data.
  for (const [key, value] of Object.entries({borderWidth: "-1", scale: "Infinity", grid: "0", size: "1e100"}))
    saved.set(key, value);
  const invalid = read();
  assert.equal(invalid.borderWidth, 1);
  assert.equal(invalid.scale, 2);
  assert.equal(invalid.grid, 1);
  assert.equal(invalid.size, 200);
});

test("mixed maps retain valid custom palette, fonts and charges", () => {
  saved.set("colors", JSON.stringify({or: "#123456", custom: "#abcdef", bad: [], __proto__: null}));
  saved.set(
    "fonts",
    JSON.stringify({
      "Local Font": {},
      "Web Font": {url: "https://example.test/font.woff2"},
      bad: null,
      unsafe: {url: "javascript:alert(1)"}
    })
  );
  saved.set(
    "uploaded",
    JSON.stringify({
      mycrest: upload,
      bad: null,
      badcategory: {...upload, category: "missing"},
      badcontent: {...upload, content: []}
    })
  );
  const options = read();
  assert.equal(options.colors.or, "#123456");
  assert.equal(options.colors.custom, "#abcdef");
  assert.ok(options.colors.argent);
  assert.equal(options.colors.bad, undefined);
  assert.deepEqual(options.fonts["Local Font"], {});
  assert.equal(options.fonts["Web Font"].url, "https://example.test/font.woff2");
  assert.ok(options.fonts.Arial);
  assert.equal(options.fonts.unsafe, undefined);
  assert.deepEqual(options.uploaded, {mycrest: upload});
  assert.equal(get(status).recovered, true);
});

test("tincture probabilities reject malformed or unbounded weights and unknown identifiers", async () => {
  const {validateTinctures} = await server.ssrLoadModule("/src/lib/data/validators.ts");
  for (const mutate of [
    v => (v.field.metals = "32"),
    v => (v.field.metals = 1e9),
    v => (v.field.metals = -1),
    v => (v.field.metals = 0.5),
    v => (v.metals = {}),
    v => delete v.stains,
    v => (v.patterns.unknown = 2),
    v => (v.colours.missing = 5)
  ]) {
    const value = structuredClone(defaults.DEFAULT_TINCTURES);
    mutate(value);
    assert.equal(validateTinctures(value), false);
  }
  const valid = structuredClone(defaults.DEFAULT_TINCTURES);
  valid.field.stains = 0;
  valid.division.stains = 0;
  valid.charge.stains = 0;
  valid.stains = {};
  valid.colours.custom = 2;
  assert.equal(validateTinctures(valid, {...defaults.DEFAULT_COLORS, custom: "#123456"}), true);
});

test("legacy derived probability caches are discarded without changing stored format", () => {
  const value = structuredClone(defaults.DEFAULT_TINCTURES);
  value.field.array = ["missing"];
  value.colours.array = ["missing"];
  saved.set("tinctures", JSON.stringify(value));
  const options = read();
  assert.deepEqual(options.tinctures, defaults.DEFAULT_TINCTURES);
  assert.ok(JSON.parse(saved.get("tinctures")).field.array);
});

test("denied storage access falls back to memory for reads, writes and unlocking", () => {
  Object.defineProperty(window, "localStorage", {
    get() {
      throw new DOMException("denied", "SecurityError");
    }
  });
  assert.equal(read().borderWidth, 1);
  storage.setItem("borderWidth", 0);
  assert.equal(storage.getItem("borderWidth"), "0");
  storage.removeItem("borderWidth");
  assert.equal(storage.getItem("borderWidth"), null);
  assert.equal(get(status).unavailable, true);
});

test("quota failures retain existing uploads and keep new choices usable in this tab", () => {
  saved.set("uploaded", JSON.stringify({mycrest: upload}));
  window.localStorage.setItem = () => {
    throw new DOMException("quota", "QuotaExceededError");
  };
  window.localStorage.removeItem = () => {
    throw new DOMException("denied", "SecurityError");
  };
  assert.deepEqual(read().uploaded.mycrest, upload);
  storage.setItem("borderWidth", 0);
  assert.equal(read().borderWidth, 0);
  storage.removeItem("grid");
  assert.equal(get(status).unavailable, true);
  assert.deepEqual(JSON.parse(saved.get("uploaded")), {mycrest: upload});
});
