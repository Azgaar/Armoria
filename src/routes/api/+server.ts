import {getClaim} from "$lib/api/claims";
import {render} from "$lib/api/renderer";
import {generateSeed, parseColors, parseSeed} from "$lib/api/utils";
import {generate} from "$lib/scripts/generator";
import {minify} from "minify-xml";
import type {RequestHandler} from "./$types";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";
import svgToJpeg from "convert-svg-to-jpeg";
import svgToPng from "convert-svg-to-png";

const SIZE_DEFAULT = 500;
const FORMAT_DEFAULT = "svg";
const SHIELD_DEFAULT = "heater";
const ZOOM_DEFAULT = 1;

export const GET: RequestHandler = async ({url}) => {
  const params = url.searchParams;
  const format = params.get("format") || FORMAT_DEFAULT;
  const size = Number(params.get("size")) || SIZE_DEFAULT;
  const zoom = Number(params.get("zoom")) || ZOOM_DEFAULT;
  const seedParam = params.get("seed");
  const seed = seedParam ? parseSeed(seedParam) : generateSeed();
  const colors = parseColors(params);
  const coaParam = params.get("coa");

  const coa = coaParam ? JSON.parse(coaParam) : await getCoa(seed);
  coa.seed = seed;
  coa.shield = params.get("shield") || SHIELD_DEFAULT;

  const svg = await render(coa, size, zoom, colors);
  return send(format, svg);
};

async function getCoa(seed: string) {
  if (Number.isInteger(Number(seed))) return generate(seed);

  const claimed = await getClaim(seed);
  return claimed?.coa || generate(seed);
}

let jpegConverter, pngConverter;
let options = {
  ignoreHTTPSErrors: true,
  headless: true,
}
if (process.env.VERCEL) {
  options.executablePath = await chromium.executablePath("https://github.com/Sparticuz/chromium/releases/download/v137.0.1/chromium-v137.0.1-pack.x64.tar");
  const remove = [
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
  ];
  options.args = chromium.args.filter(v => !remove.includes(v));
} else {
  options.channel = "chrome";
}

async function send(format: string, svg: string) {
  if (format === "svg") {
    const svgMinified = minify(svg);
    return new Response(svgMinified, {
      status: 200,
      headers: {"Content-Type": "image/svg+xml"}
    });
  }

  let converter, contentType;
  if (format === "png") {
    pngConverter ||= svgToPng.createConverter({puppeteer: options});
    converter = pngConverter;
    contentType = "image/png";
  } else if (format === "jpg" || format === "jpeg") {
    jpegConverter ||= svgToJpeg.createConverter({puppeteer: options});
    converter = jpegConverter;
    contentType = "image/jpeg";
  } else {
    return new Response("Invalid format", {status: 400});
  }

  const buffer = await converter.convert(svg);
  return new Response(buffer, {
    status: 200,
    headers: {"Content-Type": contentType, "Content-Length": String(buffer.length)}
  });
}
