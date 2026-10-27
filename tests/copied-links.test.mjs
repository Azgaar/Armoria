import assert from "node:assert/strict";
import {after, before, test} from "node:test";
import {createServer} from "vite";
import puppeteer from "puppeteer";

let server, browser, page, origin, expected, editLink;
const errors = [];
const special = `Salt & Sea + Sun # 100% %2B %26 / ? = " O'Brien – 東京 🛡`;
const coa = {
  name: special,
  t1: "chequy-or-azure",
  shield: "heater",
  charges: [{charge: "eagle", t: "gules", t2: "azure", t3: "#123456", p: "e"}],
  inscriptions: [{text: `  ${special}  `, font: "Arial", size: 12, color: "#000000", path: "M-80 60 L80 60"}]
};

async function configure(target) {
  target.on("pageerror", error => errors.push(error.message));
  await target.setRequestInterception(true);
  target.on("request", request =>
    request.url().startsWith(origin) || /^(data|blob):/.test(request.url()) ? request.continue() : request.abort()
  );
  await target.evaluateOnNewDocument(() => {
    // Capture only the clipboard boundary; exercise the real menu handlers.
    window.copiedTexts = [];
    Object.defineProperty(navigator, "clipboard", {value: {writeText: async text => window.copiedTexts.push(text)}});
  });
}
async function copy(label) {
  return page.evaluate(async label => {
    const button = [...document.querySelectorAll("li")].find(item => item.textContent.trim() === label);
    if (!button) throw new Error(`Missing copy control: ${label}`);
    window.copiedTexts.length = 0;
    button.click();
    await Promise.resolve();
    if (window.copiedTexts.length !== 1) throw new Error("Expected one clipboard write");
    return window.copiedTexts[0];
  }, label);
}

before(
  async () => {
    server = await createServer({logLevel: "silent", server: {host: "127.0.0.1", port: 0}});
    await server.listen();
    origin = `http://127.0.0.1:${server.httpServer.address().port}`;
    browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: process.env.PUPPETEER_NO_SANDBOX ? ["--no-sandbox"] : []
    });
    page = await browser.newPage();
    await configure(page);
    const query = new URLSearchParams({coa: JSON.stringify(coa), session: "do-not-copy", returnOrigin: "https://map.invalid"});
    await page.goto(`${origin}/?${query}#editor`, {waitUntil: "networkidle0"});
    await page.waitForSelector("#coaEdit textPath");
    await page.evaluate(async () => {
      const {colors} = await import("/src/lib/data/stores.ts");
      colors.update(palette => ({...palette, gules: "#aa1234", azure: "#123abc"}));
    });
    await page.waitForFunction(() => {
      const coa = JSON.parse(new URL(location.href).searchParams.get("coa"));
      return coa.t1 === "chequy-or-#123abc" && coa.charges[0].t === "#aa1234";
    });
    expected = JSON.parse(new URL(page.url()).searchParams.get("coa"));
    assert.equal(expected.name, special);
    assert.equal(expected.inscriptions[0].text, `  ${special}  `);
  },
  {timeout: 60000}
);
after(async () => {
  await browser?.close();
  await server?.close();
});

test("Copy edit link preserves query separators, literal percent escapes, and Unicode", async () => {
  editLink = await copy("Copy edit link");
  const url = new URL(editLink);
  assert.equal(url.origin, origin);
  assert.equal(url.pathname, "/");
  assert.equal(url.hash, "");
  assert.deepEqual([...url.searchParams.keys()], ["coa"]);
  assert.deepEqual(JSON.parse(url.searchParams.get("coa")), expected);
  assert.equal(JSON.parse(url.searchParams.get("coa")).name, special);
});

test("Copy API link carries the same COA as the address bar with no injected parameters", async () => {
  const url = new URL(await copy("Copy API link"));
  assert.equal(url.origin, "https://armoria.vercel.app");
  assert.equal(url.pathname, "/api");
  assert.equal(url.searchParams.get("size"), "500");
  assert.equal(url.searchParams.get("format"), "png");
  assert.deepEqual([...url.searchParams.keys()].sort(), ["coa", "format", "size"]);
  assert.equal(url.hash, "");
  assert.deepEqual(JSON.parse(url.searchParams.get("coa")), expected);
});

test("Copy COA string is one encoded JSON value usable directly in a query", async () => {
  const encoded = await copy("Copy COA string");
  assert.deepEqual(JSON.parse(decodeURIComponent(encoded)), expected);
  const url = new URL(`https://example.test/api?coa=${encoded}`);
  assert.deepEqual([...url.searchParams.keys()], ["coa"]);
  assert.equal(url.hash, "");
  assert.deepEqual(JSON.parse(url.searchParams.get("coa")), expected);
  // When using URLSearchParams, decode the copied component once before setting it.
  const query = new URLSearchParams();
  query.set("coa", decodeURIComponent(encoded));
  assert.deepEqual(JSON.parse(new URLSearchParams(query.toString()).get("coa")), expected);
});

test("reopening the copied edit link in a fresh browser context preserves artwork and text", async () => {
  const context = await browser.createBrowserContext();
  const reopened = await context.newPage();
  try {
    await configure(reopened);
    await reopened.goto(editLink || (await copy("Copy edit link")), {waitUntil: "networkidle0"});
    await reopened.waitForSelector("#coaEdit textPath");
    const actual = await reopened.$eval("#coaEdit", svg => ({
      coa: JSON.parse(svg.dataset.coa),
      text: [...svg.querySelectorAll("textPath tspan")].map(node => node.textContent).join("|")
    }));
    assert.deepEqual(actual.coa, expected);
    assert.equal(actual.text, `  ${special}  `);
    assert.equal(actual.coa.t1, "chequy-or-#123abc");
    assert.equal(actual.coa.charges[0].t, "#aa1234");
    assert.equal(actual.coa.charges[0].t2, "#123abc");
    assert.equal(actual.coa.charges[0].t3, "#123456");
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});
