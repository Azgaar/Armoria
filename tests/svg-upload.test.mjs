import {after, before, test} from "node:test";
import assert from "node:assert/strict";
import {mkdtemp, writeFile, rm, readFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createServer} from "vite";
import puppeteer from "puppeteer";

let server, browser, page, directory, origin;
const externalRequests = [];
const errors = [];
const pixel =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=";

before(
  async () => {
    directory = await mkdtemp(join(tmpdir(), "armoria-svg-test-"));
    server = await createServer({logLevel: "silent", server: {host: "127.0.0.1", port: 0}});
    await server.listen();
    origin = `http://127.0.0.1:${server.httpServer.address().port}`;
    browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: process.env.PUPPETEER_NO_SANDBOX ? ["--no-sandbox"] : []
    });
    page = await browser.newPage();
    page.on("pageerror", error => errors.push(error.message));
    await page.setRequestInterception(true);
    page.on("request", request => {
      if (request.url().startsWith(origin) || /^(data|blob):/.test(request.url())) return request.continue();
      externalRequests.push(request.url());
      return request.abort();
    });
    await page.goto(origin, {waitUntil: "networkidle0"});
    await page.waitForSelector("svg.coa");
  },
  {timeout: 60000}
);

after(async () => {
  await browser?.close();
  await server?.close();
  if (directory) await rm(directory, {recursive: true, force: true});
});

async function openVector() {
  await page.evaluate(async () => {
    const {state} = await import("/src/lib/data/stores.ts");
    state.update(value => ({...value, vector: 1, license: 0}));
  });
  await page.waitForSelector("#vectorUpload input[type=file]");
}

async function upload(markup, name = "sanitizedCharge.svg") {
  const path = join(directory, name);
  await writeFile(path, markup);
  const input = await page.$("#vectorUpload input[type=file]");
  await input.uploadFile(path);
  await page.waitForSelector("#vectorUpload textarea");
  await page.waitForFunction(() => document.querySelector("#vectorUpload textarea")?.value.includes("<g"));
}

