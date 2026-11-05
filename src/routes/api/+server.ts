import {getClaim} from "#lib/api/claims.ts";
import {render} from "#lib/api/renderer.js";
import {generateSeed, parseColors, parseSeed} from "#lib/api/utils.ts";
import {apiError} from "#lib/api/responses.ts";
import {parseCoa} from "#lib/api/validation.ts";
import {validateImageRequest} from "#lib/api/limits.ts";
import {generate} from "#lib/scripts/generator.js";
import {minify} from "minify-xml";
import type {RequestHandler} from "./$types";
import {rasterizer} from "#lib/api/raster.ts";

export const GET: RequestHandler = async ({url}) => {
  try {
    const {format, size, shield} = validateImageRequest(url);
    const params = url.searchParams;
    const seedParam = params.get("seed");
    const seed = seedParam ? parseSeed(seedParam) : generateSeed();
    const colors = parseColors(params);
    const coaParam = params.get("coa");
    const coa = coaParam !== null ? parseCoa(coaParam) : await getCoa(seed);
    const svg = await render({...coa, ...(shield !== null ? {shield} : {}), seed}, size, colors);
    return await send(format, svg, size);
  } catch (err) {
    return apiError(err);
  }
};

async function getCoa(seed: string) {
  if (Number.isInteger(Number(seed))) return generate(seed);

  const claimed = await getClaim(seed);
  return claimed?.coa || generate(seed);
}

async function send(format: string, svg: string, size: number) {
  if (format === "svg") {
    const svgMinified = minify(svg);
    return new Response(svgMinified, {
      status: 200,
      headers: {"Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=60"}
    });
  }

  if (format !== "png" && format !== "jpg" && format !== "jpeg") throw new Error("Unexpected image format");
  const rasterFormat = format === "png" ? "png" : "jpeg";
  const buffer = await rasterizer.convert(svg, size, rasterFormat);
  const contentType = `image/${rasterFormat}`;
  return new Response(buffer, {
    status: 200,
    headers: {"Content-Type": contentType, "Content-Length": String(buffer.length), "Cache-Control": "public, max-age=60"}
  });
}
