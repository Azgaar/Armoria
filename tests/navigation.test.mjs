import assert from "node:assert/strict";
import {after, before, test} from "node:test";
import {createServer} from "vite";
import puppeteer from "puppeteer";

let server, browser, origin;
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

async function session(t, saved = {}) {
  const context = await browser.createBrowserContext();
  t.after(() => context.close());
  const page = await context.newPage();
  await page.setViewport({width: 1440, height: 1000});
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  t.after(() => assert.deepEqual(errors, []));
  await page.setRequestInterception(true);
  page.on("request", request =>
    request.url().startsWith(origin + "/") || /^(data|blob):/.test(request.url()) ? request.continue() : request.abort()
  );
  await page.evaluateOnNewDocument(saved => {
    localStorage.setItem("locale", "en");
    for (const [key, value] of Object.entries(saved)) localStorage.setItem(key, value);
  }, saved);
  await page.goto(
    origin + "/?" + new URLSearchParams({coa: JSON.stringify({t1: "or", shield: "heater", name: "Navigation test"})}),
    {waitUntil: "networkidle0"}
  );
  await page.waitForSelector("#coaEdit .field");
  await page.waitForFunction(() => [...document.querySelectorAll("nav li")].some(node => node.textContent.trim() === "Save"));
  return page;
}

async function matrix(page) {
  return page.evaluate(async () => {
    const {get} = await import("/src/lib/testing/browser-runtime.ts");
    const {matrix} = await import("/src/lib/data/stores.ts");
    return get(matrix);
  });
}

// Exercise runes-based children called by legacy menus, including the nested Other slot.
test("responsive navbar retains menu content and action callbacks", async t => {
  const page = await session(t);
  assert.equal(await page.$('nav use[href="#reroll-icon"]'), null);
  await page.setViewport({width: 800, height: 1000});
  await page.waitForSelector('nav use[href="#reroll-icon"]');
  await page.waitForSelector('nav use[href="#other-icon"]');
  assert.ok(await page.$('nav use[href="#language-icon"]'));
  const previous = await matrix(page);
  await page.$eval('nav use[href="#reroll-icon"]', node => node.closest("li").click());
  assert.equal(await matrix(page), previous + 1);
  await page.setViewport({width: 1440, height: 1000});
  await page.waitForFunction(() => !document.querySelector('nav use[href="#reroll-icon"]'));
  assert.ok(await page.evaluate(() => [...document.querySelectorAll("nav li")].some(node => node.textContent.trim() === "Save")));
});

test("nested locks and restore icons update saved options without bubbling clicks", async t => {
  const page = await session(t, {grad: "no", borderWidth: "2"});
  const result = await page.evaluate(async () => {
    const {get, tick, on} = await import("/src/lib/testing/browser-runtime.ts");
    const {grad, borderWidth} = await import("/src/lib/data/stores.ts");
    const lock = [...document.querySelectorAll("nav span")].find(node => node.textContent === "🔖");
    if (!lock) throw new Error("No saved gradient lock");
    let bubbles = 0;
    const parent = lock.closest("li");
    // Svelte's event helper runs delegated child handlers before the parent.
    const stopLockListener = on(parent, "click", () => bubbles++);
    lock.click();
    await tick();
    const lockVisible = parent.textContent.includes("🔖");
    const input = document.querySelector('input[type="number"][max="4"][step="0.4"]');
    const stopRestoreListener = on(input.closest("li"), "click", () => bubbles++);
    input.parentElement.querySelector("svg").dispatchEvent(new MouseEvent("click", {bubbles: true}));
    await tick();
    stopLockListener();
    stopRestoreListener();
    return {
      bubbles,
      lockVisible,
      gradient: get(grad),
      savedGradient: localStorage.getItem("grad"),
      width: get(borderWidth),
      savedWidth: localStorage.getItem("borderWidth")
    };
  });
  assert.deepEqual(result, {bubbles: 0, lockVisible: false, gradient: "no", savedGradient: null, width: 1, savedWidth: null});
});

test("window shortcuts ignore form fields and preserve gallery rollback and touch gestures", async t => {
  const page = await session(t);
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.querySelector("#coaEdit"));
  const previous = await matrix(page);
  for (const tag of ["input", "select", "textarea"]) {
    await page.evaluate(tag => {
      const field = document.createElement(tag);
      field.id = "shortcut-target";
      document.body.append(field);
      field.focus();
    }, tag);
    await page.keyboard.press("Enter");
    assert.equal(await matrix(page), previous);
    await page.$eval("#shortcut-target", node => node.remove());
  }
  await page.keyboard.press("Enter");
  assert.equal(await matrix(page), previous + 1);
  await page.keyboard.press("Backspace");
  assert.equal(await matrix(page), previous);
  await page.evaluate(() => {
    const target = document.querySelector("main");
    const swipe = (type, screenX) =>
      target.dispatchEvent(
        new TouchEvent(type, {bubbles: true, changedTouches: [new Touch({identifier: 1, target, screenX, screenY: 100})]})
      );
    swipe("touchstart", 100);
    swipe("touchend", 300);
  });
  assert.equal(await matrix(page), previous + 1);
});

test("message replacement cancels the old timer and storage notices can be dismissed", async t => {
  const page = await session(t, {borderWidth: "broken"});
  await page.waitForSelector("[data-settings-notice]");
  await page.click("[data-settings-notice] button");
  await page.waitForFunction(() => !document.querySelector("[data-settings-notice]"));
  assert.equal(await page.evaluate(() => localStorage.getItem("borderWidth")), "broken");
  const text = await page.evaluate(async () => {
    const {get, tick} = await import("/src/lib/testing/browser-runtime.ts");
    const {message} = await import("/src/lib/data/stores.ts");
    message.info("menu.save", 100);
    await tick();
    // Same text still creates a new keyed message and must cancel the old timer.
    message.info("menu.save", 1000);
    await tick();
    await new Promise(resolve => setTimeout(resolve, 200));
    return get(message)?.text;
  });
  assert.equal(text, "menu.save");
  await page.waitForFunction(async () => {
    const {get} = await import("/src/lib/testing/browser-runtime.ts");
    const {message} = await import("/src/lib/data/stores.ts");
    return get(message) === null;
  });
  await page.evaluate(async () => {
    const {message} = await import("/src/lib/data/stores.ts");
    message.info("menu.save", 10000);
  });
  await page.waitForSelector("div.info");
  await page.$eval("div.info", node => node.click());
  await page.waitForFunction(async () => {
    const {get} = await import("/src/lib/testing/browser-runtime.ts");
    const {message} = await import("/src/lib/data/stores.ts");
    return get(message) === null;
  });
});
