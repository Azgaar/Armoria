import assert from "node:assert/strict";
import {after, before, beforeEach, test} from "node:test";
import {fileURLToPath} from "node:url";
import {createServer} from "vite";
import {svelte, vitePreprocess} from "@sveltejs/vite-plugin-svelte";
import {parse} from "node-html-parser";

const root = fileURLToPath(new URL("../", import.meta.url));
let server, image, legacyImage, claim, unclaim, claims, assets;

// Compile the actual routes/components, replacing only external services and Kit's asset reader.
// No Mongo credentials, Chromium downloads, network listener, or live claims are needed.
const mocks = {
  "$app/environment": "export const browser = false;",
  "$env/static/private": 'export const MASTER_KEY = "test-master";',
  [root + "src/lib/api/claims"]: `
    export const records = new Map();
    export const mutations = [];
    export let unavailable = false;
    export function reset() { records.clear(); mutations.length = 0; unavailable = false; }
    export function fail() { unavailable = true; }
    export async function getClaim(name) {
      if (unavailable) throw new Error('<script>private database failure</script>');
      return records.get(name);
    }
    export async function setClaim(value) { records.set(value.name, value); mutations.push('insert'); }
    export async function reclaim(value) { records.set(value.name, value); mutations.push('update'); }
    export async function unclaim(name) { records.delete(name); mutations.push('delete'); }
  `,
  "$app/server": `
    import {readFileSync} from 'node:fs';
    export let unavailable = false;
    export function setUnavailable(value) { unavailable = value; }
    export function read(url) {
      if (unavailable) throw new Error('<script>private asset failure</script>');
      return new Response(readFileSync(${JSON.stringify(root)} + url.replace(/^\\//, '')));
    }
  `,
  "@sparticuz/chromium-min": 'export default {args: [], executablePath: async () => "unused-test-browser"};',
  "convert-svg-to-png":
    'export async function createConverter() { return {convert: async () => {throw new Error("private conversion failure");}}; }',
  "convert-svg-to-jpeg":
    'export async function createConverter() { return {convert: async () => {throw new Error("private conversion failure");}}; }'
};

before(async () => {
  server = await createServer({
    root,
    configFile: false,
    logLevel: "silent",
    server: {middlewareMode: true, hmr: false, watch: null},
    optimizeDeps: {noDiscovery: true, include: []},
    resolve: {alias: {$lib: root + "src/lib"}},
    plugins: [
      {
        name: "api-test-services",
        enforce: "pre",
        resolveId(id) {
          if (Object.hasOwn(mocks, id)) return "\0test:" + id;
        },
        load(id) {
          if (id.startsWith("\0test:")) return mocks[id.slice(6)];
        }
      },
      svelte({configFile: false, preprocess: vitePreprocess(), hot: false})
    ]
  });
  image = (await server.ssrLoadModule("/src/routes/api/+server.ts")).GET;
  legacyImage = (await server.ssrLoadModule("/src/routes/api/[format]/[size]/[[seed]]/+server.ts")).GET;
  claim = (await server.ssrLoadModule("/src/routes/api/claim/[name]/[coa]/[[key]]/+server.ts")).GET;
  unclaim = (await server.ssrLoadModule("/src/routes/api/unclaim/[name]/[[key]]/+server.ts")).GET;
  claims = await server.ssrLoadModule(root + "src/lib/api/claims");
  assets = await server.ssrLoadModule("$app/server");
});

after(async () => {
  await server?.close();
});
beforeEach(context => {
  claims.reset();
  assets.setUnavailable(false);
  context.mock.method(console, "log", () => {});
  context.mock.method(console, "error", () => {});
});

function imageEvent(coa, extra = {}) {
  const url = new URL("https://example.com/api");
  url.search = new URLSearchParams({seed: "123", coa: typeof coa === "string" ? coa : JSON.stringify(coa), ...extra});
  return {url};
}

function claimEvent(name, coa = {t1: "or"}, key) {
  return {
    url: new URL("https://example.com/api/claim"),
    params: {name, coa: typeof coa === "string" ? coa : JSON.stringify(coa), key}
  };
}

async function expectError(response, status) {
  assert.equal(response.status, status);
  assert.match(response.headers.get("content-type"), /^application\/json/);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("cache-control"), "no-store");
  const body = await response.json();
  assert.deepEqual(Object.keys(body), ["error"]);
  assert.equal(typeof body.error, "string");
  assert.doesNotMatch(body.error, /<|>|private|onerror|onload/);
}

