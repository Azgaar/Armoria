import assert from "node:assert/strict";
import {after, before, test} from "node:test";
import {mkdtemp, readFile, rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createServer} from "vite";
import puppeteer from "puppeteer";

let server, browser, page, session, directory, origin, source;
const errors = [];
const coa = {
  t1: "chequy-or-azure",
  shield: "heater",
  charges: [{charge: "eagle", t: "gules", p: "e"}],
  inscriptions: [{text: "  Élan & <shield>  |   |fin  ", font: "Arial", size: 12, color: "#000000", path: "M-80 60 L80 60"}]
};

async function configure(target) {
  target.on("pageerror", error => errors.push(error.message));
  await target.setRequestInterception(true);
  target.on("request", request =>
    request.url().startsWith(origin) || /^(data|blob):/.test(request.url()) ? request.continue() : request.abort()
  );
  await target.evaluateOnNewDocument(() => {
    Object.defineProperty(window, "XSLTProcessor", {value: undefined, configurable: true});
    localStorage.setItem("grad", "no");
    localStorage.setItem("diaper", "no");
    localStorage.setItem("scale", "0.2");
  });
}
async function ready(target) {
  await target.waitForSelector("#coaEdit textPath tspan");
  await target.waitForSelector("#defs #eagle path");
}
async function inspectSVG(target, svg) {
  return target.evaluate(text => {
    const doc = new DOMParser().parseFromString(text, "image/svg+xml");
    return {
      valid: !doc.querySelector("parsererror"),
      metadata: doc.querySelector("metadata.armoria-coa")?.textContent,
      lines: [...doc.querySelectorAll("textPath tspan")].map(node => node.textContent),
      charge: !!doc.querySelector("defs #eagle path"),
      pattern: !!doc.querySelector("defs pattern"),
      width: doc.documentElement.getAttribute("width"),
      height: doc.documentElement.getAttribute("height"),
      editorHandles: doc.querySelectorAll("#grid, #positions, .points").length
    };
  }, svg);
}
function assertSVG(result) {
  assert.equal(result.valid, true);
  assert.deepEqual(JSON.parse(result.metadata), JSON.parse(source.metadata));
  assert.deepEqual(result.lines, source.lines);
  assert.ok(result.lines.includes("   "), "retain whitespace-only inscription lines");
  assert.equal(result.charge, true);
  assert.equal(result.pattern, true);
  assert.equal(result.editorHandles, 0);
}

before(
  async () => {
    directory = await mkdtemp(join(tmpdir(), "armoria-exports-"));
    server = await createServer({logLevel: "silent", server: {host: "127.0.0.1", port: 0}});
    await server.listen();
    origin = `http://127.0.0.1:${server.httpServer.address().port}`;
    browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: process.env.PUPPETEER_NO_SANDBOX ? ["--no-sandbox"] : []
    });
    session = await browser.target().createCDPSession();
    await session.send("Browser.setDownloadBehavior", {behavior: "allowAndName", downloadPath: directory, eventsEnabled: true});
    page = await browser.newPage();
    await configure(page);
    await page.goto(`${origin}/?${new URLSearchParams({coa: JSON.stringify(coa)})}`, {waitUntil: "networkidle0"});
    await ready(page);
    source = await page.$eval("#coaEdit", svg => ({
      metadata: svg.dataset.coa,
      lines: [...svg.querySelectorAll("textPath tspan")].map(node => node.textContent)
    }));
  },
  {timeout: 60000}
);
after(async () => {
  await browser?.close();
  await server?.close();
  if (directory) await rm(directory, {recursive: true, force: true});
});

async function download(format) {
  let listener, timer;
  const completed = new Promise((resolve, reject) => {
    listener = event => {
      if (event.state === "completed") resolve(event.guid);
      if (event.state === "canceled") reject(new Error("Download canceled"));
    };
    session.on("Browser.downloadProgress", listener);
    timer = setTimeout(() => reject(new Error("No completed download")), 10000);
  });
  try {
    await page.evaluate(async format => {
      const {download} = await import("/src/lib/scripts/download.js");
      await download("Edit", format);
    }, format);
    return await readFile(join(directory, await completed));
  } finally {
    clearTimeout(timer);
    session.off("Browser.downloadProgress", listener);
  }
}

