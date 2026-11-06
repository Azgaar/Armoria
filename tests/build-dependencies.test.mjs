import assert from "node:assert/strict";
import {readdir as readDirectory} from "node:fs";
import {mkdtemp, mkdir, writeFile, rm} from "node:fs/promises";
import {createRequire} from "node:module";
import {tmpdir} from "node:os";
import {join, resolve} from "node:path";
import {setImmediate} from "node:timers/promises";
import {fileURLToPath} from "node:url";
import {test} from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
// Allows the same behavioral checks to be run against the pre-update install.
const require = createRequire(resolve(process.env.ARMORIA_TOOLCHAIN_BASELINE || root, "package.json"));
const nftRequire = createRequire(require.resolve("@vercel/nft"));
const {glob} = nftRequire("glob");
const {nodeFileTrace} = require("@vercel/nft");
const matchers = ["eslint", "@eslint/config-array", "@typescript-eslint/typescript-estree"].map(parent => {
  const consumer = createRequire(require.resolve(parent));
  return [parent, consumer("minimatch")];
});

async function fixture(t, files) {
  const directory = await mkdtemp(join(tmpdir(), "armoria-build-deps-"));
  t.after(() => rm(directory, {recursive: true, force: true}));
  for (const [name, contents] of Object.entries(files)) {
    const path = join(directory, name);
    await mkdir(resolve(path, ".."), {recursive: true});
    await writeFile(path, contents);
  }
  return directory;
}

for (const [parent, {minimatch, Minimatch}] of matchers) {
  test(`${parent} matching compatibility: dotfiles, braces, extglobs, negation and partial directories`, () => {
    const cases = [
      ["src/lib/file.ts", "**/*.{js,ts,svelte}", true],
      ["src/lib/View.svelte", "**/*.{js,ts,svelte}", true],
      ["src/.hidden.ts", "**/*.ts", true],
      ["src/lib/file.test.ts", "**/!(*.test).ts", false],
      ["src/lib/file.ts", "**/!(*.test).ts", true],
      ["dist/deep/file.ts", "dist/**", true],
      ["src/file.ts", "!dist/**", true],
      ["dist/file.ts", "!dist/**", false],
      ["src/file.ts", "**/*.svelte", false],
      ["assets/café.svg", "assets/*.svg", true]
    ];
    for (const [file, pattern, expected] of cases) {
      assert.equal(minimatch(file, pattern, {dot: true}), expected, `${file}: ${pattern}`);
      assert.equal(new Minimatch(pattern, {dot: true}).match(file), expected);
    }
    const matcher = new Minimatch("src/**/*.ts", {dot: true});
    assert.equal(matcher.pattern, "src/**/*.ts");
    assert.equal(matcher.match("src/lib", true), true);
    assert.equal(matcher.match("other/lib", true), false);
    assert.equal(new Minimatch("!dist/**", {dot: true, flipNegate: true}).match("dist/file.ts"), true);
    assert.equal(minimatch("src\\file.ts", "src/*.ts", {platform: "win32", windowsPathsNoEscape: true}), true);
  });

  test(`${parent} bounds globstar-parent expansion`, () => {
    assert.throws(
      () => new Minimatch("a/**/../b/**/../c/**/../d/**/../e", {optimizationLevel: 2, braceExpandMax: 4}),
      RangeError
    );
  });
}

test("Vercel glob compatibility preserves asset and shared-library patterns", async t => {
  const cwd = await fixture(t, {
    "assets/icon.svg": "svg",
    "assets/.hidden.svg": "svg",
    "assets/sub/nested.svg": "svg",
    "assets/node_modules/ignored/hidden.svg": "svg",
    "native/addon.node": "",
    "native/libexample.so": "",
    "native/libexample.so.1": "",
    "native/sub/libexample.dylib": "",
    "native/example.dll": "",
    "native/node_modules/ignored/lib.so": ""
  });
  const assets = await glob(`${cwd}/assets/**/*.svg`, {
    mark: true,
    dot: true,
    nodir: true,
    ignore: `${cwd}/assets/**/node_modules/**/*`
  });
  assert.deepEqual(assets.map(path => path.slice(cwd.length + 1)).sort(), [
    "assets/.hidden.svg",
    "assets/icon.svg",
    "assets/sub/nested.svg"
  ]);
  for (const [pattern, expected] of [
    ["**/*.so?(.*)", ["libexample.so", "libexample.so.1"]],
    ["**/*.@(dylib|so?(.*))", ["libexample.so", "libexample.so.1", "sub/libexample.dylib"]],
    ["**/*.dll", ["example.dll"]]
  ]) {
    const files = await glob(`${cwd}/native/${pattern}`, {dot: true, ignore: `${cwd}/native/**/node_modules/**/*`});
    assert.deepEqual(files.map(path => path.slice(`${cwd}/native/`.length)).sort(), expected);
  }
});