async function edit(markup) {
  await page.$eval(
    "#vectorUpload textarea",
    (element, value) => {
      element.value = value;
      element.dispatchEvent(new Event("input", {bubbles: true}));
    },
    markup
  );
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

test("SVG sanitizer removes active content and external resources while preserving static artwork", async () => {
  const result = await page.evaluate(async pixel => {
    const {sanitizeSvg, parseUploadedSvg} = await import("/src/lib/scripts/sanitizeSvg.ts");
    const input = `<svg xmlns="http://www.w3.org/2000/svg"><g id="good" transform="translate(2 3)" author="Author">
      <defs><linearGradient id="paint"><stop offset="0" stop-color="#fff"/></linearGradient><clipPath id="clip"><circle r="4"/></clipPath></defs>
      <path class="secondary tertiary" d="M0 0h10v10z" fill="url(#paint)" clip-path="url(#clip)" style="stroke:#123;stroke-width:2;fill-opacity:.5"/>
      <use href="#good"/><use xlink:href="#good"/><image href="${pixel}"/><text x="4">Safe text</text>
      <script>window.svgExecuted=1</script><foreignObject><img src="x" onerror="window.svgExecuted=1"/></foreignObject>
      <animate attributeName="href" values="javascript:alert(1)"/><set attributeName="onload" to="alert(1)"/>
      <image href="https://svg-test.invalid/image" onerror="window.svgExecuted=1"/>
      <use href="//svg-test.invalid/file.svg#x"/><use href="javascript:alert(1)"/>
      <path fill="url(https://svg-test.invalid/paint)" style="fill:url(//svg-test.invalid/paint);stroke:red;background:url(https://svg-test.invalid/css)"/>
      <style>@import url(https://svg-test.invalid/style)</style>
    </g></svg>`;
    const clean = sanitizeSvg(input);
    const svg = parseUploadedSvg(clean);
    document.body.append(svg);
    const path = svg.querySelector("path");
    return {
      clean,
      again: sanitizeSvg(clean),
      path: path.outerHTML,
      gradient: !!svg.querySelector("linearGradient"),
      local: svg.querySelector("use").getAttribute("href"),
      image: svg.querySelector("image").getAttribute("href")
    };
  }, pixel);
  assert.doesNotMatch(result.clean, /onerror|<script|foreignObject|<animate|<set|javascript:|svg-test.invalid|<style/);
  assert.equal(result.clean, result.again);
  assert.match(result.path, /secondary tertiary/);
  assert.match(result.path, /url\(#paint\)/);
  assert.match(result.path, /stroke-width:2/);
  assert.equal(result.gradient, true);
  assert.equal(result.local, "#good");
  assert.match(result.clean, /xlink:href="#good"/);
  assert.equal(result.image, pixel);
});

test("file upload and markup edits remain inert before saving, and invalid edits do not crash transforms", async () => {
  await openVector();
  await upload(
    '<svg xmlns="http://www.w3.org/2000/svg"><g><image href="/missing-review-image" onerror="window.svgExecuted=1"/><path class="secondary" d="M0 0h10v10z"/></g></svg>'
  );
  await edit(
    '<g transform="translate(4 5)"><path class="tertiary" d="M0 0h10v10z"/><image href="/missing-review-image" onerror="window.svgExecuted=1"/><script>window.svgExecuted=1</script></g>'
  );
  const preview = await page.$eval("#vectorUpload svg", element => element.outerHTML);
  assert.doesNotMatch(preview, /onerror|<script|missing-review/);
  assert.match(preview, /tertiary/);
  await page.$eval("#vectorUpload input[type=number]", element => {
    element.value = "12";
    element.dispatchEvent(new Event("input", {bubbles: true}));
  });
  await page.waitForFunction(
    () => document.querySelector("#vectorUpload svg g[transform]")?.getAttribute("transform") === "matrix(1 0 0 1 12 0)"
  );
  await edit("<");
  await page.$eval("#vectorUpload input[type=number]", element => {
    element.value = "8";
    element.dispatchEvent(new Event("input", {bubbles: true}));
  });
  await edit('<g><path class="tertiary" d="M0 0h10v10z"/><image href="x" onerror="window.svgExecuted=1"/></g>');
  await page.$eval('#vectorUpload input[placeholder="Charge id"]', element => {
    element.value = "sanitizedCharge";
    element.dispatchEvent(new Event("input", {bubbles: true}));
  });
  await page.$eval("#vectorUpload button", button => button.click());
  await page.waitForFunction(() => JSON.parse(localStorage.getItem("uploaded") || "{}").sanitizedcharge);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("uploaded")).sanitizedcharge);
  assert.doesNotMatch(saved.content, /onerror|href="x"/);
  assert.match(saved.content, /tertiary/);
  assert.equal(saved.data.colors, 3);
  assert.equal(await page.evaluate(() => window.svgExecuted), undefined);
});

test("older stored charges are sanitized at rendering, including replacement store objects", async () => {
  const result = await page.evaluate(async pixel => {
    const {uploaded} = await import("/src/lib/data/stores.ts");
    const {updateCharge} = await import("/src/lib/scripts/getters.js");
    uploaded.set({
      legacyVector: {
        type: "vector",
        content:
          '<g id="legacyVector"><image href="/missing" onerror="window.svgExecuted=1"/><path class="secondary" d="M0 0h5v5z"/></g>'
      },
      legacyRaster: {type: "raster", content: `<image id="legacyRaster" href="${pixel}" onload="window.svgExecuted=1"/>`}
    });
    updateCharge("legacyVector");
    updateCharge("legacyRaster");
    return {vector: document.getElementById("legacyVector").outerHTML, raster: document.getElementById("legacyRaster").outerHTML};
  }, pixel);
  assert.doesNotMatch(result.vector + result.raster, /onerror|onload|missing/);
  assert.match(result.vector, /secondary/);
  assert.match(result.raster, /data:image\/png;base64/);
});

test("malformed namespaces, encoded URLs and CSS escapes cannot bypass the policy", async () => {
  const clean = await page.evaluate(async () => {
    const {sanitizeSvg} = await import("/src/lib/scripts/sanitizeSvg.ts");
    const fixtures = [
      '<g><use href="jav&#x61;script:alert(1)"/><image href="data:image/svg+xml,&lt;svg onload=alert(1)&gt;"/></g>',
      '<svg><foreignObject><math><mtext><img src=x onerror="window.svgExecuted=1"></mtext></math></foreignObject></svg>',
      '<g><path style="fill:u\\72l(https://svg-test.invalid/escaped);stroke:red" fill="u\\72l(https://svg-test.invalid/escaped)"/></g>',
      '<g><a href="javascript:alert(1)"><text>Click</text></a><style><img src=x onerror="window.svgExecuted=1"></style></g>',
      '<g xmlns="http://www.w3.org/1999/xhtml"><img src=x onerror="window.svgExecuted=1"/></g>'
    ];
    return fixtures.map(value => sanitizeSvg(value)).join("");
  });
  assert.doesNotMatch(clean, /onerror|onload|javascript|data:image\/svg|svg-test.invalid|<img|<a[ >]|<style/);
});

test("charge attribution renders as text and permits only HTTP links", async () => {
  await page.evaluate(async () => {
    const {state} = await import("/src/lib/data/stores.ts");
    const charge = document.getElementById("legacyVector");
    charge.setAttribute("source", "javascript:alert(1)");
    charge.setAttribute("license", "javascript:alert(1)");
    charge.setAttribute("author", '<img src=x onerror="window.svgExecuted=1">');
    document.querySelectorAll("svg.coa .charge[charge]").forEach(element => element.setAttribute("charge", "legacyVector"));
    state.update(value => ({...value, vector: 0, license: 1}));
  });
  await page.waitForSelector("#license");
  assert.equal(await page.$$eval("#license img, #license a[href^='javascript:']", elements => elements.length), 0);
  assert.match(await page.$eval("#license", element => element.textContent), /<img src=x onerror=/);
  assert.equal(await page.evaluate(() => window.svgExecuted), undefined);
});

test("the supplied template imports and preserves its paths and transforms", async () => {
  await openVector();
  await upload(
    '<?xml version="1.0" encoding="UTF-8"?>' +
      (await readFile(new URL("../static/charges/template.svg", import.meta.url), "utf8")),
    "templateReview.svg"
  );
  const result = await page.$eval("#vectorUpload textarea", element => element.value);
  assert.match(result, /<path/);
  assert.match(result, /stroke-width/);
  assert.equal(externalRequests.filter(url => url.includes("svg-test.invalid")).length, 0);
  assert.deepEqual(errors, []);
});

test("raster uploads retain their embedded image through preview and save", async () => {
  await page.evaluate(async () => {
    const {state} = await import("/src/lib/data/stores.ts");
    state.update(value => ({...value, vector: 0, raster: 1}));
  });
  await page.waitForSelector("#rasterUpload input[type=file]");
  const path = join(directory, "safeRaster.png");
  await writeFile(path, Buffer.from(pixel.split(",")[1], "base64"));
  await (await page.$("#rasterUpload input[type=file]")).uploadFile(path);
  await page.waitForFunction(() =>
    document.querySelector("#rasterUpload svg image")?.getAttribute("href")?.startsWith("data:image/png")
  );
  await page.$eval("#rasterUpload button", button => button.click());
  await page.waitForFunction(() => JSON.parse(localStorage.getItem("uploaded") || "{}").saferaster);
  assert.match(
    await page.evaluate(() => JSON.parse(localStorage.getItem("uploaded")).saferaster.content),
    /data:image\/png;base64/
  );
});

test("unsafe uploads already in localStorage remain inert after reloading the app", async () => {
  await page.evaluate(() => {
    localStorage.setItem(
      "uploaded",
      JSON.stringify({
        oldcharge: {
          category: "uploaded",
          type: "vector",
          data: {colors: 1},
          content: '<g id="oldcharge"><path d="M0 0h10v10z"/><image href="/missing" onerror="window.svgExecuted=1"/></g>'
        }
      })
    );
  });
  await page.reload({waitUntil: "networkidle0"});
  await page.waitForSelector("svg.coa");
  const content = await page.evaluate(async () => {
    const {updateCharge} = await import("/src/lib/scripts/getters.js");
    updateCharge("oldcharge");
    return document.getElementById("oldcharge").outerHTML;
  });
  assert.match(content, /<path/);
  assert.doesNotMatch(content, /onerror|missing/);
  assert.equal(await page.evaluate(() => window.svgExecuted), undefined);
  assert.deepEqual(errors, []);
});
