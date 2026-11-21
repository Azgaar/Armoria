import assert from "node:assert/strict";
import {after, before, test} from "node:test";
import {createServer} from "vite";
import puppeteer from "puppeteer";

let server, browser, origin;
const pixel =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=";
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

async function session(t) {
  const context = await browser.createBrowserContext();
  t.after(() => context.close());
  const page = await context.newPage();
  await page.setViewport({width: 1440, height: 1000});
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  t.after(() => assert.deepEqual(errors, []));
  await page.setRequestInterception(true);
  page.on("request", r => (r.url().startsWith(origin + "/") || /^(data|blob):/.test(r.url()) ? r.continue() : r.abort()));
  await page.evaluateOnNewDocument(() => localStorage.setItem("locale", "en"));
  await page.goto(
    origin + "/?" + new URLSearchParams({coa: JSON.stringify({t1: "or", shield: "heater", name: "Resource test"})}),
    {waitUntil: "networkidle0"}
  );
  await page.waitForSelector("#coaEdit .field");
  return page;
}
async function open(page, name, selector) {
  await page.evaluate(async name => {
    const {state} = await import("/src/lib/data/stores.ts");
    state.update(value => ({...value, [name]: 1}));
  }, name);
  await page.waitForSelector(selector);
}
async function input(page, selector, value, event = "input") {
  await page.$eval(
    selector,
    (node, {value, event}) => {
      node.value = value;
      node.dispatchEvent(new Event(event, {bubbles: true}));
    },
    {value, event}
  );
}
async function button(page, selector, text) {
  await page.$$eval(
    selector + " button",
    (buttons, text) => {
      const node = buttons.find(node => node.textContent.trim() === text);
      if (!node) throw Error("No button " + text);
      node.click();
    },
    text
  );
}
async function file(page, selector, content, name, type, drop = false) {
  return page.evaluate(
    ({selector, content, name, type, drop}) => {
      const transfer = new DataTransfer();
      const bytes = content.startsWith("data:") ? Uint8Array.from(atob(content.split(",")[1]), c => c.charCodeAt(0)) : content;
      transfer.items.add(new File([bytes], name, {type}));
      const event = drop
        ? new DragEvent("drop", {bubbles: true, cancelable: true, dataTransfer: transfer})
        : new Event("input", {bubbles: true});
      const target = document.querySelector(drop ? selector : selector + ' input[type="file"]');
      if (!drop) target.files = transfer.files;
      target.dispatchEvent(event);
      return event.defaultPrevented;
    },
    {selector, content, name, type, drop}
  );
}
async function snapshot(page) {
  return page.evaluate(async () => {
    const s = await import("/src/lib/data/stores.ts");
    const {get, tick} = await import("/src/lib/testing/browser-runtime.ts");
    await tick();
    return {
      changes: get(s.changes),
      uploaded: get(s.uploaded),
      fonts: get(s.fonts),
      colors: get(s.colors),
      tinctures: get(s.tinctures),
      message: get(s.message)
    };
  });
}
async function deferredReaders(page) {
  await page.evaluate(() => {
    window.readers = [];
    window.FileReader = class {
      result = null;
      readyState = 0;
      aborted = false;
      readAsText(file) {
        this.file = file;
        this.readyState = 1;
        window.readers.push(this);
      }
      readAsDataURL(file) {
        this.file = file;
        this.dataURL = true;
        this.readyState = 1;
        window.readers.push(this);
      }
      abort() {
        this.aborted = true;
        this.readyState = 2;
      }
      async complete() {
        if (this.aborted) return;
        this.result = this.dataURL
          ? "data:" + this.file.type + ";base64," + btoa(String.fromCharCode(...new Uint8Array(await this.file.arrayBuffer())))
          : await this.file.text();
        this.readyState = 2;
        this.onload?.call(this, new ProgressEvent("load"));
      }
    };
  });
}

for (const [name, selector, content, filename, type] of [
  ["import", "#jsonUpload", '[{"t1":"gules","name":"Late import"}]', "late.json", "application/json"],
  ["raster", "#rasterUpload", pixel, "late.png", "image/png"],
  ["vector", "#vectorUpload", '<svg><g><path d="M0 0h10v10z"/></g></svg>', "late.svg", "image/svg+xml"]
]) {
  test(`closing ${name} aborts pending file work before reopening the dialog`, async t => {
    const page = await session(t);
    await deferredReaders(page);
    const before = await snapshot(page);
    await open(page, name, selector);
    assert.equal(await file(page, selector, content, filename, type, true), true);
    await page.$eval(selector + " .close", node => node.click());
    await page.waitForFunction(selector => !document.querySelector(selector), {}, selector);
    assert.equal(await page.evaluate(() => window.readers[0].aborted), true);
    await open(page, name, selector);
    await page.evaluate(async () => {
      await window.readers[0].complete();
    });
    assert.ok(await page.$(selector + ' input[type="file"]'));
    const after = await snapshot(page);
    assert.deepEqual(after.changes, before.changes);
    assert.deepEqual(after.uploaded, before.uploaded);
    assert.notEqual(after.message?.text, "success.coaLoaded");
  });
}

