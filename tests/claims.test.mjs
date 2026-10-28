import assert from "node:assert/strict";
import {after, before, beforeEach, test} from "node:test";
import {fileURLToPath} from "node:url";
import {inspect} from "node:util";
import {createServer} from "vite";

const root = fileURLToPath(new URL("../", import.meta.url));
let server, routes, database, passwords, env, renderer, connector;
const secrets = ["owner-secret", "wrong-secret", "master-secret"];
const mocks = {
  "$app/environment": "export const browser = false;",
  "$env/static/private": 'export const MONGO_ID = "test"; export const MONGO_PASS = "test";',
  "$env/dynamic/private": 'export const env = {MASTER_KEY: "master-secret"};',
  [root + "src/lib/api/renderer"]: `
    export let fail = false, calls = 0;
    export function setFail(value) { fail = value; calls = 0; }
    export async function render() { calls++; if(fail) throw new Error("owner-secret wrong-secret master-secret"); return '<svg/>'; }
  `,
  mongodb: `
    export const records = new Map();
    export const operations = [];
    export let fail = false, conflict = false;
    export function setFail(value) { fail = value; }
    export function setConflict(value) { conflict = value; }
    export function reset() { records.clear(); operations.length = 0; fail = false; conflict = false; }
    function check() { if(fail) throw new Error("owner-secret wrong-secret master-secret"); }
    function matches(record, filter) {
      return record && Object.entries(filter).every(([key, value]) => {
        if (value && typeof value === 'object' && '$exists' in value) return Object.hasOwn(record, key) === value.$exists;
        return record[key] === value;
      });
    }
    const collection = {
      async findOne(query) { check(); return structuredClone(records.get(query.name) || null); },
      async insertOne(record) {
        check();
        if (records.has(record.name) || conflict) throw Object.assign(new Error('owner-secret'), {code:11000});
        records.set(record.name, structuredClone(record)); operations.push(['insert', structuredClone(record)]);
        return {acknowledged:true, insertedId:record._id};
      },
      async updateOne(filter, update) {
        check(); operations.push(['update', structuredClone(filter), structuredClone(update)]);
        const record = records.get(filter.name);
        if(conflict || !matches(record, filter)) return {matchedCount:0};
        Object.assign(record, update.$set);
        for(const key of Object.keys(update.$unset || {})) delete record[key];
        return {matchedCount:1};
      },
      async deleteOne(filter) {
        check(); operations.push(['delete', structuredClone(filter)]);
        if(conflict || !matches(records.get(filter.name), filter)) return {deletedCount:0};
        records.delete(filter.name); return {deletedCount:1};
      }
    };
    export class MongoClient { async connect() {} db() { return {collection: () => collection}; } }
  `
};

before(async () => {
  server = await createServer({
    root,
    configFile: false,
    logLevel: "silent",
    ssr: {noExternal: ["mongodb"]},
    server: {middlewareMode: true, hmr: false, watch: null},
    optimizeDeps: {noDiscovery: true, include: []},
    resolve: {alias: {$lib: root + "src/lib"}},
    plugins: [
      {
        name: "claims-test-services",
        enforce: "pre",
        resolveId(id) {
          if (Object.hasOwn(mocks, id)) return "\0test:" + id;
        },
        load(id) {
          if (id.startsWith("\0test:")) return mocks[id.slice(6)];
        }
      }
    ]
  });
  routes = await server.ssrLoadModule("/src/routes/api/claims/[name]/+server.ts");
  database = await server.ssrLoadModule("mongodb");
  passwords = await server.ssrLoadModule("/src/lib/server/claimPasswords.ts");
  ({env} = await server.ssrLoadModule("$env/dynamic/private"));
  renderer = await server.ssrLoadModule(root + "src/lib/api/renderer");
  connector = await server.ssrLoadModule("/src/lib/api/dbConnector.ts");
});
after(async () => server?.close());
beforeEach(t => {
  database.reset();
  renderer.setFail(false);
  env.MASTER_KEY = "master-secret";
  t.mock.method(console, "log", () => {});
  t.mock.method(console, "error", () => {});
});

function request(method, body = {}, {name = "example", authorization, raw, query = "", contentType = "application/json"} = {}) {
  const headers = {"content-type": contentType};
  if (authorization !== undefined) headers.authorization = authorization;
  return routes[method]({
    params: {name},
    request: new Request(`https://example.test/api/claims/${encodeURIComponent(name)}${query}`, {
      method,
      headers,
      body: raw ?? JSON.stringify(body)
    })
  });
}
function putLegacy(key = "owner-secret") {
  database.records.set("example", {_id: "legacy-id", name: "example", coa: {t1: "or"}, key});
}
async function expectResponse(response, status) {
  assert.equal(response.status, status);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.match(response.headers.get("content-type"), /application\/json/);
  const text = await response.text();
  for (const secret of secrets) assert.ok(!text.includes(secret));
  assert.doesNotMatch(text, /keyHash|scrypt\$/);
  return JSON.parse(text);
}

