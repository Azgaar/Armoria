import assert from "node:assert/strict";
import {access, readFile, readdir, realpath} from "node:fs/promises";
import {join, resolve} from "node:path";
import {test} from "node:test";

const output = resolve(process.env.VERCEL_OUTPUT_ROOT || ".vercel/output");
const api = join(output, "functions/api.func");
const discord = join(output, "functions/discord.func");
const json = async path => JSON.parse(await readFile(path, "utf8"));

async function files(directory, prefix = "") {
  const result = [];
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const path = join(prefix, entry.name);
    if (entry.isDirectory()) result.push(...(await files(join(directory, entry.name), path)));
    else if (entry.isFile()) result.push(path);
  }
  return result;
}

test("Vercel emits separate Node 24 image and Discord functions with their handlers", async () => {
  assert.notEqual(await realpath(api), await realpath(discord));
  for (const directory of [api, discord, join(output, "functions/![-]/catchall.func")]) {
    const config = await json(join(directory, ".vc-config.json"));
    assert.equal(config.runtime, "nodejs24.x");
    assert.equal(config.launcherType, "Nodejs");
    await access(join(directory, config.handler));
  }
  const config = await json(join(output, "config.json"));
  for (const route of ["/api", "/discord"]) assert.ok(config.routes.some(item => item.dest === route));
});

test("Vercel traces image assets and server dependencies without including them in Discord", async () => {
  const apiFiles = await files(api);
  const discordFiles = await files(discord);
  for (const dependency of ["mongodb", "puppeteer-core", "@sparticuz/chromium-min", "minify-xml"]) {
    assert.ok(
      apiFiles.some(file => file.startsWith(`node_modules/${dependency}/`)),
      `missing ${dependency}`
    );
    assert.ok(!discordFiles.some(file => file.startsWith(`node_modules/${dependency}/`)), `Discord includes ${dependency}`);
  }
  assert.ok(discordFiles.some(file => file.includes("entries/endpoints/discord/")));
  assert.ok(!discordFiles.some(file => file.includes("entries/endpoints/api/")));
  assert.ok(!apiFiles.some(file => file.includes("entries/endpoints/discord/")));
  const assets = apiFiles.filter(file => file.startsWith("_app/immutable/assets/") && file.endsWith(".svg"));
  assert.ok(assets.length > 300, "built-in charges must be available to server rendering");
  for (const asset of assets) {
    assert.deepEqual(await readFile(join(api, asset)), await readFile(join(output, "static", asset)));
  }
  assert.ok(!discordFiles.some(file => file.endsWith(".svg")));
});

test("build and lint dependencies stay out of deployed functions and public files", async () => {
  for (const directory of [api, discord, join(output, "functions/![-]/catchall.func")]) {
    for (const file of await files(directory)) {
      assert.doesNotMatch(file, /^node_modules\/(?:glob|minimatch|eslint|@vercel\/nft|@eslint|@typescript-eslint)(?:\/|$)/);
    }
  }
  for (const file of await files(join(output, "static"))) {
    assert.doesNotMatch(file, /(?:^|\/)(?:node_modules|server)(?:\/|$)/);
    assert.doesNotMatch(file, /(?:^|\/)\.env(?:\.|$)/);
  }
});
