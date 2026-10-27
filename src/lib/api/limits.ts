import {InvalidCoaError, RequestLimitError} from "./responses";

export const API_LIMITS = {
  imageSize: 4096,
  urlBytes: 64 * 1024,
  coaBytes: 32 * 1024,
  depth: 8,
  nodes: 2048,
  objectKeys: 64,
  arrayItems: 64,
  stringBytes: 4096,
  charges: 32,
  ordinaries: 16,
  inscriptions: 16,
  positions: 256,
  fonts: 8
} as const;

export function limitText(text: string, max: number, message: string, status: 413 | 414 = 413) {
  if (Buffer.byteLength(text, "utf8") > max) throw new RequestLimitError(message, status);
}

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

/** Iterative traversal also covers unknown metadata and stored/generated COAs.
 * Inspect before JSON.stringify so deep/cyclic stored objects cannot overflow the stack.
 */
export function validateCoaComplexity(value: unknown): void {
  const stack = [{value, depth: 0}];
  const seen = new WeakSet<object>();
  let nodes = 0;
  while (stack.length) {
    const {value, depth} = stack.pop()!;
    if (++nodes > API_LIMITS.nodes || depth > API_LIMITS.depth) throw new RequestLimitError("COA is too complex", 413);
    if (typeof value === "string") {
      limitText(value, API_LIMITS.stringBytes, "COA text is too long");
    } else if (typeof value === "number") {
      if (!Number.isFinite(value)) throw new InvalidCoaError("Invalid COA number");
    } else if (value && typeof value === "object") {
      if (seen.has(value)) throw new InvalidCoaError("Invalid cyclic COA object");
      seen.add(value);
      if (Array.isArray(value) && value.length > API_LIMITS.arrayItems)
        throw new RequestLimitError("COA collection is too large", 413);
      const entries = Object.entries(value);
      if (!Array.isArray(value) && entries.length > API_LIMITS.objectKeys)
        throw new RequestLimitError("Too many COA properties", 413);
      for (const [key, child] of entries) {
        limitText(key, 128, "COA property name is too long");
        stack.push({value: child, depth: depth + 1});
      }
    } else if (value !== null && typeof value !== "boolean") {
      throw new InvalidCoaError("Invalid COA value");
    }
  }
  limitText(JSON.stringify(value), API_LIMITS.coaBytes, "COA payload is too large");
}