test("new selections and Cancel discard older vector reads", async t => {
  const page = await session(t);
  await deferredReaders(page);
  await open(page, "vector", "#vectorUpload");
  await file(page, "#vectorUpload", '<svg><g><path d="M0 0h10v10z"/></g></svg>', "old.svg", "image/svg+xml");
  await file(page, "#vectorUpload", '<svg><g><circle r="7"/></g></svg>', "new.svg", "image/svg+xml", true);
  assert.equal(await page.evaluate(() => window.readers[0].aborted), true);
  await page.evaluate(async () => {
    await window.readers[1].complete();
    await window.readers[0].complete();
  });
  await page.waitForFunction(() => document.querySelector("#vectorUpload textarea").value.includes("circle"));
  await file(page, "#vectorUpload", '<svg><g><rect width="4"/></g></svg>', "cancel.svg", "image/svg+xml", true);
  await button(page, "#vectorUpload", "Cancel");
  assert.equal(await page.evaluate(() => window.readers[2].aborted), true);
  await page.evaluate(() => window.readers[2].complete());
  assert.ok(await page.$('#vectorUpload input[type="file"]'));
});

test("raster geometry and license binding survive save and reload", async t => {
  const page = await session(t);
  await open(page, "raster", "#rasterUpload");
  await file(page, "#rasterUpload", pixel, "dialogRaster.png", "image/png");
  await page.waitForFunction(() =>
    document.querySelector("#rasterUpload image")?.getAttribute("href")?.startsWith("data:image/png")
  );
  await input(page, "#rasterUpload .inputs > div:nth-child(1) input", "80");
  await input(page, "#rasterUpload .inputs > div:nth-child(2) input", "5");
  await input(page, "#rasterUpload .inputs > div:nth-child(3) input", "-3");
  await input(page, "#rasterUpload .inputs > div:nth-child(6) select", "https://creativecommons.org/licenses/by/4.0", "change");
  await button(page, "#rasterUpload", "Add");
  await page.waitForFunction(() => !document.querySelector("#rasterUpload"));
  const saved = (await snapshot(page)).uploaded.dialograster;
  assert.match(saved.content, /license="https:\/\/creativecommons.org\/licenses\/by\/4.0"/);
  assert.match(saved.content, /x="15%"/);
  assert.match(saved.content, /y="7%"/);
  assert.match(saved.content, /width="80%"/);
  await page.reload({waitUntil: "networkidle0"});
  assert.deepEqual((await snapshot(page)).uploaded.dialograster, saved);
});

test("local fonts validate, persist and restore defaults", async t => {
  const page = await session(t);
  const initial = (await snapshot(page)).fonts;
  await open(page, "fonts", "#fonts");
  await page.$eval("#fonts form", node => node.requestSubmit());
  assert.ok(await page.$("#fonts"));
  assert.deepEqual((await snapshot(page)).fonts, initial);
  await input(page, "#fontName", "Dialog Local");
  await page.$eval("#fonts form", node => node.requestSubmit());
  await page.waitForFunction(() => !document.querySelector("#fonts"));
  assert.deepEqual((await snapshot(page)).fonts["Dialog Local"], {});
  await page.reload({waitUntil: "networkidle0"});
  assert.deepEqual((await snapshot(page)).fonts["Dialog Local"], {});
  await open(page, "fonts", "#fonts");
  await page.$eval("#fonts .linkButton", node => node.click());
  assert.deepEqual((await snapshot(page)).fonts, initial);
  assert.equal(await page.evaluate(() => localStorage.getItem("fonts")), null);
});

async function deferredFonts(page) {
  await page.evaluate(() => {
    const NativeFontFace = window.FontFace;
    window.fontRequests = [];
    window.FontFace = function (name, source) {
      const font = new NativeFontFace(name, source);
      font.load = () => new Promise((resolve, reject) => window.fontRequests.push({font, resolve: () => resolve(font), reject}));
      return font;
    };
  });
}
async function submitWebFont(page, name) {
  await input(page, "#fontType", "web", "change");
  await page.waitForSelector("#fontUrl");
  await input(page, "#fontName", name);
  await input(page, "#fontUrl", "https://fonts.invalid/fixture.woff2");
  await page.$eval("#fonts form", node => node.requestSubmit());
}

