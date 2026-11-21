import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {readFileSync} from "node:fs";
import {test} from "node:test";

const require = createRequire(import.meta.url);
const pluginRequire = createRequire(require.resolve("@sveltejs/vite-plugin-svelte"));
const i18nRequire = createRequire(require.resolve("svelte-i18n"));
const payload = () =>
  JSON.parse(
    '{"__proto__":{"poisoned":true},"constructor":{"prototype":{"poisoned":true}},"prototype":{"poisoned":true},"safe":1}'
  );

test("both consumers resolve the pinned, patched deepmerge copy", () => {
  assert.equal(pluginRequire.resolve("deepmerge"), i18nRequire.resolve("deepmerge"));
  const lock = JSON.parse(readFileSync(new URL("../package-lock.json", import.meta.url)));
  const copies = Object.entries(lock.packages).filter(([path]) => /node_modules\/deepmerge$/.test(path));
  assert.deepEqual(
    copies.map(([path, pkg]) => [path, pkg.version]),
    [["node_modules/deepmerge", "4.3.1"]]
  );
});

for (const entry of ["deepmerge", "deepmerge/dist/umd.js"]) {
  const merge = require(entry);
  test(`${entry} rejects poisoning from both operands, nested placeholders and arrays`, () => {
    function safe(value) {
      assert.equal(value.poisoned, undefined);
      assert.equal(Object.getPrototypeOf(value), Object.prototype);
      for (const key of ["__proto__", "constructor", "prototype"]) assert.equal(Object.hasOwn(value, key), false);
      assert.equal(value.safe, 1);
    }
    for (const target of [{}, Object.create(null), payload()]) safe(merge(target, payload()));
    safe(merge(payload(), {}));
    for (const placeholder of [null, undefined, false, 0, ""]) {
      safe(merge({nested: placeholder}, {nested: payload()}).nested);
    }
    safe(merge.all([{}, payload(), {}]));
    safe(merge([], [payload()])[0]);
    assert.equal({}.poisoned, undefined);
  });

  test(`${entry} preserves locale partials and plugin configuration merge semantics`, () => {
    const callback = () => {};
    const symbol = Symbol("option");
    const first = {menu: {save: "Save"}, list: [1], callback, [symbol]: "value"};
    const second = {menu: {save: "Sauvegarder", back: "Retour"}, list: [2]};
    const result = merge.all([first, second]);
    assert.deepEqual(result.menu, {save: "Sauvegarder", back: "Retour"});
    assert.deepEqual(result.list, [1, 2]);
    assert.equal(result.callback, callback);
    assert.equal(result[symbol], "value");
    assert.deepEqual(first.menu, {save: "Save"});
    assert.deepEqual(merge(first, second, {arrayMerge: (_target, source) => source}).list, [2]);
  });
}

test("the localization dependency resolves patched esbuild with working transforms", async () => {
  const esbuild = i18nRequire("esbuild");
  assert.equal(esbuild.version, "0.28.2");
  const result = await esbuild.transform("const label: string = 'Save';", {loader: "ts"});
  assert.match(result.code, /const label =/);
});
