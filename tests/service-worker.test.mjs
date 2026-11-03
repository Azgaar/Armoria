import assert from "node:assert/strict";
import {after, before, test} from "node:test";
import {createServer} from "node:http";
import {preview} from "vite";
import puppeteer from "puppeteer";

let app, proxy, browser, page, origin;
let deployment = "first";
const errors = [];
before(
  async () => {
    app = await preview({preview: {host: "127.0.0.1", port: 0}});
    const target = `http://127.0.0.1:${app.httpServer.address().port}`;
    // Serve the actual production build. Change only deployment markers so the
    // same-origin service worker sees a new script and fresh HTML on redeploy.
    proxy = createServer(async (request, response) => {
      try {
        const upstream = await fetch(target + request.url);
        const headers = Object.fromEntries(upstream.headers);
        for (const name of ["content-encoding", "content-length", "transfer-encoding"]) delete headers[name];
        let body = Buffer.from(await upstream.arrayBuffer());
        if (headers["content-type"]?.includes("text/html"))
          body = Buffer.from(body.toString().replace("</head>", `<meta name="deployment" content="${deployment}"></head>`));
        if (request.url.split("?")[0] === "/service-worker.js")
          body = Buffer.from(body.toString() + `\n// local deployment ${deployment}\n`);
        response.writeHead(upstream.status, headers);
        response.end(body);
      } catch {
        response.writeHead(502);
        response.end();
      }
    });
    await new Promise(resolve => proxy.listen(0, "127.0.0.1", resolve));
    origin = `http://127.0.0.1:${proxy.address().port}`;
    browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: process.env.PUPPETEER_NO_SANDBOX ? ["--no-sandbox"] : []
    });
    page = await browser.newPage();
    page.on("pageerror", error => errors.push(error.message));
    await page.setRequestInterception(true);
    page.on("request", request =>
      request.url().startsWith(origin + "/") || /^(blob|data):/.test(request.url()) ? request.continue() : request.abort()
    );
  },
  {timeout: 60000}
);
after(async () => {
  await browser?.close();
  if (proxy) {
    proxy.closeAllConnections();
    await new Promise(resolve => proxy.close(resolve));
  }
  await app?.close();
});

test("production service-worker updates show the new deploy and retain its offline fallback", {timeout: 120000}, async () => {
  const url = origin + "/?" + new URLSearchParams({coa: JSON.stringify({t1: "or", shield: "heater"})});
  await page.goto(url, {waitUntil: "networkidle0"});
  await page.waitForSelector("#coaEdit .field");
  assert.equal(await page.$eval('meta[name="deployment"]', node => node.content), "first");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller)
      await new Promise(resolve => navigator.serviceWorker.addEventListener("controllerchange", resolve, {once: true}));
  });
  deployment = "second";
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    const changed = new Promise(resolve => navigator.serviceWorker.addEventListener("controllerchange", resolve, {once: true}));
    await registration.update();
    await changed;
  });
  await page.reload({waitUntil: "networkidle0"});
  await page.waitForSelector("#coaEdit .field");
  assert.equal(await page.$eval('meta[name="deployment"]', node => node.content), "second");
  await page.setOfflineMode(true);
  await page.reload({waitUntil: "networkidle0"});
  await page.waitForSelector("#coaEdit .field");
  assert.equal(await page.$eval('meta[name="deployment"]', node => node.content), "second");
  assert.equal(await page.$eval("#coaEdit .field", node => node.getAttribute("fill")), "#ffe066");
  assert.deepEqual(errors, []);
});
