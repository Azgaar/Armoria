import puppeteer, {type Browser} from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";
import {validateImageSize} from "./limits";

export const CHROMIUM_PACK = "https://github.com/Sparticuz/chromium/releases/download/v153.0.0/chromium-v153.0.0-pack.x64.tar";

async function launchBrowser(): Promise<Browser> {
  if (!process.env.VERCEL) return puppeteer.launch({headless: true, protocol: "cdp", protocolTimeout: 15000, channel: "chrome"});
  const executablePath = await chromium.executablePath(CHROMIUM_PACK);
  const remove = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"];
  return puppeteer.launch({
    headless: "shell",
    protocol: "cdp",
    protocolTimeout: 15000,
    executablePath,
    args: chromium.args.filter(value => !remove.includes(value))
  });
}

// One lazy browser per function instance; each conversion owns a separate page.
// A shared launch promise prevents concurrent cold requests from starting extra browsers.
export function createRasterizer(launch: () => Promise<Browser> = launchBrowser) {
  let browser: Browser | undefined;
  let launching: Promise<Browser> | undefined;

  async function getBrowser(): Promise<Browser> {
    if (browser?.connected) return browser;
    if (!launching) {
      launching = launch()
        .then(value => {
          if (!value.connected) throw new Error("Raster browser disconnected during startup");
          browser = value;
          return value;
        })
        .finally(() => {
          launching = undefined;
        });
    }
    return launching;
  }

  async function convert(svg: string, size: number, format: "png" | "jpeg"): Promise<Buffer<ArrayBuffer>> {
    validateImageSize(size);
    const active = await getBrowser();
    const page = await active.newPage();
    try {
      // The renderer embeds all assets/fonts. Prevent network/file access and active
      // content while retaining Chromium's SVG, filter and embedded-font rendering.
      await page.setJavaScriptEnabled(false);
      await page.setRequestInterception(true);
      page.on("request", request => {
        const resolution = /^(data|blob):/.test(request.url()) ? request.continue() : request.abort();
        // Closing a failed page can cancel an intercepted request before it resolves.
        void resolution.catch(() => {});
      });
      await page.setViewport({width: size, height: size, deviceScaleFactor: 1});
      await page.setContent(
        `<!doctype html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0}html{background:${format === "png" ? "transparent" : "#fff"}}</style></head><body>${svg}</body></html>`,
        {waitUntil: "load", timeout: 15000}
      );
      await page.evaluate(() => document.fonts.ready);
      return Buffer.from(
        await page.screenshot({
          type: format,
          ...(format === "png" ? {omitBackground: true} : {quality: 100}),
          clip: {x: 0, y: 0, width: size, height: size}
        })
      );
    } finally {
      await page.close().catch(async () => {
        // Do not retain a browser whose failed page cleanup could accumulate pages.
        if (browser === active) browser = undefined;
        await active.close().catch(() => {});
      });
    }
  }

  async function close() {
    const active = launching ? await launching.catch(() => undefined) : browser;
    browser = undefined;
    await active?.close();
  }

  return {convert, close};
}

export const rasterizer = createRasterizer();
