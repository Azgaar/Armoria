import type {RequestHandler} from "./$types";
import {minify} from "minify-xml";
import {generate} from "$lib/scripts/generator";
import {render} from "$lib/api/renderer";
import {isConnected, getClaim} from "$lib/api/db";
import {getColors, parseSeed} from "$lib/api/utils";
import pkg from "convert-svg-to-png";
const {createConverter} = pkg;

const SIZE_DEFAULT = 500;
const FORMAT_DEFAULT = "svg";
const SHIELD_DEFAULT = "heater";
const ZOOM_DEFAULT = 1;

export const GET: RequestHandler = async ({url}) => {
  const params = url.searchParams;
  const format = params.get("format") || FORMAT_DEFAULT;
  const size = parseInt(params.get("size")) || SIZE_DEFAULT;
  const zoom = parseFloat(params.get("zoom")) || ZOOM_DEFAULT;
  const seed = params.get("seed") ? parseSeed(params.get("seed")) : Math.floor(Math.random() * 1e9);
  const colors = getColors(params);
  const coaString = params.get("coa");

  const coa = coaString ? JSON.parse(coaString) : await getCOA(seed);
  coa.seed = seed;
  if (params.shield) coa.shield = req.query.shield;
  if (!coa.shield) coa.shield = SHIELD_DEFAULT;

  const svg = await render(coa, size, zoom, colors);
  return send(format, svg);
};

async function getCOA(seed) {
  const numeric = Number.isInteger(+seed);
  if (numeric) return generate(seed);

  const claimed = isConnected() && (await getClaim(seed));
  return claimed && claimed.coa ? claimed.coa : generate(seed);
}

const converter = createConverter();

async function send(format, svg) {
  if (format === "svg") {
    const svgMinified = minify(svg);
    return new Response(svgMinified, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml"
      }
    });
  }
  else {
    const pngBuffer = await converter.convert(svg);

    return new Response(pngBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Length": pngBuffer.length
      }
    });
  }
}
