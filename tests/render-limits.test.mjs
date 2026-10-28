import assert from "node:assert/strict";
import {after, before, beforeEach, test} from "node:test";
import {fileURLToPath} from "node:url";
import {createServer} from "vite";
import {svelte, vitePreprocess} from "@sveltejs/vite-plugin-svelte";

const root = fileURLToPath(new URL("../", import.meta.url));
let server, image, claims, generator, assets, png, jpeg, chromium, limits, validation, renderer;
const previousVercel = process.env.VERCEL;
const mocks = {
  "$app/environment": "export const browser = false;",
  [root + "src/lib/api/claims"]: `
    export let calls = 0, stored = null;
    export function reset() { calls = 0; stored = null; }
    export function setStored(value) { stored = {coa:value}; }
    export async function getClaim() { calls++; return stored; }
  `,
  [root + "src/lib/scripts/generator"]: `
    export let calls = 0;
    export function reset() { calls = 0; }
    export function generate() { calls++; return {t1:'or'}; }
  `,
  "$app/server": `
    import {readFileSync} from 'node:fs';
    export let calls = 0;
    export function reset() { calls = 0; }
    export function read(url) { calls++; return new Response(readFileSync(${JSON.stringify(root)} + url.replace(/^\\//, ''))); }
  `,
  "@sparticuz/chromium-min": `
    export let calls = 0;
    export function reset() { calls = 0; }
    export default {args:[], async executablePath() { calls++; return 'unused-browser'; }};
  `
};
for (const format of ["png", "jpeg"]) {
  mocks[`convert-svg-to-${format}`] = `
    export const inputs = [];
    export function reset() { inputs.length = 0; }
    export async function createConverter() { return {convert: async svg => { inputs.push(svg); return Buffer.from('test-image'); }}; }
  `;
}

