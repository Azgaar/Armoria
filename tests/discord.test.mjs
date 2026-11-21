import {test} from "node:test";
import assert from "node:assert/strict";
import {generateKeyPairSync, sign} from "node:crypto";
import {handleDiscord} from "../src/lib/server/discord.ts";
import {register} from "../scripts/register-discord.mjs";

const {publicKey, privateKey} = generateKeyPairSync("ed25519");
const key = publicKey.export({format: "der", type: "spki"}).subarray(-32).toString("hex");
const command = seed => ({type: 2, data: {name: "armoria", type: 1, options: [{name: "seed", type: 3, value: seed}]}});

function signedRequest(payload, timestamp = String(Math.floor(Date.now() / 1000))) {
  const body = typeof payload === "string" ? payload : JSON.stringify(payload);
  return new Request("https://armoria.vercel.app/discord", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Signature-Timestamp": timestamp,
      "X-Signature-Ed25519": sign(null, Buffer.from(timestamp + body), privateKey).toString("hex")
    },
    body
  });
}

test("signed PING returns Discord's verification response", async () => {
  const response = await handleDiscord(signedRequest({type: 1}), key);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /application\/json/);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), {type: 1});
});

test("missing, forged, tampered and expired signatures fail validation", async () => {
  const unsigned = new Request("https://example.com/discord", {method: "POST", body: '{"type":1}'});
  const forged = signedRequest({type: 1});
  forged.headers.set("x-signature-ed25519", "00".repeat(64));
  const original = signedRequest({type: 1});
  const tampered = new Request(original.url, {
    method: "POST",
    headers: original.headers,
    body: JSON.stringify(command("changed"))
  });
  for (const request of [unsigned, forged, tampered, signedRequest({type: 1}, "1")]) {
    assert.equal((await handleDiscord(request, key)).status, 401);
  }
});

test("signature verification uses the raw body, including Unicode and whitespace", async () => {
  const payload = JSON.stringify(command("é🛡"), null, 2);
  const response = await handleDiscord(signedRequest(payload), key);
  assert.equal(response.status, 200);
  const url = new URL((await response.json()).data.content);
  assert.equal(url.searchParams.get("seed"), "é🛡");
});

test("command immediately returns an encoded public Vercel API link without fetching", async t => {
  t.mock.method(globalThis, "fetch", () => {
    throw new Error("The interaction must not wait for image generation");
  });
  const seed = "a&format=svg#@everyone";
  const response = await handleDiscord(signedRequest(command(seed)), key);
  const body = await response.json();
  assert.equal(body.type, 4);
  const url = new URL(body.data.content);
  assert.equal(url.origin, "https://armoria.vercel.app");
  assert.equal(url.pathname, "/api");
  assert.equal(url.searchParams.get("format"), "png");
  assert.equal(url.searchParams.get("size"), "400");
  assert.equal(url.searchParams.get("seed"), seed);
  assert.deepEqual(body.data.allowed_mentions, {parse: []});
  assert.equal(body.data.flags, undefined);
});

test("invalid or missing seeds get a private usage error", async () => {
  for (const seed of [undefined, "", "two words", "a".repeat(101), 123, "a\u0000b"]) {
    const body = await (await handleDiscord(signedRequest(command(seed)), key)).json();
    assert.equal(body.data.flags, 64);
    assert.match(body.data.content, /seed/);
  }
});

test("signed malformed JSON and unsupported interactions are handled", async () => {
  assert.equal((await handleDiscord(signedRequest("{"), key)).status, 400);
  for (const payload of [null, {type: 3}, {type: 2, data: {name: "other", type: 1}}]) {
    const body = await (await handleDiscord(signedRequest(payload), key)).json();
    assert.equal(body.data.flags, 64);
  }
  const malformedOptions = command("test");
  malformedOptions.data.options = [null];
  assert.equal((await (await handleDiscord(signedRequest(malformedOptions), key)).json()).data.flags, 64);
});

test("missing configuration and unsupported HTTP methods fail explicitly", async () => {
  assert.equal((await handleDiscord(signedRequest({type: 1}))).status, 503);
  assert.equal((await handleDiscord(signedRequest({type: 1}), "invalid")).status, 503);
  const response = await handleDiscord(new Request("https://example.com/discord"), key);
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "POST");
});

test("oversized signed requests are rejected", async () => {
  assert.equal((await handleDiscord(signedRequest(" ".repeat(65537)), key)).status, 413);
});

test("an explicitly configured API URL replaces its query and fragment", async () => {
  const body = await (await handleDiscord(signedRequest(command("test")), key, "https://example.com/api?coa=old#old")).json();
  assert.equal(body.data.content, "https://example.com/api?format=png&size=400&seed=test");
  for (const url of ["invalid", "http://example.com/api", "https://user:pass@example.com/api"]) {
    const error = await (await handleDiscord(signedRequest(command("test")), key, url)).json();
    assert.equal(error.data.flags, 64);
  }
});

test("registration upserts only armoria in the selected scope", async () => {
  for (const guildId of [undefined, "456"]) {
    await register(
      {DISCORD_APPLICATION_ID: "123", DISCORD_BOT_TOKEN: "test", DISCORD_GUILD_ID: guildId},
      async (url, options) => {
        assert.equal(url, `https://discord.com/api/v10/applications/123${guildId ? "/guilds/456" : ""}/commands`);
        assert.equal(options.method, "POST");
        const body = JSON.parse(options.body);
        assert.equal(body.name, "armoria");
        assert.equal(body.options[0].required, true);
        return {ok: true, json: async () => ({id: "789"})};
      }
    );
  }
});

test("registration validates configuration and reports Discord failures", async () => {
  await assert.rejects(
    register({}, () => {
      throw new Error("Must not contact Discord");
    }),
    /Set DISCORD_APPLICATION_ID/
  );
  await assert.rejects(
    register({DISCORD_APPLICATION_ID: "123", DISCORD_BOT_TOKEN: "test"}, async () => ({ok: false, status: 401})),
    /HTTP 401/
  );
});