test("Vercel glob stops filesystem traversal after cancellation", async t => {
  const cwd = await fixture(t, {"a/b/c.txt": "", "d/e/f.txt": "", "g/h/i.txt": ""});
  const controller = new AbortController();
  const reason = new Error("cancel fixture traversal");
  let reads = 0,
    pending = 0;
  const walking = glob("**/*", {
    cwd,
    signal: controller.signal,
    fs: {
      readdir(path, options, callback) {
        reads++;
        pending++;
        readDirectory(path, options, (...args) => {
          pending--;
          if (!controller.signal.aborted) controller.abort(reason);
          callback(...args);
        });
      }
    }
  });
  await assert.rejects(walking, error => error === reason);
  // Drain outstanding callbacks, including any new work incorrectly queued after abort.
  do {
    await setImmediate();
  } while (pending);
  assert.equal(reads, 1, "no child directories should be read after abort");
});

test("Vercel tracing includes dynamic assets, imports and native shared libraries", async t => {
  const cwd = await fixture(t, {
    "entry.cjs":
      'const fs = require("fs"); const path = require("path"); require("native-fixture"); exports.read = name => fs.readFileSync(path.join(__dirname, "assets", name + ".svg")); exports.load = name => require("./handlers/" + name + ".cjs");',
    "assets/icon.svg": "svg",
    "assets/.hidden.svg": "svg",
    "assets/node_modules/ignored/skip.svg": "svg",
    "handlers/one.cjs": "module.exports = 1;",
    "node_modules/native-fixture/package.json": '{"name":"native-fixture","main":"index.cjs"}',
    "node_modules/native-fixture/index.cjs": 'module.exports = require("./addon.node");',
    "node_modules/native-fixture/addon.node": "",
    "node_modules/native-fixture/libfixture.so.1": "",
    "node_modules/native-fixture/node_modules/ignored/libskip.so": ""
  });
  const {fileList, warnings} = await nodeFileTrace([join(cwd, "entry.cjs")], {base: cwd, processCwd: cwd});
  assert.deepEqual(
    [...warnings].map(error => error.message),
    []
  );
  for (const path of [
    "entry.cjs",
    "assets/icon.svg",
    "assets/.hidden.svg",
    "handlers/one.cjs",
    "node_modules/native-fixture/index.cjs",
    "node_modules/native-fixture/package.json",
    "node_modules/native-fixture/addon.node",
    "node_modules/native-fixture/libfixture.so.1"
  ]) {
    assert.ok(fileList.has(path), `missing traced file: ${path}`);
  }
  assert.ok(![...fileList].some(path => path.includes("/ignored/")));
});

test("repository lint configuration handles JavaScript, TypeScript and Svelte and preserves ignores", async () => {
  const {ESLint} = require("eslint");
  const eslint = new ESLint({cwd: root});
  for (const [filePath, source] of [
    ["src/probe.js", "export const answer = 42;"],
    ["src/probe.ts", "export const answer: number = 42;"],
    ["src/Probe.svelte", '<script lang="ts">let answer: number = 42;</script><p>{answer}</p>']
  ]) {
    const [result] = await eslint.lintText(source, {filePath});
    assert.deepEqual(result.messages, [], `${filePath} should load the intended parser and rules`);
  }
  for (const path of ["dist/probe.ts", ".svelte-kit/probe.ts", "build/probe.js"])
    assert.equal(await eslint.isPathIgnored(path), true);
  assert.equal(await eslint.isPathIgnored("src/Probe.svelte"), false);
});