before(async () => {
  process.env.VERCEL = "1";
  server = await createServer({
    root,
    configFile: false,
    logLevel: "silent",
    server: {middlewareMode: true, hmr: false, watch: null},
    optimizeDeps: {noDiscovery: true, include: []},
    ssr: {noExternal: ["@sparticuz/chromium-min", "convert-svg-to-png", "convert-svg-to-jpeg"]},
    resolve: {alias: {$lib: root + "src/lib"}},
    plugins: [
      {
        name: "limits-test-services",
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
  claims = await server.ssrLoadModule(root + "src/lib/api/claims");
  generator = await server.ssrLoadModule(root + "src/lib/scripts/generator");
  assets = await server.ssrLoadModule("$app/server");
  png = await server.ssrLoadModule("convert-svg-to-png");
  jpeg = await server.ssrLoadModule("convert-svg-to-jpeg");
  chromium = await server.ssrLoadModule("@sparticuz/chromium-min");
  limits = await server.ssrLoadModule("/src/lib/api/limits.ts");
  validation = await server.ssrLoadModule("/src/lib/api/validation.ts");
  renderer = await server.ssrLoadModule("/src/lib/api/renderer.js");
  assert.equal(chromium.calls, 0, "module import must not download Chromium");
});
after(async () => {
  if (previousVercel === undefined) delete process.env.VERCEL;
  else process.env.VERCEL = previousVercel;
  await server?.close();
});
beforeEach(t => {
  for (const mock of [claims, generator, assets, png, jpeg, chromium]) mock.reset();
  t.mock.method(globalThis, "fetch", async () => new Response(Buffer.from("font-fixture")));
  t.mock.method(console, "error", () => {});
});

function event(params = {}, coa) {
  const url = new URL("https://example.com/api");
  url.search = new URLSearchParams(params);
  if (coa !== undefined) url.searchParams.set("coa", typeof coa === "string" ? coa : JSON.stringify(coa));
  return {url};
}
async function expectError(response, status) {
  assert.equal(response.status, status);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.match(response.headers.get("content-type"), /application\/json/);
  const body = await response.json();
  assert.deepEqual(Object.keys(body), ["error"]);
  assert.doesNotMatch(body.error, /<|>|private|onerror/);
}
function noWork({lookup = false} = {}) {
  assert.equal(generator.calls, 0);
  if (!lookup) assert.equal(claims.calls, 0);
  assert.equal(assets.calls, 0);
  assert.equal(fetch.mock.calls.length, 0);
  assert.equal(chromium.calls, 0);
  assert.equal(png.inputs.length + jpeg.inputs.length, 0);
}
const charge = {charge: "eagle", t: "gules", p: "e"};
const inscription = {text: "safe", font: "Arial", path: "M0 0L100 0", size: 12};

test("invalid dimensions fail before generation, database, assets, fonts, or conversion", async () => {
  for (const size of [
    "0",
    "-1",
    "1.5",
    "500.0",
    "NaN",
    "Infinity",
    "-Infinity",
    "1e9",
    "0x100",
    "",
    " ",
    "1000000000",
    "4097",
    "0px",
    "-2px",
    "12pxjunk",
    "500PX",
    "9".repeat(400)
  ]) {
    for (const format of ["svg", "png", "jpeg"]) await expectError(await image(event({size, format, seed: "name"})), 400);
  }
  noWork();
});

test("formats, duplicate parameters, and URL size are rejected before rendering work", async () => {
  for (const format of ["", "gif", "SVG", "<script>"]) await expectError(await image(event({format})), 400);
  for (const name of ["format", "size", "seed", "coa"]) {
    const input = event();
    input.url.searchParams.append(name, "1");
    input.url.searchParams.append(name, "2");
    await expectError(await image(input), 400);
  }
  await expectError(await image(event({unused: "x".repeat(limits.API_LIMITS.urlBytes)})), 414);
  await expectError(await image(event({seed: "a".repeat(201)})), 413);
  noWork();
});

test("malformed and oversized COAs never reach assets, fonts, or converters", async () => {
  for (const coa of ["{", "null", "[]", '{"t1":"or","zoom":1e999}'])
    await expectError(await image(event({format: "png"}, coa)), 400);
  await expectError(await image(event({}, " ".repeat(limits.API_LIMITS.coaBytes + 1))), 413);
  const cases = [
    {t1: "or", charges: Array(33).fill(charge)},
    {t1: "or", ordinaries: Array(17).fill({ordinary: "fess", t: "gules"})},
    {t1: "or", inscriptions: Array(17).fill(inscription)},
    {t1: "or", inscriptions: [{...inscription, text: "x".repeat(1025)}]},
    {t1: "or", inscriptions: [{...inscription, path: "M".repeat(4097)}]},
    {
      t1: "or",
      inscriptions: Array.from({length: 9}, (_, i) => ({
        ...inscription,
        font: ["Arial", "Georgia", "Verdana", "Impact", "Papyrus", "Garamond", "Copperplate", "Herculanum", "Cinzel"][i]
      }))
    },
    {t1: "or", charges: Array(9).fill({...charge, p: "abcdefghijklmnopqyzABCDEFGHIJKL"})},
    {t1: "or", metadata: "x".repeat(4097)},
    {t1: "or", metadata: Array(65).fill(1)},
    {t1: "or", metadata: Object.fromEntries(Array.from({length: 65}, (_, i) => [i, 0]))},
    {t1: "or", metadata: Array.from({length: 33}, () => Array(64).fill(0))},
    {t1: "or", metadata: Array(9).fill("x".repeat(4000))}
  ];
  let nested = {};
  for (let i = 0; i < 10; i++) nested = {nested};
  cases.push({t1: "or", nested});
  for (const coa of cases) await expectError(await image(event({format: "png"}, coa)), 413);
  noWork();
});

test("numeric rendering controls cannot trigger huge loops, non-finite transforms, or filters", async () => {
  const cases = [
    {t1: "or", zoom: 1e-100},
    ...[1e9, -1, 1.5, 2, 3, 101, "8", null].map(gyronny => ({t1: "or", ordinaries: [{ordinary: "bordure", t: "or", gyronny}]})),
    ...[1e-100, 25, "25", -1].map(compony => ({t1: "or", ordinaries: [{ordinary: "bordure", t: "or", compony}]})),
    {t1: "or", charges: [{...charge, size: 1e200}]},
    {t1: "or", charges: [{...charge, stretch: "999999999"}]},
    {t1: "or", inscriptions: [{...inscription, size: 1e200}]},
    {t1: "or", inscriptions: [{...inscription, shadow: {blur: 1e200}}]}
  ];
  for (const coa of cases) await expectError(await image(event({format: "png"}, coa)), 400);
  noWork();
});

test("stored claims and direct renderer calls cannot bypass complexity and size checks", async () => {
  claims.setStored({t1: "or", charges: Array.from({length: 33}, () => ({...charge}))});
  await expectError(await image(event({seed: "stored"})), 413);
  noWork({lookup: true});
  await assert.rejects(renderer.render({t1: "or"}, 1e9, {}), /Size must/);
  const cyclic = {t1: "or"};
  cyclic.extra = cyclic;
  assert.throws(() => validation.validateCoa(cyclic), /cyclic/);
  noWork({lookup: true});
});

test("valid SVG dimensions include boundaries, defaults, and the legacy lowercase px suffix", async () => {
  for (const [size, expected] of [
    [undefined, 500],
    ["1", 1],
    ["4096", 4096],
    ["400px", 400],
    ["00400", 400]
  ]) {
    const response = await image(event(size === undefined ? {} : {size}, {t1: "or"}));
    assert.equal(response.status, 200);
    const svg = await response.text();
    assert.match(svg, new RegExp(`width="${expected}"`));
    assert.match(svg, new RegExp(`height="${expected}"`));
  }
  assert.equal(chromium.calls, 0);
});

test("accepted raster requests pass bounded dimensions to mocked converters without allocating images", async () => {
  for (const format of ["png", "jpg", "jpeg"]) {
    const response = await image(event({format, size: "4096px"}, {t1: "or"}));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), format === "png" ? "image/png" : "image/jpeg");
  }
  assert.equal(png.inputs.length, 1);
  assert.equal(jpeg.inputs.length, 2);
  for (const svg of [...png.inputs, ...jpeg.inputs]) assert.match(svg, /width="4096" height="4096"/);
});

test("collection boundaries and normal editor controls remain valid", async () => {
  validation.validateCoa({
    t1: "or",
    zoom: 0.1,
    charges: Array.from({length: 32}, () => ({...charge, size: 5, stretch: 10})),
    ordinaries: Array.from({length: 16}, () => ({ordinary: "fess", t: "gules"}))
  });
  const response = await image(event({}, {t1: "or", ordinaries: [{ordinary: "bordure", t: "gules", t2: "or", gyronny: 100}]}));
  assert.equal(response.status, 200);
  assert.equal((await response.text()).match(/<polygon/g).length, 50);
});

test("repeated inscriptions load each configured font only once", async () => {
  const {DEFAULT_FONTS} = await server.ssrLoadModule("/src/lib/config/defaults.ts");
  const font = Object.keys(DEFAULT_FONTS).find(name => DEFAULT_FONTS[name].url);
  const response = await image(event({}, {t1: "or", inscriptions: Array(16).fill({...inscription, font})}));
  assert.equal(response.status, 200);
  assert.equal(fetch.mock.calls.length, 1);
});

test("a deterministic sample of generated COAs stays within the limits", async () => {
  // Explicit .js bypasses only the route's generation spy; exercise the real generator.
  const {generate} = await server.ssrLoadModule("/src/lib/scripts/generator.js");
  const random = Math.random;
  try {
    let nontrivial = 0;
    for (let i = 0; i < 250; i++) {
      const coa = generate(String(i));
      validation.validateCoa(coa);
      if (coa.charges || coa.division || coa.ordinaries) nontrivial++;
    }
    assert.ok(nontrivial > 0, "exercise the real generator, not the route spy");
  } finally {
    Math.random = random;
  }
});

test("byte and depth boundaries accept the maximum and reject one over", async () => {
  const json = JSON.stringify({t1: "or"});
  assert.equal(validation.parseCoa(json.padEnd(limits.API_LIMITS.coaBytes)).t1, "or");
  assert.throws(() => validation.parseCoa(json.padEnd(limits.API_LIMITS.coaBytes + 1)), /payload is too large/);
  validation.validateCoa({t1: "or", metadata: "é".repeat(2048)});
  assert.throws(() => validation.validateCoa({t1: "or", metadata: "é".repeat(2049)}), /text is too long/);
  let nested = 0;
  for (let i = 0; i < 7; i++) nested = {nested};
  validation.validateCoa({t1: "or", nested});
  assert.throws(() => validation.validateCoa({t1: "or", nested: {nested}}), /too complex/);
  const response = await image(event({seed: "é".repeat(200)}, {t1: "or"}));
  assert.equal(response.status, 200);
});
