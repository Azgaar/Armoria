import assert from "node:assert/strict";
import {after, before, test} from "node:test";
import {fileURLToPath} from "node:url";
import {createServer} from "vite";

const root = fileURLToPath(new URL("../", import.meta.url));
let server, schema, api, limits;
before(async () => {
  server = await createServer({
    root,
    configFile: false,
    logLevel: "silent",
    server: {middlewareMode: true, hmr: false, watch: null},
    optimizeDeps: {noDiscovery: true, include: []},
    resolve: {alias: {$lib: root + "src/lib"}}
  });
  schema = await server.ssrLoadModule("/src/lib/coa/validation.ts");
  api = await server.ssrLoadModule("/src/lib/api/validation.ts");
  limits = await server.ssrLoadModule("/src/lib/coa/limits.ts");
});
after(async () => server?.close());

const charge = {charge: "eagle", t: "gules", p: "e"};
test("rejects malformed roots, nested shapes, identifiers and rendering controls", () => {
  const invalid = [
    null,
    {},
    [],
    true,
    1,
    "or",
    {t1: null},
    {t1: "unknown"},
    {t1: "or", seed: {}},
    {t1: "or", division: []},
    {t1: "or", division: {division: "missing", t: "azure"}},
    {t1: "or", division: {division: "perPale"}},
    {t1: "or", division: {division: "perPale", t: "azure", line: "missing"}},
    {t1: "or", charges: {}},
    {t1: "or", charges: [null]},
    {t1: "or", ordinaries: {}},
    {t1: "or", inscriptions: {}},
    {t1: "or", shield: "missing"},
    {t1: "or", diaper: "missing"},
    ...[
      "unknown-or-azure",
      "vair-or",
      "vair-or-azure-small-junk",
      "vair-or-azure-unknown",
      "semy-or-azure",
      "semy_of_missing-or-azure"
    ].map(t1 => ({t1})),
    ...[
      {charge: "missing"},
      {p: "!"},
      {p: 2},
      {t: {}},
      {outside: "missing"},
      {divided: "missing"},
      {sinister: "yes"},
      {x: null},
      {size: 0},
      {angle: Infinity},
      {stroke: {}}
    ].map(extra => ({t1: "or", charges: [{...charge, ...extra}]})),
    {t1: "or", ordinaries: [{ordinary: "fess", t: "azure", above: {}}]},
    {t1: "or", inscriptions: [{text: 1, font: "Arial"}]},
    {t1: "or", inscriptions: [{text: "hi", font: "unknown"}]},
    {t1: "or", inscriptions: [{text: "hi", font: "Arial", path: {}}]},
    {t1: "or", inscriptions: [{text: "hi", font: "Arial", shadow: null}]}
  ];
  for (const coa of invalid) {
    assert.throws(() => schema.normalizeCoa(coa), undefined, JSON.stringify(coa));
    assert.throws(() => api.normalizeCoa(coa), undefined, JSON.stringify(coa));
  }
  assert.throws(() => schema.parseCoa('{"t1":"or","__proto__":{}}'), /property/);
  assert.throws(() => schema.parseCoa("{"), /JSON/);
});

test("normalizes legacy defaults and numeric flags without mutating supplied data", () => {
  const legacy = {
    t1: "or",
    charges: [{charge: "eagle", t: "gules", sinister: 1, reversed: 0}],
    inscriptions: [{text: "Old & new <crest>", font: "Arial", bold: 1, shadow: {}}]
  };
  const original = structuredClone(legacy);
  const normalized = schema.normalizeCoa(legacy);
  assert.deepEqual(legacy, original);
  assert.equal(normalized.charges[0].p, "e");
  assert.equal(normalized.charges[0].sinister, true);
  assert.equal(normalized.charges[0].reversed, false);
  assert.deepEqual(normalized.inscriptions[0], {
    text: "Old & new <crest>",
    font: "Arial",
    bold: true,
    size: 20,
    color: "#000000",
    path: "M-50 0 L50 0",
    shadow: {x: 0, y: 0, blur: 0, color: "#333333"}
  });
  assert.deepEqual(api.parseCoa(JSON.stringify(legacy)), normalized);
  assert.deepEqual(schema.parseCoaImport(JSON.stringify([normalized])), [normalized]);
});

test("browser resources and compony are supported explicitly without widening API validation", () => {
  const coa = {
    t1: "localColor",
    charges: [{charge: "localCharge", t: "or"}],
    inscriptions: [{text: "local", font: "Local Font"}],
    ordinaries: [{ordinary: "fess", t: "azure", compony: 25}]
  };
  const options = {colors: {localColor: "#112233"}, uploaded: {localCharge: {}}, fonts: {"Local Font": {}}};
  assert.equal(schema.normalizeCoa(coa, options).charges[0].p, "e");
  assert.throws(() => api.normalizeCoa(coa));
  assert.throws(() => schema.normalizeCoa(coa));
  assert.throws(() => api.normalizeCoa({t1: "or", ordinaries: coa.ordinaries}), /Compony/);
  for (const compony of [-1, 1e-9, 4, 101])
    assert.throws(() => schema.normalizeCoa({t1: "or", ordinaries: [{ordinary: "fess", t: "or", compony}]}));
});

test("imports require a bounded non-empty array and validate every entry", () => {
  for (const value of [null, {}, true, 1, "text", [], [{t1: "or"}, {}]])
    assert.throws(() => schema.parseCoaImport(JSON.stringify(value)));
  assert.equal(schema.parseCoaImport(JSON.stringify(Array(64).fill({t1: "or"}))).length, 64);
  assert.throws(() => schema.parseCoaImport(JSON.stringify(Array(65).fill({t1: "or"}))), /Too many/);
  assert.throws(() => schema.parseCoaImport(" ".repeat(schema.IMPORT_LIMITS.bytes + 1)), /too large/);
  assert.throws(() => schema.parseCoaImport(JSON.stringify([{t1: "or", charges: Array(33).fill(charge)}])), /Too many/);
  assert.throws(() => schema.parseCoa(JSON.stringify({t1: "or"}).padEnd(limits.COA_LIMITS.coaBytes + 1)), /too large/);
});

test("all built-in charges and default tinctures remain valid", async () => {
  const {charges} = await server.ssrLoadModule("/src/lib/data/charges.js");
  const {DEFAULT_COLORS} = await server.ssrLoadModule("/src/lib/config/defaults.ts");
  for (const category of Object.keys(charges.types))
    for (const name of Object.keys(charges[category])) {
      schema.normalizeCoa({t1: "or", charges: [{...charge, charge: name}]});
      schema.normalizeCoa({t1: `semy_of_${name}-or-azure`});
    }
  for (const t1 of [...Object.keys(DEFAULT_COLORS), "#abc", "#123456", "vair-or-azure", "vair-or-azure-small"])
    schema.normalizeCoa({t1});
});