test("web fonts keep submitted metadata and ignore completions after closing", async t => {
  const page = await session(t);
  await deferredFonts(page);
  await open(page, "fonts", "#fonts");
  await submitWebFont(page, "Submitted Font");
  await input(page, "#fontName", "Changed While Loading");
  await input(page, "#fontUrl", "https://fonts.invalid/changed.woff2");
  await page.evaluate(() => window.fontRequests[0].resolve());
  await page.waitForFunction(() => !document.querySelector("#fonts"));
  assert.deepEqual((await snapshot(page)).fonts["Submitted Font"], {url: "https://fonts.invalid/fixture.woff2"});
  assert.equal((await snapshot(page)).fonts["Changed While Loading"], undefined);
  await open(page, "fonts", "#fonts");
  await submitWebFont(page, "Closed Font");
  await page.$eval('#fonts button[type="button"]', node => node.click());
  await page.waitForFunction(() => !document.querySelector("#fonts"));
  await open(page, "fonts", "#fonts");
  await page.evaluate(() => window.fontRequests[1].resolve());
  assert.equal((await snapshot(page)).fonts["Closed Font"], undefined);
  assert.ok(await page.$("#fonts"));
  assert.equal(await page.evaluate(() => [...document.fonts].some(font => font.family === "Closed Font")), false);
});

test("tinctures preserve unlocked defaults, validate weights, persist edits and restore without relocking", async t => {
  const page = await session(t);
  await open(page, "tinctures", "#tinctures");
  assert.deepEqual(await page.evaluate(() => ["colors", "tinctures"].map(key => localStorage.getItem(key))), [null, null]);
  const before = await snapshot(page);
  await input(page, "#left tbody tr:first-child input", "0", "change");
  assert.deepEqual((await snapshot(page)).tinctures, before.tinctures);
  await button(page, "#left", "Add Color");
  await input(page, '#tincturesTable input[type="text"]', "Dialog Blue");
  await input(page, '#tincturesTable tr:first-child input[type="color"]', "#123456");
  await button(page, "#left", "Apply Color");
  await page.waitForFunction(() => JSON.parse(localStorage.getItem("colors") || "{}").dialogBlue === "#123456");
  assert.equal((await snapshot(page)).tinctures.colours.dialogBlue, 3);
  await page.$eval("#tinctures .close", node => node.click());
  await page.waitForFunction(() => !document.querySelector("#tinctures"));
  await page.reload({waitUntil: "networkidle0"});
  await open(page, "tinctures", "#tinctures");
  assert.equal((await snapshot(page)).colors.dialogBlue, "#123456");
  await page.$$eval("#tincturesTable tbody tr", rows =>
    rows
      .find(row => row.textContent.includes("dialogBlue"))
      .querySelector(".actionButton")
      .click()
  );
  assert.equal((await snapshot(page)).colors.dialogBlue, undefined);
  await button(page, "#left", "Restore defaults");
  assert.deepEqual(await page.evaluate(() => ["colors", "tinctures"].map(key => localStorage.getItem(key))), [null, null]);
  await input(page, "#left tbody tr:first-child input", "7", "change");
  assert.equal(JSON.parse(await page.evaluate(() => localStorage.getItem("tinctures"))).field.metals, 7);
});

test("newer font submissions supersede older loads and closing suppresses late errors", async t => {
  const page = await session(t);
  await deferredFonts(page);
  await open(page, "fonts", "#fonts");
  await submitWebFont(page, "Older Font");
  await submitWebFont(page, "Newer Font");
  await page.evaluate(() => window.fontRequests[0].resolve());
  assert.equal((await snapshot(page)).fonts["Older Font"], undefined);
  assert.ok(await page.$("#fonts"));
  await page.evaluate(() => window.fontRequests[1].resolve());
  await page.waitForFunction(() => !document.querySelector("#fonts"));
  assert.ok((await snapshot(page)).fonts["Newer Font"]);
  await open(page, "fonts", "#fonts");
  await submitWebFont(page, "Failed Font");
  await page.$eval('#fonts button[type="button"]', node => node.click());
  await page.waitForFunction(() => !document.querySelector("#fonts"));
  const message = (await snapshot(page)).message;
  await page.evaluate(() => window.fontRequests[2].reject(new Error("Delayed failure")));
  assert.deepEqual((await snapshot(page)).message, message);
});
