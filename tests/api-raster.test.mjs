import assert from "node:assert/strict";
import {after, before, test} from "node:test";
import {readFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import {createServer} from "vite";
import {svelte, vitePreprocess} from "@sveltejs/vite-plugin-svelte";
import puppeteer from "puppeteer";

const root = fileURLToPath(new URL("../", import.meta.url));
let server, browser, page, image, rasterizer, chromium;
const rasterBrowsers = [],
  launchOptions = [];
const previousVercel = process.env.VERCEL;
const launch = {
  headless: true,
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
  args: process.env.PUPPETEER_NO_SANDBOX ? ["--no-sandbox"] : []
};
const mocks = {
  "$app/env": "export const browser = false;",
  "$app/server": `import {readFileSync} from 'node:fs'; export function read(url) {return new Response(readFileSync(${JSON.stringify(root)} + url.replace(/^\\//, '')));}`,
  [root + "src/lib/api/claims.ts"]: `export async function getClaim() {throw new Error('Unexpected database lookup');}`,
  "@sparticuz/chromium-min": `export const downloads = []; export default {
    args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--server-argument"],
    executablePath: async url => {downloads.push(url); return "unused-server-browser";}
  };`,
  "puppeteer-core": "export default {launch: options => globalThis.armoriaRasterLaunch(options)};"
};
before(
  async () => {
    // Keep the real route, renderer and rasterizer; replace only the launch location.
    process.env.VERCEL = "1";
    globalThis.armoriaRasterLaunch = async options => {
      launchOptions.push(options);
      const {channel, ...base} = options;
      const browser = await puppeteer.launch({...base, ...launch});
      rasterBrowsers.push(browser);
      return browser;
    };
    server = await createServer({
      root,
      configFile: false,
      logLevel: "silent",
      server: {middlewareMode: true, hmr: false, watch: null},
      optimizeDeps: {noDiscovery: true, include: []},
      resolve: {alias: {"#lib": root + "src/lib"}},
      ssr: {noExternal: ["@sparticuz/chromium-min", "puppeteer-core"]},
      plugins: [
        {
          name: "real-raster-services",
          enforce: "pre",
          resolveId(id) {
            if (Object.hasOwn(mocks, id)) return "\0raster:" + id;
          },
          load(id) {
            if (id.startsWith("\0raster:")) return mocks[id.slice(8)];
          }
        },
        svelte({configFile: false, preprocess: vitePreprocess()})
      ]
    });
    image = (await server.ssrLoadModule("/src/routes/api/+server.ts")).GET;
    ({rasterizer} = await server.ssrLoadModule(root + "src/lib/api/raster.ts"));
    chromium = await server.ssrLoadModule("@sparticuz/chromium-min");
    assert.equal(chromium.downloads.length, 0, "module import must not resolve/download Chromium");
    await request("svg");
    assert.equal(chromium.downloads.length, 0, "SVG requests must not resolve/download Chromium");
    browser = await puppeteer.launch(launch);
    page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request", request => (/^(data|blob):/.test(request.url()) ? request.continue() : request.abort()));
  },
  {timeout: 60000}
);
after(async () => {
  await rasterizer?.close();
  await browser?.close();
  await server?.close();
  delete globalThis.armoriaRasterLaunch;
  if (previousVercel === undefined) delete process.env.VERCEL;
  else process.env.VERCEL = previousVercel;
});
async function request(format, or = "123456", {size = 200, coa = {t1: "or", shield: "heater"}} = {}) {
  const url = new URL("https://example.test/api");
  url.search = new URLSearchParams({format, size: String(size), seed: "123", or, coa: JSON.stringify(coa)});
  const response = await image({url});
  assert.equal(response.status, 200);
  return response;
}
for (const format of ["png", "jpeg", "jpg"]) {
  test(
    `real ${format.toUpperCase()} API output decodes at the requested size and preserves palette overrides`,
    {timeout: 30000},
    async () => {
      const response = await request(format);
      const mime = format === "png" ? "image/png" : "image/jpeg";
      assert.equal(response.headers.get("content-type"), mime);
      const bytes = Buffer.from(await response.arrayBuffer());
      if (format === "png") assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
      else assert.equal(bytes.subarray(0, 2).toString("hex"), "ffd8");
      const svg = await (await request("svg")).text();
      const second = Buffer.from(await (await request(format, "abcdef")).arrayBuffer());
      const result = await page.evaluate(
        async ({base64, second, mime, svg}) => {
          async function inspect(blob) {
            const url = URL.createObjectURL(blob);
            const image = new Image();
            image.src = url;
            await image.decode();
            const canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0);
            const center = [...ctx.getImageData(100, 100, 1, 1).data];
            const result = {width: image.width, height: image.height, center};
            URL.revokeObjectURL(url);
            return result;
          }
          const actual = await inspect(await (await fetch(`data:${mime};base64,${base64}`)).blob());
          const changed = await inspect(await (await fetch(`data:${mime};base64,${second}`)).blob());
          const expected = await inspect(new Blob([svg], {type: "image/svg+xml"}));
          return {actual, expected, changed};
        },
        {base64: bytes.toString("base64"), second: second.toString("base64"), mime, svg}
      );
      assert.equal(result.actual.width, 200);
      assert.equal(result.actual.height, 200);
      for (let channel = 0; channel < 3; channel++)
        assert.ok(Math.abs(result.actual.center[channel] - result.expected.center[channel]) <= (format === "png" ? 0 : 5));
      assert.ok(result.actual.center.slice(0, 3).some((value, channel) => Math.abs(value - result.changed.center[channel]) > 50));
    }
  );
}

