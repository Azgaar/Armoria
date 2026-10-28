import assert from "node:assert/strict";
import {after, before, test} from "node:test";
import {fileURLToPath} from "node:url";
import {createServer} from "vite";
import {svelte, vitePreprocess} from "@sveltejs/vite-plugin-svelte";
import puppeteer from "puppeteer";

const root = fileURLToPath(new URL("../", import.meta.url));
let server, rendererServer, browser, page, origin, render, palette;
const errors = [];
before(
  async () => {
    // The real SSR renderer, with only Kit's asset reader replaced. No DB or network services.
    rendererServer = await createServer({
      root,
      configFile: false,
      logLevel: "silent",
      server: {middlewareMode: true, hmr: false, watch: null},
      optimizeDeps: {noDiscovery: true, include: []},
      resolve: {alias: {$lib: root + "src/lib"}},
      plugins: [
        {
          name: "renderer-assets",
          enforce: "pre",
          resolveId(id) {
            if (["$app/server", "$app/environment"].includes(id)) return "\0" + id;
          },
          load(id) {
            if (id === "\0$app/environment") return "export const browser = false;";
            if (id === "\0$app/server")
              return `import {readFileSync} from 'node:fs'; export function read(url) {return new Response(readFileSync(${JSON.stringify(root)} + url.replace(/^\\//, '')));}`;
          }
        },
        svelte({configFile: false, preprocess: vitePreprocess(), hot: false})
      ]
    });
    ({render} = await rendererServer.ssrLoadModule("/src/lib/api/renderer.js"));
    ({DEFAULT_COLORS: palette} = await rendererServer.ssrLoadModule("/src/lib/config/defaults.ts"));
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
    page.on("request", request =>
      request.url().startsWith(origin) || /^(data|blob):/.test(request.url()) ? request.continue() : request.abort()
    );
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem("shield", "heater");
      localStorage.setItem("grad", "backlight");
      localStorage.setItem("diaper", "no");
    });
  },
  {timeout: 60000}
);
after(async () => {
  await browser?.close();
  await server?.close();
  await rendererServer?.close();
});

const fixtures = [
  {name: "default inescutcheon", t1: "or", charges: [{charge: "inescutcheon", t: "gules", p: "e"}]},
  {name: "camel-case inescutcheon", t1: "or", shield: "heater", charges: [{charge: "inescutcheonOldFrench", t: "azure", p: "e"}]},
  {
    name: "semy in an ordinary secondary color",
    t1: "or",
    shield: "heater",
    ordinaries: [{ordinary: "bordure", t: "gules", t2: "semy_of_roundel-azure-or", gyronny: 8}]
  },
  {
    name: "patterns in all charge colors and semy on an ordinary",
    t1: "or",
    shield: "heater",
    division: {division: "perPale", t: "semy_of_roundel-argent-azure"},
    ordinaries: [{ordinary: "fess", t: "semy_of_mullet-gules-or"}],
    charges: [{charge: "arbalest", t: "vair-or-azure", t2: "chequy-gules-argent", t3: "semy_of_roundel-argent-azure", p: "e"}]
  }
];
for (const fixture of fixtures)
  test(`API matches the browser: ${fixture.name}`, async () => {
    await page.goto(`${origin}/?${new URLSearchParams({coa: JSON.stringify(fixture)})}`, {waitUntil: "networkidle0"});
    await page.waitForSelector("#coaEdit");
    await page.waitForFunction(() =>
      [...document.querySelectorAll("#coaEdit use, #patterns use")].every(use =>
        document.getElementById(use.getAttribute("href").slice(1))
      )
    );
    const source = await page.evaluate(async () => {
      const {getSvgForMap} = await import("/src/lib/scripts/download.js");
      return {svg: await getSvgForMap(), coa: JSON.parse(document.querySelector("#coaEdit").dataset.coa)};
    });
    const apiSVG = await render(source.coa, 500, palette);
    const result = await page.evaluate(
      async ({apiSVG, browserSVG}) => {
        const rasterize = async svg => {
          const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
          if (doc.querySelector("parsererror")) throw new Error("Invalid SVG");
          for (const el of doc.querySelectorAll("*"))
            for (const attribute of el.attributes) {
              const refs = [...attribute.value.matchAll(/url\(#([^)]*)\)/g)].map(match => match[1]);
              if (attribute.localName === "href" && attribute.value.startsWith("#")) refs.push(attribute.value.slice(1));
              for (const id of refs) if (!doc.getElementById(id)) throw new Error(`Unresolved SVG reference: ${id}`);
            }
          const url = URL.createObjectURL(new Blob([svg], {type: "image/svg+xml"}));
          try {
            const image = new Image();
            image.src = url;
            await image.decode();
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = 500;
            const context = canvas.getContext("2d");
            context.drawImage(image, 0, 0, 500, 500);
            return context.getImageData(0, 0, 500, 500).data;
          } finally {
            URL.revokeObjectURL(url);
          }
        };
        const actual = await rasterize(apiSVG),
          expected = await rasterize(browserSVG);
        let differingChannels = 0,
          totalDifference = 0;
        for (let i = 0; i < actual.length; i++) {
          const difference = Math.abs(actual[i] - expected[i]);
          if (difference) differingChannels++;
          totalDifference += difference;
        }
        return {differingChannels, totalDifference};
      },
      {apiSVG, browserSVG: source.svg}
    );
    assert.deepEqual(result, {differingChannels: 0, totalDifference: 0});
    assert.deepEqual(errors, []);
  });
