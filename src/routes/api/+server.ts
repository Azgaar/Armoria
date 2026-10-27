import {getClaim} from "$lib/api/claims";
import {render} from "$lib/api/renderer";
import {generateSeed, parseColors, parseSeed} from "$lib/api/utils";
import {apiError} from "$lib/api/responses";
import {parseCoa} from "$lib/api/validation";
import {validateImageRequest} from "$lib/api/limits";
import {generate} from "$lib/scripts/generator";
import {minify} from "minify-xml";
import type {RequestHandler} from "./$types";
import chromium from "@sparticuz/chromium-min";
import {createConverter as createJpegConverter} from "convert-svg-to-jpeg";
import {createConverter as createPngConverter} from "convert-svg-to-png";

export const GET: RequestHandler = async ({url}) => {
  try {
    const {format, size} = validateImageRequest(url);
    const params = url.searchParams;
    const seedParam = params.get("seed");
    const seed = seedParam ? parseSeed(seedParam) : generateSeed();
    const colors = parseColors(params);
    const coaParam = params.get("coa");
    const coa = coaParam !== null ? parseCoa(coaParam) : await getCoa(seed);
    const svg = await render({...coa, seed}, size, colors);
    return await send(format, svg);
  } catch (err) {
    return apiError(err);
  }
};

async function getCoa(seed: string) {
  if (Number.isInteger(Number(seed))) return generate(seed);

  const claimed = await getClaim(seed);
  return claimed?.coa || generate(seed);
}

let jpegConverter, pngConverter;
// Resolve/download Chromium only after validation and only for a raster request.
async function launchOptions() {
  if (!process.env.VERCEL) return {headless: true, ignoreHTTPSErrors: true, channel: "chrome" as const};
  const executablePath = await chromium.executablePath(
    "https://github.com/Sparticuz/chromium/releases/download/v138.0.1/chromium-v138.0.1-pack.x64.tar"
  );
  const remove = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"];
  return {headless: true, ignoreHTTPSErrors: true, executablePath, args: chromium.args.filter(value => !remove.includes(value))};
}

async function send(format: string, svg: string) {
  if (format === "svg") {
    const svgMinified = minify(svg);
    return new Response(svgMinified, {
      status: 200,
      headers: {"Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=60"}
    });
  }

  let converter, contentType;
  if (format === "png") {
    pngConverter ||= await createPngConverter({launch: await launchOptions()});
    converter = pngConverter;
    contentType = "image/png";
  } else if (format === "jpg" || format === "jpeg") {
    jpegConverter ||= await createJpegConverter({launch: await launchOptions()});
    converter = jpegConverter;
    contentType = "image/jpeg";
  } else {
    throw new Error("Unexpected image format");
  }

  const buffer = await converter.convert(svg);
  return new Response(buffer, {
    status: 200,
    headers: {"Content-Type": contentType, "Content-Length": String(buffer.length), "Cache-Control": "public, max-age=60"}
  });
}
