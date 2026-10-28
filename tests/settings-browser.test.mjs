import assert from "node:assert/strict";
import {after, before, test} from "node:test";
import {createServer} from "vite";
import puppeteer from "puppeteer";

let server, browser, origin;
const upload = {
  category: "uploaded",
  type: "vector",
  data: {colors: 1},
  content: '<g id="mycrest"><path d="M0 0h100v100z"/></g>'
};
const crest = {t1: "or", charges: [{charge: "mycrest", t: "azure", p: "e"}]};

before(
  async () => {
    server = await createServer({logLevel: "silent", server: {host: "127.0.0.1", port: 0}});
    await server.listen();
    origin = `http://127.0.0.1:${server.httpServer.address().port}`;
    browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: process.env.PUPPETEER_NO_SANDBOX ? ["--no-sandbox"] : []
    });
  },
  {timeout: 60000}
);
after(async () => {
  await browser?.close();
  await server?.close();
});

async function session(t, saved = {}, failure = "") {
  const context = await browser.createBrowserContext();
  t.after(() => context.close());
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  t.after(() => assert.deepEqual(errors, []));
  await page.setRequestInterception(true);
  page.on("request", request =>
    request.url().startsWith(origin) || /^(data|blob):/.test(request.url()) ? request.continue() : request.abort()
  );
  const preload = await page.evaluateOnNewDocument(
    ({saved, failure}) => {
      for (const [key, value] of Object.entries(saved)) localStorage.setItem(key, value);
      if (failure === "denied")
        Object.defineProperty(window, "localStorage", {
          get() {
            throw new DOMException("denied", "SecurityError");
          }
        });
      if (failure === "quota") {
        Storage.prototype.setItem = () => {
          throw new DOMException("quota", "QuotaExceededError");
        };
        Storage.prototype.removeItem = () => {
          throw new DOMException("denied", "SecurityError");
        };
      }
    },
    {saved, failure}
  );
  await page.goto(origin, {waitUntil: "networkidle0"});
  await page.waitForSelector("svg .field");
  // Seed once; subsequent reloads exercise what the application actually saved.
  await page.removeScriptToEvaluateOnNewDocument(preload.identifier);
  return page;
}
async function snapshot(page) {
  return page.evaluate(async () => {
    const s = await import("/src/lib/data/stores.ts");
    const {get} = await import("/node_modules/svelte/src/runtime/store/index.js");
    return Object.fromEntries(
      ["borderWidth", "colors", "uploaded", "grid", "showGrid", "history", "state", "isTextReady"].map(key => [key, get(s[key])])
    );
  });
}
async function width(page, value) {
  // Exercise the actual Options > Border > Width input and its persistence handler.
  await page.$eval(
    'input[type="number"][max="4"][step="0.4"]',
    (input, value) => {
      input.value = String(value);
      input.dispatchEvent(new Event("input", {bubbles: true}));
    },
    value
  );
  await page.waitForFunction(
    value => [...document.querySelectorAll("svg .grad")].some(path => path.getAttribute("stroke-width") === String(value)),
    {},
    value
  );
}

test(
  "malformed settings recover in gallery and editor without overwriting raw data or valid uploads",
  async t => {
    const saved = {
      colors: "{",
      fonts: "42",
      tinctures: "[]",
      grid: "0",
      showGrid: '"yes"',
      shield: "missing",
      locale: "unsupported",
      borderWidth: "0",
      uploaded: JSON.stringify({mycrest: upload, broken: null})
    };
    const page = await session(t, saved);
    await page.waitForSelector("[data-settings-notice]");
    assert.match(await page.$eval("[data-settings-notice]", el => el.textContent), /saved settings were invalid/);
    const gallery = await snapshot(page);
    assert.ok(gallery.history.length);
    assert.equal(gallery.borderWidth, 0);
    assert.deepEqual(gallery.uploaded, {mycrest: upload});
    await page.goto(origin + "/?" + new URLSearchParams({coa: JSON.stringify(crest)}), {waitUntil: "networkidle0"});
    await page.waitForSelector("#coaEdit");
    await page.waitForSelector("#mycrest path");
    assert.equal(await page.$eval("#coaEdit .grad", el => el.getAttribute("stroke-width")), "0");
    assert.equal((await snapshot(page)).grid, 1);
    assert.equal((await snapshot(page)).showGrid, false);
    assert.deepEqual(
      await page.evaluate(keys => Object.fromEntries(keys.map(key => [key, localStorage.getItem(key)])), Object.keys(saved)),
      saved
    );
    await page.click("[data-settings-notice] button");
    assert.equal(await page.$("[data-settings-notice]"), null);
  },
  {timeout: 60000}
);

