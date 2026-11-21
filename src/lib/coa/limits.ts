import {InvalidCoaError, RequestLimitError} from "./errors";

export const COA_LIMITS = {
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
  if (new TextEncoder().encode(text).byteLength > max) throw new RequestLimitError(message, status);
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
    if (++nodes > COA_LIMITS.nodes || depth > COA_LIMITS.depth) throw new RequestLimitError("COA is too complex", 413);
    if (typeof value === "string") {
      limitText(value, COA_LIMITS.stringBytes, "COA text is too long");
    } else if (typeof value === "number") {
      if (!Number.isFinite(value)) throw new InvalidCoaError("Invalid COA number");
    } else if (value && typeof value === "object") {
      if (seen.has(value)) throw new InvalidCoaError("Invalid cyclic COA object");
      seen.add(value);
      if (Array.isArray(value) && value.length > COA_LIMITS.arrayItems)
        throw new RequestLimitError("COA collection is too large", 413);
      const entries = Object.entries(value);
      if (!Array.isArray(value) && entries.length > COA_LIMITS.objectKeys)
        throw new RequestLimitError("Too many COA properties", 413);
      for (const [key, child] of entries) {
        if (["__proto__", "constructor", "prototype"].includes(key)) throw new InvalidCoaError("Invalid COA property");
        limitText(key, 128, "COA property name is too long");
        stack.push({value: child, depth: depth + 1});
      }
    } else if (value !== null && typeof value !== "boolean") {
      throw new InvalidCoaError("Invalid COA value");
    }
  }
  limitText(JSON.stringify(value), COA_LIMITS.coaBytes, "COA payload is too large");
}