function assertSecretFreeLogs() {
  for (const method of [console.log, console.error]) {
    const text = inspect(method.mock.calls.map(call => call.arguments));
    for (const secret of secrets) assert.ok(!text.includes(secret), text);
  }
}

test("new protected claims use salted hashes and authenticate subsequent updates/deletes", async () => {
  await expectResponse(await request("POST", {coa: {t1: "or"}, key: "owner-secret"}), 201);
  const record = database.records.get("example");
  assert.equal(record.key, undefined);
  assert.match(record.keyHash, /^scrypt\$131072\$8\$1\$/);
  assert.equal(await passwords.verifyClaimPassword("owner-secret", record.keyHash), true);
  const firstHash = record.keyHash;
  await expectResponse(await request("POST", {coa: {t1: "azure"}, key: "wrong-secret"}), 403);
  await expectResponse(await request("DELETE", {}), 403);
  await expectResponse(await request("POST", {coa: {t1: "azure"}, key: "owner-secret"}), 200);
  assert.equal(database.records.get("example").keyHash, firstHash);
  assert.equal(database.records.get("example").coa.t1, "azure");
  await expectResponse(await request("DELETE", {key: "owner-secret"}), 200);
  assert.equal(database.records.has("example"), false);
  assertSecretFreeLogs();
});

test("legacy owner authorization migrates plaintext atomically and preserves its password", async () => {
  putLegacy();
  await expectResponse(await request("POST", {coa: {t1: "azure"}, key: "wrong-secret"}), 403);
  assert.equal(database.operations.length, 0);
  assert.equal(database.records.get("example").key, "owner-secret");
  await expectResponse(await request("POST", {coa: {t1: "azure"}, key: "owner-secret"}), 200);
  const record = database.records.get("example");
  assert.equal(Object.hasOwn(record, "key"), false);
  assert.equal(await passwords.verifyClaimPassword("owner-secret", record.keyHash), true);
  const [operation, filter, update] = database.operations[0];
  assert.equal(operation, "update");
  assert.equal(filter._id, "legacy-id");
  assert.equal(filter.key, "owner-secret");
  assert.deepEqual(filter.keyHash, {$exists: false});
  assert.deepEqual(update.$unset, {key: ""});
  assertSecretFreeLogs();
});

test("administrator uses a bearer header and migration retains the owner's password", async () => {
  putLegacy();
  await expectResponse(await request("POST", {coa: {t1: "azure"}, key: "master-secret"}), 403);
  await expectResponse(await request("POST", {coa: {t1: "azure"}}, {authorization: "Bearer master-secret"}), 200);
  const record = database.records.get("example");
  assert.equal(record.key, undefined);
  assert.equal(await passwords.verifyClaimPassword("owner-secret", record.keyHash), true);
  assert.equal(await passwords.verifyClaimPassword("master-secret", record.keyHash), false);
  await expectResponse(await request("DELETE", {}, {authorization: "Bearer master-secret"}), 200);
  assertSecretFreeLogs();
});

test("unset or empty administrator configuration never bypasses a protected claim", async () => {
  putLegacy();
  for (const master of [undefined, "", "   "]) {
    env.MASTER_KEY = master;
    for (const authorization of [undefined, "Bearer ", "Bearer undefined", "Bearer master-secret"]) {
      await expectResponse(await request("DELETE", {}, {authorization}), 403);
      await expectResponse(await request("POST", {coa: {t1: "or"}}, {authorization}), 403);
    }
  }
  assert.equal(database.operations.length, 0);
});

test("unprotected claims stay public on update and may be deleted without credentials", async () => {
  const body = await expectResponse(await request("POST", {coa: {t1: "or"}}), 201);
  assert.equal(body.protected, false);
  await expectResponse(await request("POST", {coa: {t1: "azure"}, key: "owner-secret"}), 200);
  assert.equal(database.records.get("example").keyHash, undefined);
  await expectResponse(await request("DELETE"), 200);
  await expectResponse(await request("DELETE"), 404);
  putLegacy("");
  await expectResponse(await request("DELETE"), 200);
});

test("password hashes are salted, preserve Unicode, and fail closed on malformed stored hashes", async () => {
  const password = "é🔑\u0000secret";
  const first = await passwords.hashClaimPassword(password);
  const second = await passwords.hashClaimPassword(password);
  assert.notEqual(first, second);
  assert.equal(await passwords.verifyClaimPassword(password, first), true);
  assert.equal(await passwords.verifyClaimPassword(password + "x", first), false);
  for (const hash of ["", null, 123, "scrypt$999999999$8$1$bad$bad"]) {
    putLegacy();
    database.records.get("example").keyHash = hash;
    await expectResponse(await request("DELETE", {key: "owner-secret"}), 403);
  }
});

