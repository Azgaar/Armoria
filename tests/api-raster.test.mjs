import assert from "node:assert/strict";
import {after, before, test} from "node:test";
import {fileURLToPath} from "node:url";
import {createServer} from "vite";
import {svelte, vitePreprocess} from "@sveltejs/vite-plugin-svelte";
import {createConverter as png} from "convert-svg-to-png";
import {createConverter as jpeg} from "convert-svg-to-jpeg";
import puppeteer from "puppeteer";

const root = fileURLToPath(new URL("../", import.meta.url));
let server, browser, page, image;
const converters = [];
const launch = {
  headless: true,
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
  args: process.env.PUPPETEER_NO_SANDBOX ? ["--no-sandbox"] : []
};
const mocks = {
  "$app/env": "export const browser = false;",
  "$app/server": `import {readFileSync} from 'node:fs'; export function read(url) {return new Response(readFileSync(${JSON.stringify(root)} + url.replace(/^\\//, '')));}`,
  [root + "src/lib/api/claims.ts"]: `export async function getClaim() {throw new Error('Unexpected database lookup');}`,
  "@sparticuz/chromium-min": 'export default {args: [], executablePath: async () => "unused-server-browser"};',
  "convert-svg-to-png": 'export const createConverter = () => globalThis.armoriaRasterFixture("png");',
  "convert-svg-to-jpeg": 'export const createConverter = () => globalThis.armoriaRasterFixture("jpeg");'
};
before(
  async () => {
    // Keep the real route, renderer and converters; override only their browser
    // launch location and external services. Never download a server browser or query claims.
    globalThis.armoriaRasterFixture = async format => {
      const converter = await (format === "png" ? png : jpeg)({launch});
      converters.push(converter);
      return converter;
    };
    server = await createServer({
      root,
      configFile: false,
      logLevel: "silent",
      server: {middlewareMode: true, hmr: false, watch: null},
      optimizeDeps: {noDiscovery: true, include: []},
      resolve: {alias: {"#lib": root + "src/lib"}},
      ssr: {noExternal: ["@sparticuz/chromium-min", "convert-svg-to-png", "convert-svg-to-jpeg"]},
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
    browser = await puppeteer.launch(launch);
    page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request", request => (/^(data|blob):/.test(request.url()) ? request.continue() : request.abort()));
  },
  {timeout: 60000}
);
after(async () => {
  await Promise.all(converters.map(converter => converter.close()));
  await browser?.close();
  await server?.close();
  delete globalThis.armoriaRasterFixture;
});
async function request(format, or = "123456") {
  const url = new URL("https://example.test/api");
  url.search = new URLSearchParams({format, size: "200", seed: "123", or, coa: JSON.stringify({t1: "or", shield: "heater"})});
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
