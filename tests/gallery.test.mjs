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

async function session(t, params = {}, viewport = {width: 1200, height: 1000}) {
  const context = await browser.createBrowserContext();
  t.after(() => context.close());
  const page = await context.newPage();
  await page.setViewport(viewport);
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  t.after(() => assert.deepEqual(errors, []));
  await page.setRequestInterception(true);
  page.on("request", request =>
    request.url().startsWith(origin + "/") || /^(data|blob):/.test(request.url()) ? request.continue() : request.abort()
  );
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem("locale", "en");
    localStorage.setItem("size", "400");
    localStorage.setItem("shield", "heater");
  });
  await page.goto(origin + "/?" + new URLSearchParams(params), {waitUntil: "networkidle0"});
  await page.waitForSelector(params.view ? "#viewer .field" : params.coa || params.seed ? "#coaEdit .field" : "main svg.coa");
  return page;
}

async function snapshot(page) {
  return page.evaluate(async () => {
    const stores = await import("/src/lib/data/stores.ts");
    const {get, tick} = await import("/src/lib/testing/browser-runtime.ts");
    await tick();
    return {
      history: get(stores.history),
      matrices: get(stores.matrices),
      matrix: get(stores.matrix),
      state: get(stores.state),
      changes: get(stores.changes),
      artwork: document.querySelector("#coaEdit") ? JSON.parse(document.querySelector("#coaEdit").dataset.coa) : null,
      gallery: [...document.querySelectorAll("main svg.coa")].map(svg => JSON.parse(svg.dataset.coa))
    };
  });
}
async function setSize(page, size) {
  await page.evaluate(async value => {
    const {size} = await import("/src/lib/data/stores.ts");
    const {tick} = await import("/src/lib/testing/browser-runtime.ts");
    size.set(value);
    await tick();
  }, size);
}
async function control(page, index, icon) {
  await page.$$eval(
    `main .control use[href="#${icon}-icon"]`,
    (nodes, index) => nodes[index].parentElement.dispatchEvent(new MouseEvent("click", {bubbles: true})),
    index
  );
}

test("gallery sizing generates missing entries once and restores hidden entries without rerolling", async t => {
  const page = await session(t);
  const initial = await snapshot(page);
  assert.equal(initial.gallery.length, 6);
  assert.equal(initial.history.length, 6);
  assert.deepEqual(initial.matrices, [[0, 1, 2, 3, 4, 5]]);
  await setSize(page, 200);
  const expanded = await snapshot(page);
  assert.equal(expanded.gallery.length, 24);
  assert.equal(expanded.history.filter(Boolean).length, 24);
  assert.deepEqual(expanded.gallery.slice(0, 6), initial.gallery);
  assert.equal(new Set(expanded.matrices[0]).size, 24);
  await setSize(page, 400);
  assert.deepEqual((await snapshot(page)).gallery, initial.gallery);
  await setSize(page, 200);
  assert.deepEqual((await snapshot(page)).history, expanded.history);
  assert.deepEqual((await snapshot(page)).gallery, expanded.gallery);
  // Presentation and modal changes are not matrix-generation triggers.
  await page.evaluate(async () => {
    const s = await import("/src/lib/data/stores.ts");
    const {tick, get} = await import("/src/lib/testing/browser-runtime.ts");
    s.background.set("#123456");
    s.fontColor.set("#abcdef");
    s.tinctures.set({...get(s.tinctures)});
    s.state.update(value => ({...value, license: 1}));
    await tick();
    s.state.update(value => ({...value, license: 0}));
    await tick();
  });
  assert.deepEqual((await snapshot(page)).history, expanded.history);
  assert.deepEqual((await snapshot(page)).matrices, expanded.matrices);
});

test("one-card regeneration preserves siblings and gallery rollback restores the earlier matrix", async t => {
  const page = await session(t);
  const initial = await snapshot(page);
  await control(page, 1, "dice");
  const changed = await snapshot(page);
  assert.equal(changed.matrix, 1);
  assert.equal(changed.history.length, initial.history.length + 1);
  assert.deepEqual(changed.matrices[1], [0, 6, 2, 3, 4, 5]);
  assert.notDeepEqual(changed.gallery[1], initial.gallery[1]);
  for (const i of [0, 2, 3, 4, 5]) assert.deepEqual(changed.gallery[i], initial.gallery[i]);
  await page.keyboard.press("Backspace");
  assert.deepEqual((await snapshot(page)).gallery, initial.gallery);
  await page.keyboard.press("Enter");
  assert.deepEqual((await snapshot(page)).gallery, changed.gallery);
  await page.keyboard.press("Enter");
  const rerolled = await snapshot(page);
  assert.equal(rerolled.matrix, 2);
  assert.equal(rerolled.history.length, changed.history.length + 6);
  assert.notDeepEqual(rerolled.gallery, changed.gallery);
  await page.keyboard.press("Backspace");
  assert.deepEqual((await snapshot(page)).gallery, changed.gallery);
});