test(
  "zero border width set through the UI survives reload alongside custom resources",
  async t => {
    const page = await session(t, {colors: JSON.stringify({custom: "#123456"}), uploaded: JSON.stringify({mycrest: upload})});
    await width(page, 0);
    assert.equal(await page.evaluate(() => localStorage.getItem("borderWidth")), "0");
    await page.reload({waitUntil: "networkidle0"});
    assert.equal((await snapshot(page)).borderWidth, 0);
    assert.equal((await snapshot(page)).colors.custom, "#123456");
    assert.deepEqual((await snapshot(page)).uploaded, {mycrest: upload});
    assert.equal(await page.$("[data-settings-notice]"), null);
    assert.equal(await page.$eval("svg .grad", el => el.getAttribute("stroke-width")), "0");
  },
  {timeout: 60000}
);

test(
  "denied storage still initializes translations and supports gallery and editor changes",
  async t => {
    const page = await session(t, {}, "denied");
    await page.waitForSelector("[data-settings-notice]");
    assert.equal((await snapshot(page)).isTextReady, true);
    assert.match(await page.$eval("[data-settings-notice]", el => el.textContent), /Browser storage could not be accessed/);
    await width(page, 0);
    // Open the editor without reloading, keeping the denied-storage environment.
    await page.evaluate(async () => {
      const {state} = await import("/src/lib/data/stores.ts");
      state.update(value => ({...value, edit: 1, i: 0}));
    });
    await page.waitForSelector("#coaEdit");
    await page.evaluate(async () => {
      const {grid, showGrid} = await import("/src/lib/data/stores.ts");
      grid.set(10);
      showGrid.set(true);
    });
    await page.waitForFunction(async () => {
      const {settingsStorage} = await import("/src/lib/data/storage.ts");
      return settingsStorage.getItem("grid") === "10" && settingsStorage.getItem("showGrid") === "true";
    });
    assert.equal((await snapshot(page)).borderWidth, 0);
  },
  {timeout: 60000}
);

test(
  "quota and removal failures preserve saved uploads while controls remain usable",
  async t => {
    const raw = JSON.stringify({mycrest: upload});
    const page = await session(t, {uploaded: raw, borderWidth: "2"}, "quota");
    await width(page, 0);
    await page.waitForSelector("[data-settings-notice]");
    assert.equal((await snapshot(page)).borderWidth, 0);
    assert.equal(await page.evaluate(() => localStorage.getItem("borderWidth")), "2");
    assert.equal(await page.evaluate(() => localStorage.getItem("uploaded")), raw);
    // The restore button calls removeItem; even a failed removal restores the UI.
    await page.evaluate(() => {
      const input = document.querySelector('input[type="number"][max="4"][step="0.4"]');
      input.parentElement.querySelector("svg").dispatchEvent(new MouseEvent("click", {bubbles: true}));
    });
    await page.waitForFunction(async () => {
      const {settingsStorage} = await import("/src/lib/data/storage.ts");
      return settingsStorage.getItem("borderWidth") === null;
    });
    assert.equal((await snapshot(page)).borderWidth, 1);
    assert.deepEqual((await snapshot(page)).uploaded, {mycrest: upload});
  },
  {timeout: 60000}
);
