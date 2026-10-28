import {DEFAULT_COLORS, DEFAULT_TINCTURES} from "$lib/config/defaults";
import type {Tinctures} from "$lib/types/tinctures";

/** Validate generator inputs before rw() constructs weighted arrays. */
export function validateTinctures(value: unknown, colors: Record<string, string> = DEFAULT_COLORS): value is Tinctures {
  const object = (value: unknown): value is Record<string, unknown> =>
    !!value && typeof value === "object" && !Array.isArray(value);
  if (!object(value)) return false;
  const types = ["metals", "colours", "stains", "patterns"];
  for (const group of ["field", "division", "charge", ...types]) {
    const weights = value[group];
    if (!object(weights)) return false;
    const entries = Object.entries(weights).filter(([name]) => name !== "array");
    if (entries.length > 256) return false;
    let total = 0;
    for (const [name, chance] of entries) {
      if (
        ["__proto__", "prototype", "constructor"].includes(name) ||
        typeof chance !== "number" ||
        !Number.isInteger(chance) ||
        chance < 0 ||
        chance > 1000
      )
        return false;
      if (
        ["field", "division", "charge"].includes(group)
          ? !types.includes(name)
          : group === "patterns"
            ? !Object.hasOwn(DEFAULT_TINCTURES.patterns, name)
            : !Object.hasOwn(colors, name)
      )
        return false;
      total += chance;
    }
    if (total > 10000) return false;
    if (total < 1) {
      // Empty optional pools are usable only when no element can select them.
      if (!["stains", "patterns"].includes(group)) return false;
      if (["field", "division", "charge"].some(element => !object(value[element]) || value[element][group] !== 0)) return false;
    }
    if (["metals", "colours"].includes(group) && entries.length < 2) return false;
    if (["field", "division", "charge"].includes(group) && types.some(type => typeof weights[type] !== "number")) return false;
  }
  return Object.keys(value).every(key => ["field", "division", "charge", ...types].includes(key));
}
