import assert from "node:assert/strict";
import {mkdtemp, readFile, rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {after, before, test} from "node:test";
import {createServer} from "vite";
import puppeteer from "puppeteer";

let server, browser, origin, cacheDir;
const dictionaries = {};
before(
  async () => {
    // A separate, empty optimizer cache catches regressions hidden by warm runs.
    cacheDir = await mkdtemp(join(tmpdir(), "armoria-i18n-vite-"));
    server = await createServer({cacheDir, logLevel: "silent", server: {host: "127.0.0.1", port: 0}});
    await server.listen();
    origin = `http://127.0.0.1:${server.httpServer.address().port}`;
    browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: process.env.PUPPETEER_NO_SANDBOX ? ["--no-sandbox"] : []
    });
    for (const language of ["en", "fr", "de"])
      dictionaries[language] = JSON.parse(await readFile(new URL(`../static/locales/${language}/lang.json`, import.meta.url)));
  },
  {timeout: 60000}
);
after(async () => {
  await browser?.close();
  await server?.close();
  if (cacheDir) await rm(cacheDir, {recursive: true, force: true});
});

async function session(t, savedLocale = "fr", denied = false) {
  const context = await browser.createBrowserContext();
  t.after(() => context.close());
  const page = await context.newPage();
  await page.setViewport({width: 1440, height: 1000});
  // Observe the page's lazy locale fetches independently of worker precaching.
  // Worker registration and its module loading still run during cold startup.
  await page.setBypassServiceWorker(true);
  const errors = [],
    failures = [],
    loaded = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("response", response => {
    if (response.url().startsWith(origin) && response.status() >= 400) failures.push([response.status(), response.url()]);
    const match = new URL(response.url()).pathname.match(/^\/locales\/([^/]+)\/lang.json$/);
    if (match) loaded.push(match[1]);
  });
  page.on("requestfailed", request => {
    if (request.url().startsWith(origin)) failures.push([request.failure()?.errorText, request.url()]);
  });
  t.after(() => {
    assert.deepEqual(errors, []);
    assert.deepEqual(failures, [], "no failed requests, stale modules or optimizer 504 responses");
  });
  await page.setRequestInterception(true);
  page.on("request", request =>
    request.url().startsWith(origin) || /^(data|blob):/.test(request.url()) ? request.continue() : request.abort()
  );
  const preload = await page.evaluateOnNewDocument(
    ({savedLocale, denied}) => {
      Object.defineProperty(navigator, "language", {value: "de-DE"});
      localStorage.setItem("locale", savedLocale);
      if (denied)
        Object.defineProperty(window, "localStorage", {
          get() {
            throw new DOMException("denied", "SecurityError");
          }
        });
    },
    {savedLocale, denied}
  );
  await page.goto(origin, {waitUntil: "networkidle0"});
  await page.waitForSelector("svg .field");
  await page.removeScriptToEvaluateOnNewDocument(preload.identifier);
  return {page, loaded};
}

async function menu(page, language) {
  await page.waitForFunction(
    label => [...document.querySelectorAll("li")].some(el => el.textContent.trim() === label),
    {},
    dictionaries[language].menu.save
  );
}

test(
  "cold-cache gallery lazily loads saved French, switches to German and persists it in the editor",
  {timeout: 60000},
  async t => {
    const {page, loaded} = await session(t, "fr-FR");
    await menu(page, "fr");
    assert.deepEqual([...new Set(loaded)].sort(), ["en", "fr"]);
    // Invoke the real language menu handler (its dropdown is hover-driven).
    await page.evaluate(() => [...document.querySelectorAll("li")].find(el => el.textContent.trim() === "Deutsch").click());
    await menu(page, "de");
    await page.waitForNetworkIdle();
    assert.equal(await page.evaluate(() => localStorage.getItem("locale")), "de");
    assert.deepEqual([...new Set(loaded)].sort(), ["de", "en", "fr"]);
    await page.goto(origin + "/?seed=localization", {waitUntil: "networkidle0"});
    await page.waitForSelector("#coaEdit .field");
    await menu(page, "de");
    await page.reload({waitUntil: "networkidle0"});
    await page.waitForSelector("#coaEdit .field");
    await menu(page, "de");
  }
);

test(
  "optimized localization merges partials safely and retains interpolation and English fallback",
  {timeout: 60000},
  async t => {
    const {page} = await session(t);
    await menu(page, "fr");
    const result = await page.evaluate(async () => {
      const {get, localization} = await import("/src/lib/testing/browser-runtime.ts");
      const {addMessages, t, dictionary} = localization;
      addMessages("en", {regression: {fallback: "English fallback"}});
      addMessages("fr", {regression: {greeting: "Bonjour {name}", count: "{count, plural, one {# blason} other {# blasons}}"}});
      addMessages("fr", JSON.parse('{"regression":{"__proto__":{"poisoned":true},"extra":"Suite"}}'));
      const translate = get(t);
      return {
        greeting: translate("regression.greeting", {values: {name: "Ada"}}),
        count: translate("regression.count", {values: {count: 2}}),
        fallback: translate("regression.fallback"),
        extra: translate("regression.extra"),
        poisoned: get(dictionary).fr.regression.poisoned === true,
        save: translate("menu.save")
      };
    });
    assert.deepEqual(result, {
      greeting: "Bonjour Ada",
      count: "2 blasons",
      fallback: "English fallback",
      extra: "Suite",
      poisoned: false,
      save: dictionaries.fr.menu.save
    });
  }
);

for (const denied of [false, true])
  test(`localization recovers with ${denied ? "denied" : "malformed"} storage`, {timeout: 60000}, async t => {
    const {page} = await session(t, "{", denied);
    await menu(page, "de");
    await page.waitForSelector("[data-settings-notice]");
    if (!denied) assert.equal(await page.evaluate(() => localStorage.getItem("locale")), "{");
    await page.evaluate(async () => {
      const {state} = await import("/src/lib/data/stores.ts");
      state.update(value => ({...value, edit: 1, i: 0}));
    });
    await page.waitForSelector("#coaEdit .field");
    await menu(page, "de");
  });
