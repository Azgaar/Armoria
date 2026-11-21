import assert from "node:assert/strict";
import {after, before, test} from "node:test";
import {fileURLToPath} from "node:url";
import {createServer} from "vite";

const root = fileURLToPath(new URL("../", import.meta.url));
let server, createRasterizer;
before(async () => {
  server = await createServer({
    root,
    configFile: false,
    logLevel: "silent",
    server: {middlewareMode: true, hmr: false, watch: null},
    optimizeDeps: {noDiscovery: true, include: []},
    resolve: {alias: {"#lib": root + "src/lib"}}
  });
  ({createRasterizer} = await server.ssrLoadModule("/src/lib/api/raster.ts"));
});
after(async () => server?.close());

function deferred() {
  let resolve;
  const promise = new Promise(done => {
    resolve = done;
  });
  return {promise, resolve};
}
function browserFixture({fail, gate} = {}) {
  const pages = [];
  const browser = {
    connected: true,
    closes: 0,
    pages,
    failure: fail,
    async newPage() {
      if (browser.failure === "newPage") throw new Error("page creation failed");
      const page = {
        closed: false,
        requests: [],
        async setJavaScriptEnabled(value) {
          page.javascript = value;
          if (browser.failure === "setup") throw new Error("setup failed");
        },
        async setRequestInterception() {},
        on(name, handler) {
          if (name === "request") page.request = handler;
        },
        async setViewport(value) {
          page.viewport = value;
        },
        async setContent(html) {
          page.html = html;
          if (browser.failure === "content") throw new Error("content failed");
        },
        async evaluate() {
          if (browser.failure === "fonts") throw new Error("font readiness failed");
        },
        async screenshot(options) {
          page.shot = options;
          if (gate) await gate(page);
          if (browser.failure === "screenshot") throw new Error("screenshot failed");
          return Buffer.from(page.html);
        },
        async close() {
          page.closed = true;
          if (browser.failure === "close") throw new Error("page close failed");
        }
      };
      pages.push(page);
      return page;
    },
    async close() {
      browser.closes++;
      browser.connected = false;
    }
  };
  return browser;
}
const svg = name => `<svg width="200" height="200"><text>${name}</text></svg>`;

test("invalid dimensions and module/factory loading never launch a browser", async () => {
  let launches = 0;
  const raster = createRasterizer(async () => {
    launches++;
    return browserFixture();
  });
  assert.equal(launches, 0);
  for (const size of [0, -1, 4097, Infinity, NaN, 1.5]) await assert.rejects(raster.convert(svg("invalid"), size, "png"));
  assert.equal(launches, 0);
  await raster.close();
});

test("concurrent cold requests share startup but keep page content, size and format separate", async () => {
  let launches = 0;
  const startup = deferred(),
    firstShot = deferred();
  const browser = browserFixture({gate: page => (page.html.includes("first") ? firstShot.promise : undefined)});
  const raster = createRasterizer(async () => {
    launches++;
    await startup.promise;
    return browser;
  });
  const first = raster.convert(svg("first"), 200, "png");
  const second = raster.convert(svg("second"), 80, "jpeg");
  assert.equal(launches, 1);
  startup.resolve();
  assert.match((await second).toString(), /second/);
  assert.equal(browser.pages.length, 2);
  assert.equal(browser.pages[0].closed, false);
  assert.equal(browser.pages[1].closed, true);
  assert.deepEqual(
    browser.pages.map(p => [p.viewport.width, p.shot.type]),
    [
      [200, "png"],
      [80, "jpeg"]
    ]
  );
  assert.equal(browser.pages[0].shot.omitBackground, true);
  assert.equal(browser.pages[1].shot.quality, 100);
  assert.match(browser.pages[0].html, /background:transparent/);
  assert.match(browser.pages[1].html, /background:#fff/);
  firstShot.resolve();
  assert.match((await first).toString(), /first/);
  assert.ok(browser.pages.every(p => p.closed));
  await raster.convert(svg("warm"), 40, "png");
  assert.equal(launches, 1);
  await raster.close();
  assert.equal(browser.closes, 1);
});

test("a failed launch is retryable and a disconnected browser is replaced", async () => {
  let launches = 0;
  const instances = [];
  const raster = createRasterizer(async () => {
    launches++;
    if (launches === 1) throw new Error("startup failed");
    const browser = browserFixture();
    instances.push(browser);
    return browser;
  });
  const failed = await Promise.allSettled([
    raster.convert(svg("failed-one"), 200, "png"),
    raster.convert(svg("failed-two"), 200, "jpeg")
  ]);
  assert.ok(failed.every(result => result.status === "rejected" && /startup failed/.test(result.reason.message)));
  assert.equal(launches, 1);
  await raster.convert(svg("recovered"), 200, "png");
  instances[0].connected = false;
  await raster.convert(svg("restarted"), 200, "jpeg");
  assert.equal(launches, 3);
  assert.ok(instances.every(b => b.pages.every(p => p.closed)));
  await raster.close();
});

test("page creation, setup, content, font and screenshot failures recover without retained pages", async () => {
  for (const fail of ["newPage", "setup", "content", "fonts", "screenshot"]) {
    const browser = browserFixture({fail});
    const raster = createRasterizer(async () => browser);
    await assert.rejects(raster.convert(svg("failure"), 200, "png"), /failed/);
    assert.equal(browser.pages.length, fail === "newPage" ? 0 : 1);
    assert.ok(
      browser.pages.every(p => p.closed),
      fail
    );
    browser.failure = undefined;
    assert.match((await raster.convert(svg("recovered"), 200, "png")).toString(), /recovered/);
    assert.ok(browser.pages.every(p => p.closed));
    await raster.close();
  }
});

test("failed page cleanup discards the browser so later requests do not accumulate orphan pages", async () => {
  const failed = browserFixture({fail: "close"}),
    healthy = browserFixture();
  let launches = 0;
  const raster = createRasterizer(async () => (++launches === 1 ? failed : healthy));
  await raster.convert(svg("first"), 200, "png");
  assert.equal(failed.closes, 1);
  await raster.convert(svg("second"), 200, "png");
  assert.equal(launches, 2);
  assert.ok(healthy.pages[0].closed);
  await raster.close();
});

test("raster pages disable active scripts and block network/file requests", async () => {
  const browser = browserFixture();
  const raster = createRasterizer(async () => browser);
  await raster.convert(svg("inert"), 200, "png");
  const page = browser.pages[0];
  assert.equal(page.javascript, false);
  for (const url of [
    "https://example.test/image",
    "http://127.0.0.1/",
    "file:///etc/passwd",
    "data:image/png;base64,AA==",
    "blob:local"
  ]) {
    let action;
    page.request({
      url: () => url,
      continue: async () => {
        action = "allow";
      },
      abort: async () => {
        action = "block";
      }
    });
    assert.equal(action, /^(data|blob):/.test(url) ? "allow" : "block", url);
  }
  await raster.close();
});

test("close waits for an in-progress launch and releases its browser", async () => {
  const startup = deferred(),
    browser = browserFixture();
  const raster = createRasterizer(async () => {
    await startup.promise;
    return browser;
  });
  const conversion = raster.convert(svg("pending"), 200, "png");
  const closing = raster.close();
  startup.resolve();
  await Promise.allSettled([conversion, closing]);
  assert.equal(browser.closes, 1);
});