test("opening a nonfirst gallery card and rerolling keeps editor and gallery history aligned", async t => {
  const page = await session(t);
  const initial = await snapshot(page);
  await control(page, 2, "pencil");
  await page.waitForSelector("#coaEdit .field");
  const opened = await snapshot(page);
  assert.equal(opened.state.i, 2);
  assert.equal(opened.state.c, 2);
  await page.keyboard.press("Enter");
  const rerolled = await snapshot(page);
  assert.equal(rerolled.state.c, initial.history.length);
  assert.deepEqual(rerolled.matrices[1], [0, 1, 6, 3, 4, 5]);
  assert.notEqual(rerolled.changes[0], opened.changes[0]);
  await page.keyboard.press("Backspace");
  assert.equal((await snapshot(page)).changes[0], opened.changes[0]);
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.querySelector("#coaEdit"));
  const back = await snapshot(page);
  assert.deepEqual(back.gallery[2], opened.artwork);
  for (const i of [0, 1, 3, 4, 5]) assert.deepEqual(back.gallery[i], initial.gallery[i]);
});

test("a seed initializes the editor once and reroll/rollback retain the original artwork", async t => {
  const page = await session(t, {seed: "gallery-runes"});
  const initial = await snapshot(page);
  assert.equal(initial.state.edit, 1);
  assert.equal(initial.history.length, 1);
  await page.keyboard.press("Enter");
  const rerolled = await snapshot(page);
  assert.equal(rerolled.history.length, 2);
  assert.notEqual(rerolled.changes[0], initial.changes[0]);
  await page.keyboard.press("Backspace");
  assert.equal((await snapshot(page)).changes[0], initial.changes[0]);
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.querySelector("#coaEdit"));
  assert.deepEqual((await snapshot(page)).gallery[0], initial.artwork);
});

test("viewer captures initial seeded artwork, preserves size and opens an editable link", async t => {
  const page = await session(t, {seed: "viewer-runes", view: "1", size: "320", marker: "keep"});
  const artwork = await page.$eval("#viewer svg.coa", svg => ({
    coa: svg.dataset.coa,
    width: svg.getAttribute("width"),
    height: svg.getAttribute("height")
  }));
  assert.equal(artwork.width, "320");
  assert.equal(artwork.height, "320");
  await page.evaluate(async () => {
    const s = await import("/src/lib/data/stores.ts");
    const {tick} = await import("/src/lib/testing/browser-runtime.ts");
    s.history.set([{t1: "gules", name: "Replacement"}]);
    s.matrix.set(1);
    await tick();
    window.opened = [];
    window.open = (url, target) => {
      const record = {url, target, focused: false};
      window.opened.push(record);
      return {
        focus: () => {
          record.focused = true;
        }
      };
    };
  });
  assert.equal(await page.$eval("#viewer svg.coa", svg => svg.dataset.coa), artwork.coa);
  await page.click("#viewer");
  const [opened] = await page.evaluate(() => window.opened);
  assert.equal(opened.target, "_blank");
  assert.equal(opened.focused, true);
  const url = new URL(opened.url);
  assert.equal(url.searchParams.get("view"), "0");
  assert.equal(url.searchParams.get("seed"), "viewer-runes");
  assert.equal(url.searchParams.get("marker"), "keep");
  assert.equal(await page.$("header"), null);
});

test("explicit viewer artwork renders with noedit and never opens a popup", async t => {
  const page = await session(t, {coa: JSON.stringify({t1: "or", shield: "heater", name: "View only"}), view: "1", noedit: "1"});
  await page.evaluate(() => {
    window.openCalls = 0;
    window.open = () => {
      window.openCalls++;
      return null;
    };
  });
  await page.click("#viewer");
  assert.equal(await page.evaluate(() => window.openCalls), 0);
  const coa = await page.$eval("#viewer svg.coa", svg => JSON.parse(svg.dataset.coa));
  assert.equal(coa.name, "View only");
  assert.equal(coa.t1, "or");
});

test("animated About artwork retains viewport sizing and palette updates across remounts", async t => {
  const page = await session(t, {}, {width: 500, height: 800});
  for (const [viewport, expected] of [
    [{width: 500, height: 800}, "450"],
    [{width: 800, height: 500}, "250"]
  ]) {
    await page.setViewport(viewport);
    await page.keyboard.press("F1");
    await page.waitForSelector("#about > svg");
    assert.equal(await page.$eval("#about > svg", svg => svg.getAttribute("width")), expected);
    assert.equal(await page.$$eval("#about #shieldAbout", nodes => nodes.length), 1);
    await page.evaluate(async () => {
      const {colors} = await import("/src/lib/data/stores.ts");
      const {tick} = await import("/src/lib/testing/browser-runtime.ts");
      colors.update(value => Object.fromEntries(Object.keys(value).map(key => [key, "#123456"])));
      await tick();
    });
    assert.equal(await page.$eval('#about g[stroke="none"] rect', node => node.getAttribute("fill")), "#123456");
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => !document.querySelector("#about"));
  }
});
