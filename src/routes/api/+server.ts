import {getClaim} from "$lib/api/claims";
import {render} from "$lib/api/renderer";
import {generateSeed, parseColors, parseSeed} from "$lib/api/utils";
import {generate} from "$lib/scripts/generator";
import convertToJpg from "convert-svg-to-jpeg";
import convertToPng from "convert-svg-to-png";
import {minify} from "minify-xml";
import type {RequestHandler} from "./$types";

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

const pngConverter = convertToPng.createConverter();
const jpgConverter = convertToJpg.createConverter();

async function send(format: string, svg: string) {
  if (format === "svg") {
    const svgMinified = minify(svg);
    return new Response(svgMinified, {
      status: 200,
      headers: {"Content-Type": "image/svg+xml"}
    });
  }

  if (format === "png") {
    const pngBuffer = await pngConverter.convert(svg);
    return new Response(pngBuffer, {
      status: 200,
      headers: {"Content-Type": "image/png", "Content-Length": String(pngBuffer.length)}
    });
  }

  if (format === "jpg" || format === "jpeg") {
    const jpgBuffer = await jpgConverter.convert(svg);
    return new Response(jpgBuffer, {
      status: 200,
      headers: {"Content-Type": "image/jpeg", "Content-Length": String(jpgBuffer.length)}
    });
  }

  return new Response("Invalid format", {status: 400});
}
