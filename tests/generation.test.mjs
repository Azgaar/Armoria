import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {after, before, test} from "node:test";
import {fileURLToPath} from "node:url";
import {createServer} from "vite";

const root = fileURLToPath(new URL("../", import.meta.url));
const originalRandom = Math.random;
let server, generate, charges, chargeSets, registerCharge, unregisterCharge, rw, createConfig, getTincture, defaults;
before(async () => {
  server = await createServer({
    root,
    configFile: false,
    logLevel: "silent",
    server: {middlewareMode: true, hmr: false, watch: null},
    optimizeDeps: {noDiscovery: true, include: []},
    resolve: {alias: {"#lib": root + "src/lib"}},
    plugins: [
      {
        name: "generation-environment",
        resolveId(id) {
          if (id === "$app/env") return "\0generation-environment";
        },
        load(id) {
          if (id === "\0generation-environment") return "export const browser = false;";
        }
      }
    ]
  });
  ({generate, createConfig, getTincture} = await server.ssrLoadModule("/src/lib/scripts/generator.js"));
  ({charges, chargeSets, registerCharge, unregisterCharge} = await server.ssrLoadModule("/src/lib/data/charges.js"));
  defaults = await server.ssrLoadModule("/src/lib/config/defaults.ts");
  ({rw} = await server.ssrLoadModule("/src/lib/scripts/utils.ts"));
});
after(async () => {
  Math.random = originalRandom;
  await server?.close();
});

test("typing the generator preserves existing seeded artwork", () => {
  // Captured from the sveltekit generator at 5291e72, before the type baseline.
  // Includes the legacy division/counterchange rules and their RNG consumption.
  const coas = Array.from({length: 1000}, (_, index) => generate(index + 1));
  assert.equal(
    createHash("sha256").update(JSON.stringify(coas)).digest("hex"),
    "8d25df9150c84ca70beb644be97f79360a9f0f5d306469ddf471b208d05476a2"
  );
});

test("generation remains repeatable across intervening seeds and cached sampling", () => {
  const first = generate("typed-baseline");
  generate("another-seed");
  assert.deepEqual(generate("typed-baseline"), first);
});

test("uploaded charge weights share the original table and invalidate sampling caches", () => {
  assert.equal(chargeSets.uploaded, charges.uploaded);
  registerCharge("checkFirst", "uploaded", 1);
  assert.equal(rw(chargeSets.uploaded), "checkFirst");
  registerCharge("checkSecond", "uploaded", 1);
  unregisterCharge("checkFirst", "uploaded");
  assert.equal(rw(chargeSets.uploaded), "checkSecond");
  unregisterCharge("checkSecond", "uploaded");
  assert.equal(charges.types.uploaded, 0);
  assert.equal(charges.single.uploaded, 0);
  assert.deepEqual(Object.keys(chargeSets.uploaded), []);
});

test("generation leaves global randomness unchanged even across repeated seeds", () => {
  const random = Math.random;
  generate("isolated-seed");
  assert.equal(Math.random, random);
  generate("different-isolated-seed");
  assert.equal(Math.random, random);
});

test("seeded generation does not draw from ambient randomness and accepts independent tincture tables", t => {
  t.mock.method(Math, "random", () => {
    throw new Error("ambient randomness used");
  });
  const custom = structuredClone(defaults.DEFAULT_TINCTURES);
  custom.field = {metals: 1, colours: 0, stains: 0, patterns: 0};
  custom.metals = {argent: 0, or: 0, customMetal: 1};
  // Restrict the field test to a config: a custom colour intentionally has no API palette entry.
  const config = createConfig(custom, () => 0.5);
  assert.equal(getTincture(config, "field"), "customMetal");
  const first = generate("private-stream");
  generate("intervening-stream");
  assert.deepEqual(generate("private-stream"), first);
  assert.deepEqual(defaults.DEFAULT_TINCTURES.field, {metals: 32, colours: 49, stains: 1, patterns: 14});
});

test("reentrant random choices cannot replace an outer configuration's random stream", () => {
  let calls = 0;
  const config = createConfig(defaults.DEFAULT_TINCTURES, () => {
    calls++;
    generate("nested-seed");
    return 0;
  });
  assert.equal(getTincture(config, "field"), "argent");
  assert.equal(calls, 2);
  assert.equal(Math.random, originalRandom);
});