function expectInertMarkup(body) {
  const document = parse(body);
  assert.equal(document.querySelectorAll("script, img, iframe, foreignobject").length, 0);
  for (const element of document.querySelectorAll("*")) {
    assert.ok(
      Object.keys(element.attributes).every(name => !/^on/i.test(name)),
      element.outerHTML
    );
  }
  return document;
}

test("invalid COAs return inert 400 JSON without echoing supplied markup", async () => {
  for (const coa of [
    "{",
    "",
    "null",
    "[]",
    "{}",
    "42",
    {t1: "or", shield: "missing", name: "<img src=x onerror=alert(1)>"},
    {t1: "or", division: {division: "missing", t: "azure"}},
    {t1: "or", charges: {}},
    {t1: "or", ordinaries: [null]},
    {t1: "or", inscriptions: [{text: 7}]},
    {t1: "semy-or-azure"},
    {t1: "or", charges: [{charge: "<script>alert(1)</script>", t: "azure", p: "e"}]}
  ])
    await expectError(await image(imageEvent(coa)), 400);
  await expectError(await image(imageEvent({t1: "or"}, {format: "invalid"})), 400);
});

test("unexpected database, asset, and conversion failures return generic 500 JSON", async () => {
  claims.fail();
  await expectError(await image({url: new URL("https://example.com/api?seed=claimed-name")}), 500);
  claims.reset();
  assets.setUnavailable(true);
  await expectError(await image(imageEvent({t1: "or", charges: [{charge: "eagle", t: "gules", p: "e"}]})), 500);
  assets.setUnavailable(false);
  await expectError(await image(imageEvent({t1: "or"}, {format: "png"})), 500);
});

test("seed markup cannot escape generated SVG identifiers", async () => {
  const response = await image(
    imageEvent(
      {t1: "or", division: {division: "perPale", t: "azure"}},
      {
        seed: '1"><script>alert(1)</script><g/id="'
      }
    )
  );
  assert.equal(response.status, 200);
  const body = await response.text();
  const document = expectInertMarkup(body);
  const ids = document.querySelectorAll("clippath").map(element => element.getAttribute("id"));
  assert.equal(ids.length, 2);
  assert.ok(ids.every(id => /^(shield|division)_[0-9a-f]{64}$/.test(id)));
  for (const id of ids) assert.ok(body.includes(`url(#${id})`));
});

test("invalid pattern attributes are rejected and non-hex palette overrides are ignored", async () => {
  const response = await image(imageEvent({t1: 'vair-#123456" onload="alert(1)-or'}));
  await expectError(response, 400);

  const recoloured = await image(imageEvent({t1: "chequy-gules-or"}, {gules: '"a><b?'}));
  assert.equal(recoloured.status, 200);
  const body = await recoloured.text();
  expectInertMarkup(body);
  assert.ok(body.includes("#d7374a"));
});

test("valid SVGs preserve charges, hex patterns, and escaped names and inscriptions", async () => {
  const text = 'A & B < C, "quoted" and O\'Brien';
  const response = await image(
    imageEvent({
      t1: "vair-#123456-or",
      name: text,
      shield: "heater",
      charges: [{charge: "eagle", t: "gules", p: "e"}],
      inscriptions: [{text, font: "Arial", size: 12, path: "M0 0 L100 0"}]
    })
  );
  assert.equal(response.status, 200);
  const document = expectInertMarkup(await response.text());
  assert.ok(document.querySelector("#eagle"));
  assert.ok(document.querySelector('[id="vair-123456-or"]'));
  assert.ok(document.querySelector("textpath").text.includes(text));
});

test("legacy claim routes return inert retirement errors without database access", async () => {
  claims.fail();
  for (const route of [claim, unclaim]) {
    const response = await route(claimEvent("<img/src=x/onerror=alert(1)>", "{", "private-password"));
    await expectError(response, 410);
  }
  assert.deepEqual(claims.mutations, []);
});

