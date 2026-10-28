import {InvalidCoaError, RequestLimitError} from "./responses";
import {COA_LIMITS, limitText} from "$lib/coa/limits";
export {limitText, validateCoaComplexity} from "$lib/coa/limits";

export const API_LIMITS = {...COA_LIMITS, imageSize: 4096, urlBytes: 64 * 1024} as const;

export function validateImageSize(size: number): void {
  if (!Number.isInteger(size) || size < 1 || size > API_LIMITS.imageSize) {
    throw new InvalidCoaError("Size must be an integer between 1 and 4096 pixels");
  }
}

export function parseImageSize(value: string | null): number {
  if (value === null) return 500;
  // Preserve the documented legacy suffix without permissive Number/parseInt coercion.
  if (!/^\d+(?:px)?$/.test(value)) throw new InvalidCoaError("Invalid image size");
  const size = Number(value.replace(/px$/, ""));
  validateImageSize(size);
  return size;
}

export function validateImageRequest(url: URL) {
  limitText(url.href, API_LIMITS.urlBytes, "Request URL is too long", 414);
  const params = url.searchParams;
  for (const name of ["format", "size", "seed", "coa"]) {
    if (params.getAll(name).length > 1) throw new InvalidCoaError("Duplicate image parameter");
  }
  const format = params.get("format") ?? "svg";
  if (!["svg", "png", "jpg", "jpeg"].includes(format)) throw new InvalidCoaError("Invalid format");
  const size = parseImageSize(params.get("size"));
  const seed = params.get("seed");
  if (seed !== null && seed.length > 200) throw new RequestLimitError("Seed is too long", 413);
  return {format, size};
}
