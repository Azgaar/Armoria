import assert from "node:assert/strict";
import {after, before, test} from "node:test";
import {fileURLToPath} from "node:url";
import {createServer} from "vite";
import {svelte, vitePreprocess} from "@sveltejs/vite-plugin-svelte";

const root = fileURLToPath(new URL("../", import.meta.url));
let server, image, mutations, db, runtime;

// Compile the actual routes/components, replacing only external services and Kit's asset reader.
// No Mongo credentials, Chromium downloads, network listener, or live claims are needed.
const mocks = {
  "$app/env": "export const browser = false;",
  [root + "src/lib/server/env.ts"]: "export const env = {};",
  mongodb: `
    export const state = {created: 0, connects: 0, closes: 0, failConnect: false, failRead: false, options: null, uri: null};
    export class MongoClient {
      constructor(uri, options) { state.created++; state.options = options; state.uri = uri; }
      async connect() { state.connects++; await new Promise(resolve => setTimeout(resolve, 5)); if(state.failConnect) throw new Error('private-credentials'); }
      async close() { state.closes++; }
      db() { return {collection: () => ({findOne: async ({name}) => {
        if(state.failRead) throw new Error('private-credentials');
        return name === 'claimed' ? {coa: {t1: 'gules', shield: 'heater'}} : null;
      }})}; }
    }
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
  [root + "src/lib/api/raster.ts"]:
    `export const rasterizer = {async convert() {throw new Error("private conversion failure");}};`
};

before(async () => {
  server = await createServer({
    root,
    configFile: false,
    logLevel: "silent",
    ssr: {noExternal: ["mongodb"]},
    server: {middlewareMode: true, hmr: false, watch: null},
    optimizeDeps: {noDiscovery: true, include: []},
    resolve: {alias: {"#lib": root + "src/lib"}},
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
      svelte({configFile: false, preprocess: vitePreprocess()})
    ]
  });
  image = (await server.ssrLoadModule("/src/routes/api/+server.ts")).GET;
  mutations = await server.ssrLoadModule("/src/routes/api/claims/[name]/+server.ts");
  db = (await server.ssrLoadModule("mongodb")).state;
  runtime = (await server.ssrLoadModule(root + "src/lib/server/env.ts")).env;
});
after(async () => server?.close());

function request(params) {
  return image({url: new URL("https://example.test/api?" + new URLSearchParams({format: "svg", ...params}))});
}
async function unavailable(response) {
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), {error: "Claims are temporarily unavailable"});
}

test("claims connect only when needed, share connections, recover, and never substitute artwork on outage", async t => {
  t.mock.method(console, "log", () => {});
  t.mock.method(console, "error", () => {});
  assert.equal(db.created, 0, "loading actual image and mutation routes must not construct a client");
  for (const params of [{seed: "123"}, {}, {seed: "claimed", coa: JSON.stringify({t1: "or", shield: "heater"})}]) {
    const response = await request(params);
    assert.equal(response.status, 200);
    assert.match(await response.text(), /<svg/);
  }
  await unavailable(await request({seed: "claimed"}));
  await unavailable(
    await mutations.POST({
      params: {name: "claimed"},
      request: new Request("https://example.test/api/claims/claimed", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({coa: {t1: "or"}})
      })
    })
  );
  await unavailable(
    await mutations.DELETE({
      params: {name: "claimed"},
      request: new Request("https://example.test/api/claims/claimed", {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
        body: "{}"
      })
    })
  );
  assert.equal(db.created, 0);
  runtime.MONGO_ID = "user@host";
  runtime.MONGO_PASS = "secret:/?#";
  db.failConnect = true;
  const failures = await Promise.all([request({seed: "claimed"}), request({seed: "claimed"})]);
  for (const response of failures) await unavailable(response);
  assert.equal(db.connects, 1, "concurrent requests share one connection attempt");
  assert.equal(db.closes, 1, "failed clients are closed");
  assert.match(db.uri, /user%40host:secret%3A%2F%3F%23@/);
  assert.deepEqual(db.options, {serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000, timeoutMS: 10000});
  db.failConnect = false;
  const responses = await Promise.all([request({seed: "claimed"}), request({seed: "unclaimed"})]);
  for (const response of responses) assert.equal(response.status, 200);
  assert.equal(db.connects, 2, "a failed connection can be retried and the successful connection is shared");
  assert.match(await responses[0].text(), /fill="#d7374a"/);
  db.failRead = true;
  await unavailable(await request({seed: "claimed"}));
  assert.equal((await request({seed: "123"})).status, 200);
  db.failRead = false;
  assert.equal((await request({seed: "claimed"})).status, 200);
  assert.equal(db.connects, 2);
});