function expectResolvedReferences(document) {
  const ids = document.querySelectorAll("[id]").map(element => element.getAttribute("id"));
  assert.equal(new Set(ids).size, ids.length, "definitions must not have duplicate IDs");
  for (const element of document.querySelectorAll("*")) {
    for (const [name, value] of Object.entries(element.attributes)) {
      if (["href", "xlink:href"].includes(name) && value.startsWith("#"))
        assert.ok(ids.includes(value.slice(1)), `Missing ${value}`);
      for (const match of value.matchAll(/url\(#([^)]*)\)/g)) assert.ok(ids.includes(match[1]), `Missing ${match[1]}`);
    }
  }
}

test("generic and named inescutcheons use the effective shield and retain camel-case identifiers", async () => {
  const {shields, charges} = await server.ssrLoadModule("/src/lib/data/dataModel.js");
  const fixtures = [
    {charge: "inescutcheon", shield: undefined, expected: "heater"},
    ...Object.keys(shields.data).map(shield => ({charge: "inescutcheon", shield, expected: shield})),
    ...Object.keys(charges.inescutcheon).map(charge => ({
      charge,
      shield: "heater",
      expected: charge.slice(12, 13).toLowerCase() + charge.slice(13)
    }))
  ];
  for (const {charge, shield, expected} of fixtures) {
    const response = await image(imageEvent({t1: "or", ...(shield ? {shield} : {}), charges: [{charge, t: "gules", p: "e"}]}));
    assert.equal(response.status, 200, `${charge} on ${shield}`);
    const document = parse(await response.text());
    const id = charge === "inescutcheon" ? "inescutcheon" + expected[0].toUpperCase() + expected.slice(1) : charge;
    const path = document.querySelector(`#${id} path`);
    assert.ok(path, id);
    assert.equal(path.getAttribute("d"), shields.data[expected].path);
    assert.equal(path.getAttribute("transform"), "translate(67 67) scale(.33)", "match browser geometry");
    expectResolvedReferences(document);
  }
});

test("patterns and their semy charges are collected from every supported tincture slot", async () => {
  const fixture = {
    t1: "semy_of_roundel-argent-azure",
    division: {division: "perPale", t: "semy_of_mullet-or-azure"},
    ordinaries: [{ordinary: "bordure", t: "semy_of_lozenge-gules-or", t2: "semy_of_annulet-azure-or", gyronny: 8}],
    charges: [
      {charge: "arbalest", t: "semy_of_crescent-or-gules", t2: "vair-#123456-or", t3: "semy_of_fleurDeLis-argent-gules", p: "e"}
    ]
  };
  const response = await image(imageEvent(fixture));
  assert.equal(response.status, 200);
  const document = parse(await response.text());
  for (const id of ["roundel", "mullet", "lozenge", "annulet", "crescent", "fleurDeLis", "arbalest"])
    assert.ok(document.querySelector(`#${id}`), id);
  assert.equal(document.querySelectorAll("pattern").length, 7);
  expectResolvedReferences(document);
});

test("repeated semy dependencies and generic inescutcheons resolve once per SVG", async () => {
  const pattern = "semy_of_inescutcheon-or-azure";
  const response = await image(
    imageEvent({
      t1: pattern,
      shield: "oldFrench",
      division: {division: "perPale", t: pattern},
      ordinaries: [{ordinary: "fess", t: "semy_of_inescutcheonOldFrench-gules-or"}],
      charges: [
        {charge: "inescutcheon", t: pattern, p: "e"},
        {charge: "inescutcheonOldFrench", t: "or", p: "a"}
      ]
    })
  );
  assert.equal(response.status, 200);
  const document = parse(await response.text());
  assert.equal(document.querySelectorAll('[id="inescutcheonOldFrench"]').length, 1);
  assert.equal(document.querySelectorAll("pattern").length, 2);
  expectResolvedReferences(document);
});

function legacyEvent({size = "200px", format = "svg", seed = "123", query = {}} = {}) {
  const url = new URL(
    `https://example.com/api/${encodeURIComponent(format)}/${encodeURIComponent(size)}${seed === null ? "" : "/" + encodeURIComponent(seed)}`
  );
  url.search = new URLSearchParams(query).toString();
  return {url, params: {format, size, ...(seed === null ? {} : {seed})}};
}
async function followLegacy(event) {
  const redirect = await legacyImage(event);
  assert.equal(redirect.status, 301);
  const target = new URL(redirect.headers.get("location"), event.url);
  assert.equal(target.origin, event.url.origin);
  assert.equal(target.pathname, "/api");
  const response = await image({url: target});
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /^image\/svg\+xml/);
  return {target, document: parse(await response.text())};
}
function expectDimensions(document, size) {
  const svg = document.querySelector("svg");
  assert.equal(svg.getAttribute("width"), String(size));
  assert.equal(svg.getAttribute("height"), String(size));
}

test("legacy redirects render the requested px dimensions, palette and COA without corrupting query text", async () => {
  claims.fail(); // An explicit COA must bypass claim lookup even with a nonnumeric seed.
  const coa = {t1: "gules", shield: "oldFrench", name: "A & B + # % 東京"};
  const {target, document} = await followLegacy(
    legacyEvent({
      seed: "not-a-claim",
      query: {coa: JSON.stringify(coa), gules: "123456"}
    })
  );
  assert.equal(target.searchParams.get("size"), "200");
  assert.equal(target.searchParams.get("coa"), JSON.stringify(coa));
  expectDimensions(document, 200);
  assert.equal(document.querySelector(".field").getAttribute("fill"), "#123456");
  assert.equal(JSON.parse(document.querySelector("svg").getAttribute("data-coa")).name, coa.name);
  const {shields} = await server.ssrLoadModule("/src/lib/data/shields.ts");
  assert.equal(document.querySelector("clippath path").getAttribute("d"), shields.data.oldFrench.path);
});

test("legacy path format, size and seed take precedence over conflicting query parameters", async () => {
  claims.records.set("path-seed", {coa: {t1: "gules"}});
  claims.records.set("query-seed", {coa: {t1: "azure"}});
  const {target, document} = await followLegacy(
    legacyEvent({
      seed: "path-seed",
      size: "00200px",
      query: {format: "png", size: "40", seed: "query-seed", gules: "abcdef"}
    })
  );
  assert.equal(target.searchParams.get("format"), "svg");
  assert.equal(target.searchParams.get("seed"), "path-seed");
  assert.equal(target.searchParams.get("size"), "200");
  expectDimensions(document, 200);
  assert.equal(document.querySelector(".field").getAttribute("fill"), "#abcdef");
});

test("a query seed is retained when the legacy path omits it, and both forms may omit the seed", async () => {
  claims.records.set("query-seed", {coa: {t1: "gules"}});
  const {target, document} = await followLegacy(legacyEvent({seed: null, query: {seed: "query-seed", gules: "123456"}}));
  assert.equal(target.searchParams.get("seed"), "query-seed");
  expectDimensions(document, 200);
  assert.equal(document.querySelector(".field").getAttribute("fill"), "#123456");
  const random = await followLegacy(legacyEvent({seed: null}));
  assert.equal(random.target.searchParams.has("seed"), false);
  expectDimensions(random.document, 200);
});

test("shield queries override inline, claimed and generated artwork without mutating stored claims", async () => {
  const {shields} = await server.ssrLoadModule("/src/lib/data/shields.ts");
  const stored = {coa: {t1: "gules", shield: "heater"}};
  claims.records.set("claimed", stored);
  const fixtures = [
    {seed: "123", query: {coa: JSON.stringify(stored.coa), shield: "oldFrench"}},
    {seed: "claimed", query: {shield: "oldFrench"}},
    {seed: "123", query: {shield: "oldFrench"}}
  ];
  for (const fixture of fixtures) {
    const {target, document} = await followLegacy(legacyEvent(fixture));
    assert.equal(target.searchParams.get("shield"), "oldFrench");
    assert.equal(document.querySelector("clippath path").getAttribute("d"), shields.data.oldFrench.path);
    expectDimensions(document, 200);
  }
  assert.equal(stored.coa.shield, "heater");
});

test("legacy invalid sizes and formats return the same safe errors as the canonical endpoint", async () => {
  for (const size of [
    "0",
    "-1",
    "1.5",
    "500.0",
    "Infinity",
    "NaN",
    "1e3",
    "0x100",
    "",
    " ",
    "4097",
    "0px",
    "-2px",
    "12pxjunk",
    "500PX"
  ]) {
    const redirected = await legacyImage(legacyEvent({size}));
    const direct = await image(imageEvent({t1: "or"}, {size}));
    assert.equal(redirected.headers.has("location"), false);
    assert.deepEqual(await redirected.clone().json(), await direct.json(), size);
    await expectError(redirected, 400);
  }
  for (const format of ["gif", "SVG", "", "<script>"]) await expectError(await legacyImage(legacyEvent({format})), 400);
  for (const size of ["1px", "4096px"]) {
    const {document} = await followLegacy(legacyEvent({size, query: {coa: JSON.stringify({t1: "or"})}}));
    expectDimensions(document, Number(size.slice(0, -2)));
  }
});

test("legacy redirects reject duplicates and unsafe request sizes before path values can conceal them", async () => {
  for (const key of ["format", "size", "seed", "coa", "shield"]) {
    const query = new URLSearchParams([
      [key, "a"],
      [key, "b"]
    ]);
    await expectError(await legacyImage(legacyEvent({query})), 400);
  }
  await expectError(await legacyImage(legacyEvent({query: {ignored: "x".repeat(65536)}})), 414);
  await expectError(await legacyImage(legacyEvent({seed: "x".repeat(201)})), 413);
  await expectError(await legacyImage(legacyEvent({seed: null, query: {seed: "x".repeat(201)}})), 413);
  for (const shield of ["", "missing", "__proto__", "constructor", "<script>"])
    await expectError(await legacyImage(legacyEvent({query: {shield}})), 400);
  await expectError(await image(imageEvent({t1: "or"}, {shield: "missing"})), 400);
});