async function inspectPixels(bytes, mime, size = 200) {
  return page.evaluate(
    async ({base64, mime, size}) => {
      const blob = await (await fetch(`data:${mime};base64,${base64}`)).blob();
      const url = URL.createObjectURL(blob);
      try {
        const image = new Image();
        image.src = url;
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        return {width: image.width, height: image.height, pixels: [...ctx.getImageData(0, 0, size, size).data]};
      } finally {
        URL.revokeObjectURL(url);
      }
    },
    {base64: Buffer.from(bytes).toString("base64"), mime, size}
  );
}

test("the production launch path pins Chromium 153 and CDP and reuses its browser", async () => {
  assert.equal(launchOptions.length, 1);
  assert.deepEqual(chromium.downloads, [
    "https://github.com/Sparticuz/chromium/releases/download/v153.0.0/chromium-v153.0.0-pack.x64.tar"
  ]);
  assert.equal(launchOptions[0].headless, "shell");
  assert.equal(launchOptions[0].protocol, "cdp");
  assert.deepEqual(launchOptions[0].args, ["--server-argument"]);
  assert.equal((await rasterBrowsers[0].pages()).length, 1, "only the initial blank page remains after conversions");
});

test("concurrent real requests retain independent dimensions and palettes without retained pages", {timeout: 30000}, async () => {
  const requests = [
    {size: 80, color: "123456", format: "png"},
    {size: 120, color: "abcdef", format: "jpeg"},
    {size: 160, color: "ff8800", format: "png"}
  ];
  const outputs = await Promise.all(
    requests.map(async spec => {
      const response = await request(spec.format, spec.color, {size: spec.size});
      const bytes = Buffer.from(await response.arrayBuffer());
      assert.equal(Number(response.headers.get("content-length")), bytes.length);
      assert.equal(response.headers.get("cache-control"), "public, max-age=60");
      return bytes;
    })
  );
  for (let i = 0; i < requests.length; i++) {
    const spec = requests[i];
    const actual = await inspectPixels(outputs[i], "image/" + spec.format, spec.size);
    const reference = await request("svg", spec.color, {size: spec.size});
    const expected = await inspectPixels(await reference.arrayBuffer(), "image/svg+xml", spec.size);
    assert.equal(actual.width, spec.size);
    assert.equal(actual.height, spec.size);
    const center = 4 * ((spec.size / 2) * spec.size + spec.size / 2);
    for (let channel = 0; channel < 3; channel++)
      assert.ok(Math.abs(actual.pixels[center + channel] - expected.pixels[center + channel]) <= (spec.format === "png" ? 0 : 5));
  }
  assert.equal(launchOptions.length, 1);
  assert.equal((await rasterBrowsers[0].pages()).length, 1);
});

test("charged and patterned raster artwork retains SVG geometry, dependencies and transparency", {timeout: 30000}, async () => {
  const coa = {
    t1: "vair-or-azure",
    shield: "oldFrench",
    charges: [{charge: "roundel", t: "gules", t2: "vair-or-vert", p: "e"}],
    ordinaries: [{ordinary: "bordure", t: "gules"}]
  };
  const png = await request("png", "123456", {coa});
  const svg = await request("svg", "123456", {coa});
  const actual = await inspectPixels(await png.arrayBuffer(), "image/png");
  const expected = await inspectPixels(await svg.arrayBuffer(), "image/svg+xml");
  assert.deepEqual(actual.pixels, expected.pixels);
  assert.equal(actual.pixels[3], 0, "PNG retains transparency outside the shield");
  const jpeg = await request("jpeg", "123456", {coa});
  const opaque = await inspectPixels(await jpeg.arrayBuffer(), "image/jpeg");
  assert.ok(
    opaque.pixels.slice(0, 3).every(channel => channel >= 250),
    "JPEG retains a white background"
  );
});

test("embedded WOFF2 fonts render without network access and affect inscription pixels", {timeout: 30000}, async () => {
  const font = (await readFile(new URL("./fixtures/fonts/almendra-sc.woff2", import.meta.url))).toString("base64");
  const svg = embedded =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">${embedded ? `<style>@font-face{font-family:Fixture;src:url(data:font/woff2;base64,${font})}</style>` : ""}<rect width="200" height="200" fill="white"/><text x="5" y="100" font-size="30" font-family="Fixture,serif">Armoria AV</text></svg>`;
  const actual = await inspectPixels(await rasterizer.convert(svg(true), 200, "png"), "image/png");
  const fallback = await inspectPixels(await rasterizer.convert(svg(false), 200, "png"), "image/png");
  const differences = actual.pixels.filter((value, i) => value !== fallback.pixels[i]).length;
  assert.ok(differences > 100, "the embedded face must load, rather than silently rendering the fallback font");
  assert.equal((await rasterBrowsers[0].pages()).length, 1);
});