test("invalid JSON, credentials, COAs, and oversized bodies cannot mutate records", async () => {
  for (const body of [
    null,
    [],
    {key: null},
    {key: {}},
    {key: "x".repeat(4097)},
    {keyHash: "x"},
    {coa: {}},
    {coa: {t1: "or", shield: "bad"}}
  ]) {
    await expectResponse(await request("POST", body), 400);
  }
  await expectResponse(await request("POST", {}, {raw: "{"}), 400);
  await expectResponse(await request("POST", {}, {raw: " ".repeat(65537)}), 413);
  await expectResponse(await request("POST", {coa: {t1: "or"}}, {contentType: "text/plain"}), 415);
  await expectResponse(await request("POST", {coa: {t1: "or"}}, {name: "123"}), 403);
  await expectResponse(await request("POST", {coa: {t1: "or"}}, {query: "?key=owner-secret"}), 400);
  await expectResponse(await request("POST", {coa: {t1: "or"}, key: "master-secret"}), 400);
  assert.equal(database.operations.length, 0);
});

test("database and renderer errors never expose credentials through logs or responses", async () => {
  database.setFail(true);
  await expectResponse(await request("POST", {coa: {t1: "or"}, key: "owner-secret"}), 500);
  await expectResponse(await request("DELETE", {key: "wrong-secret"}), 500);
  database.setFail(false);
  renderer.setFail(true);
  await expectResponse(await request("POST", {coa: {t1: "or"}, key: "owner-secret"}), 500);
  // Exercise write failures in the real connector as well as the route's read failure.
  const db = new connector.MongoDBConnector("unused", "test", "test");
  await db.connect();
  database.setFail(true);
  await assert.rejects(db.insertOne({keyHash: "owner-secret"}));
  await assert.rejects(db.updateOne({key: "wrong-secret"}, {}));
  await assert.rejects(db.deleteOne({key: "master-secret"}));
  assertSecretFreeLogs();
});

test("authorization races return conflict rather than mutate a replaced claim", async () => {
  putLegacy();
  database.setConflict(true);
  await expectResponse(await request("POST", {coa: {t1: "azure"}, key: "owner-secret"}), 409);
  await expectResponse(await request("DELETE", {key: "owner-secret"}), 409);
  assert.equal(database.records.get("example").coa.t1, "or");
  assert.equal(database.records.get("example").key, "owner-secret");
  database.records.clear();
  await expectResponse(await request("POST", {coa: {t1: "or"}}), 409);
});

test("concurrent creation has one winner and cannot overwrite its credentials", async () => {
  const responses = await Promise.all(["owner-secret", "wrong-secret"].map(key => request("POST", {coa: {t1: "or"}, key})));
  assert.deepEqual(responses.map(response => response.status).sort(), [201, 409]);
  assert.equal(database.operations.filter(([operation]) => operation === "insert").length, 1);
});

test("legacy owner passwords can release a claim without a migration write", async () => {
  putLegacy();
  await expectResponse(await request("DELETE", {key: "wrong-secret"}), 403);
  await expectResponse(await request("DELETE", {key: "owner-secret"}), 200);
  assert.deepEqual(
    database.operations.map(([operation]) => operation),
    ["delete"]
  );
  assertSecretFreeLogs();
});

test("claim COA limits fail before rendering or persistence", async () => {
  const cases = [
    {t1: "or", charges: Array(33).fill({charge: "eagle", t: "gules", p: "e"})},
    {t1: "or", metadata: "x".repeat(4097)},
    {t1: "or", metadata: Array(9).fill("x".repeat(4000))}
  ];
  let nested = {};
  for (let i = 0; i < 10; i++) nested = {nested};
  cases.push({t1: "or", nested});
  for (const coa of cases) await expectResponse(await request("POST", {coa}), 413);
  await expectResponse(
    await request("POST", {coa: {t1: "or", ordinaries: [{ordinary: "bordure", t: "gules", gyronny: 1e9}]}}),
    400
  );
  assert.equal(renderer.calls, 0);
  assert.equal(database.operations.length, 0);
});

test("claim saves share import validation and persist normalized legacy data", async () => {
  for (const coa of [{}, null, {t1: "or", charges: {}}, {t1: "or", charges: [{charge: "missing", t: "or"}]}]) {
    await expectResponse(await request("POST", {coa}), 400);
  }
  assert.equal(renderer.calls, 0);
  assert.equal(database.operations.length, 0);
  await expectResponse(await request("POST", {coa: {t1: "or", charges: [{charge: "eagle", t: "gules", sinister: 1}]}}), 201);
  assert.deepEqual(database.records.get("example").coa.charges[0], {charge: "eagle", t: "gules", sinister: true, p: "e"});
});