function pngMetadata(bytes) {
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  for (let offset = 8; offset + 12 <= bytes.length; ) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString("ascii", offset + 4, offset + 8);
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    if (type === "iTXt" && data.subarray(0, 11).toString() === "armoria-coa") return data.subarray(16).toString("utf8");
    offset += length + 12;
  }
  throw new Error("No PNG COA metadata");
}
function jpegMetadata(bytes) {
  assert.equal(bytes.readUInt16BE(0), 0xffd8);
  for (let offset = 2; offset + 4 <= bytes.length; ) {
    const marker = bytes.readUInt16BE(offset);
    if (marker === 0xffda || marker === 0xffd9) break;
    const length = bytes.readUInt16BE(offset + 2);
    const data = bytes.subarray(offset + 4, offset + 2 + length).toString("utf8");
    if (marker === 0xfffe && data.startsWith("armoria-coa:")) return data.slice(12);
    offset += length + 2;
  }
  throw new Error("No JPEG COA metadata");
}

test("FMG SVG serialization works without XSLT and retains inscription whitespace", async () => {
  assert.equal(await page.evaluate(() => typeof XSLTProcessor), "undefined");
  const svg = await page.evaluate(async () => (await import("/src/lib/scripts/download.js")).getSvgForMap());
  const result = await inspectSVG(page, svg);
  assertSVG(result);
  assert.equal(result.width, "500");
  assert.equal(result.height, "500");
});

test("SVG downloads contain valid artwork, exact text, and embedded COA metadata without XSLT", async () => {
  const bytes = await download("svg");
  assertSVG(await inspectSVG(page, bytes.toString("utf8")));
});

for (const format of ["png", "jpeg"]) {
  test(`${format.toUpperCase()} downloads decode and retain COA metadata without XSLT`, async () => {
    const bytes = await download(format);
    const metadata = format === "png" ? pngMetadata(bytes) : jpegMetadata(bytes);
    assert.deepEqual(JSON.parse(metadata), JSON.parse(source.metadata));
    const size = await page.evaluate(
      async ({base64, format}) => {
        const blob = await (await fetch(`data:image/${format};base64,${base64}`)).blob();
        const image = await createImageBitmap(blob);
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0);
        const pixels = context.getImageData(0, 0, image.width, image.height).data;
        const colors = new Set();
        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i + 3]) colors.add(`${pixels[i]},${pixels[i + 1]},${pixels[i + 2]}`);
        }
        const result = {width: image.width, height: image.height, colors: colors.size};
        image.close();
        return result;
      },
      {base64: bytes.toString("base64"), format}
    );
    assert.ok(size.width > 0 && size.height > 0);
    assert.ok(size.colors > 1, "download contains painted artwork, not an empty canvas");
  });
}

test("live FMG edits deliver a usable SVG to the opener without XSLT", async () => {
  await page.evaluate(() => {
    window.fmgMessages = [];
    window.addEventListener("message", event => window.fmgMessages.push({origin: event.origin, data: event.data}));
  });
  const opened = new Promise(resolve => page.once("popup", resolve));
  await page.evaluate(() => window.open("about:blank"));
  const popup = await opened;
  try {
    await configure(popup);
    await popup.goto(
      `${origin}/?${new URLSearchParams({from: "FMG", session: "export-test", returnOrigin: origin, coa: JSON.stringify(coa)})}`,
      {waitUntil: "networkidle0"}
    );
    await ready(popup);
    await popup.evaluate(async () => {
      const {changes} = await import("/src/lib/data/stores.ts");
      const coa = JSON.parse(document.querySelector("#coaEdit").dataset.coa);
      coa.t1 = "gules";
      changes.add(JSON.stringify(coa));
    });
    // The opener is a background tab while the editor popup is active, so its
    // animation frames may be suspended. Poll independently of requestAnimationFrame.
    await page.waitForFunction(
      () => window.fmgMessages.some(({data}) => data.type === "armoria:coa" && data.session === "export-test"),
      {polling: 100, timeout: 10000}
    );
    const message = await page.evaluate(() =>
      window.fmgMessages.find(({data}) => data.type === "armoria:coa" && data.session === "export-test")
    );
    assert.equal(message.origin, origin);
    assert.equal(message.data.version, 1);
    assert.equal(message.data.coa.t1, "gules");
    const result = await inspectSVG(page, message.data.svg);
    assert.equal(result.valid, true);
    assert.equal(result.charge, true);
    assert.deepEqual(JSON.parse(result.metadata), message.data.coa);
    assert.deepEqual(result.lines, source.lines);
    assert.deepEqual(errors, []);
  } finally {
    await popup.close();
  }
});
