import {charges, chargeSets, divisions, lines, ordinaries, patterns, patternSize, shields} from "$lib/data/dataModel";
import {DEFAULT_COLORS, DEFAULT_FONTS} from "$lib/config/defaults";
import {diapers} from "$lib/config/options";
import type {Coa} from "$lib/types/coa";
import {COA_LIMITS, limitText, validateCoaComplexity} from "./limits";
import {InvalidCoaError, RequestLimitError} from "./errors";

function object(value: unknown): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new InvalidCoaError("Invalid COA object");
}

function string(value: unknown, max = 256): asserts value is string {
  if (typeof value !== "string") throw new InvalidCoaError("Invalid COA text field");
  limitText(value, max, "COA text is too long");
}

function identifier(value: unknown, supported: object): void {
  string(value);
  if (!Object.hasOwn(supported, value)) throw new InvalidCoaError("Unknown COA element");
}

export interface CoaOptions {
  /** Browser-only resources that are already registered locally. */
  colors?: object;
  fonts?: object;
  uploaded?: object;
  api?: boolean;
}

const builtInCharges = new Set([
  "inescutcheon",
  ...Object.keys(charges.types).flatMap(category => Object.keys(chargeSets[category]))
]);
const positions = new Set(
  Object.values(shields.data).flatMap(shield => Object.keys(shield.positions || {}))
);
const hex = /^#(?:[a-f\d]{3,4}|[a-f\d]{6}|[a-f\d]{8})$/i;

function charge(value: unknown, options: CoaOptions) {
  string(value);
  if (!builtInCharges.has(value) && !(options.uploaded && Object.hasOwn(options.uploaded, value))) {
    throw new InvalidCoaError("Unknown COA charge");
  }
}

function color(value: unknown) {
  string(value);
  if (!hex.test(value) && !/^[a-z]+$/i.test(value)) throw new InvalidCoaError("Invalid COA color");
}

function tincture(value: unknown, options: CoaOptions): void {
  string(value);
  const plain = (part: string) => {
    if (!hex.test(part) && !Object.hasOwn(DEFAULT_COLORS, part) && !(options.colors && Object.hasOwn(options.colors, part))) {
      throw new InvalidCoaError("Unknown COA tincture");
    }
  };
  if (!value.includes("-")) return plain(value);
  const parts = value.split("-");
  const [pattern, first, second, size] = parts;
  if (parts.length < 3 || parts.length > 4) throw new InvalidCoaError("Invalid COA pattern");
  plain(first);
  plain(second);
  if (size !== undefined) identifier(size, patternSize);
  if (pattern.startsWith("semy_of_")) return charge(pattern.slice(8), options);
  identifier(pattern, patterns);
  if (pattern === "semy") throw new InvalidCoaError("Invalid COA pattern");
}

function flags(item: Record<string, unknown>, fields: string[]) {
  for (const field of fields) {
    const value = item[field];
    if (value !== undefined && ![true, false, 0, 1].includes(value as boolean)) {
      throw new InvalidCoaError("Invalid COA flag");
    }
  }
}

function choice(item: Record<string, unknown>, field: string, choices: string[]) {
  if (item[field] !== undefined && !choices.includes(item[field] as string)) throw new InvalidCoaError("Invalid COA option");
}

function line(item: Record<string, unknown>): void {
  if (item.line !== undefined && item.line !== "straight") identifier(item.line, lines.data);
}

function numeric(item: Record<string, unknown>, field: string, min: number, max: number) {
  const value = item[field];
  if (value === undefined) return;
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    throw new InvalidCoaError("COA number is outside its supported range");
  }
}

function transform(item: Record<string, unknown>) {
  numeric(item, "size", 0.01, 5);
  numeric(item, "stretch", -10, 10);
  numeric(item, "x", -1000, 1000);
  numeric(item, "y", -1000, 1000);
  numeric(item, "angle", -360, 360);
  numeric(item, "strokeWidth", 0, 100);
}

/** Check the shapes consumed by the renderer; messages must never include supplied values. */
export function validateCoa(value: unknown, options: CoaOptions = {}): void {
  object(value);
  validateCoaComplexity(value);
  tincture(value.t1, options);
  numeric(value, "zoom", 0.1, 1);
  if (value.shield !== undefined) identifier(value.shield, shields.data);
  if (value.name !== undefined) string(value.name);
  if (value.seed !== undefined && typeof value.seed !== "number") string(value.seed, COA_LIMITS.stringBytes);
  choice(value, "diaper", diapers);

  if (value.division !== undefined) {
    object(value.division);
    identifier(value.division.division, divisions.data);
    tincture(value.division.t, options);
    line(value.division);
  }

  let positionCount = 0;
  const fonts = new Set<string>();
  for (const field of ["ordinaries", "charges", "inscriptions"] as const) {
    const items = value[field];
    if (items === undefined) continue;
    if (!Array.isArray(items)) throw new InvalidCoaError("Invalid COA collection");
    if (items.length > COA_LIMITS[field]) throw new RequestLimitError("Too many COA elements", 413);
    for (const item of items) {
      object(item);
      if (field === "inscriptions") {
        string(item.text, 1024);
        string(item.font, 128);
        if (item.path !== undefined) string(item.path, 4096);
        if (item.color !== undefined) color(item.color);
        flags(item, ["bold", "italic"]);
        identifier(item.font, options.fonts ? {...DEFAULT_FONTS, ...options.fonts} : DEFAULT_FONTS);
        fonts.add(item.font);
        if (fonts.size > COA_LIMITS.fonts) throw new RequestLimitError("Too many COA fonts", 413);
        numeric(item, "size", 1, 100);
        numeric(item, "spacing", -10, 100);
        if (item.shadow !== undefined) {
          object(item.shadow);
          numeric(item.shadow, "x", -100, 100);
          numeric(item.shadow, "y", -100, 100);
          numeric(item.shadow, "blur", 0, 10);
          if (item.shadow.color !== undefined) color(item.shadow.color);
        }
        continue;
      }
      transform(item);
      choice(item, "divided", ["", "field", "division", "counter"]);
      if (item.stroke !== undefined) color(item.stroke);
      tincture(item.t, options);
      if (item.t2 !== undefined) tincture(item.t2, options);
      if (item.t3 !== undefined) tincture(item.t3, options);
      if (field === "ordinaries") {
        identifier(item.ordinary, ordinaries.data);
        line(item);
        flags(item, ["above"]);
        numeric(item, "compony", 0, 100);
        if (item.compony && Number(item.compony) < 5) throw new InvalidCoaError("Compony size must be between 5 and 100");
        numeric(item, "gyronny", 0, 100);
        if (item.gyronny && (!Number.isInteger(item.gyronny) || Number(item.gyronny) < 4 || Number(item.gyronny) % 2)) {
          throw new InvalidCoaError("Gyronny must be zero or an even integer from 4 to 100");
        }
        // This legacy effect uses document/SVG geometry APIs unavailable in SSR.
        // Reject it before asset loading instead of attempting its unbounded dash loop.
        if (options.api && item.compony !== undefined && item.compony !== 0) {
          throw new InvalidCoaError("Compony ordinaries are not supported by the API renderer");
        }
      } else {
        charge(item.charge, options);
        flags(item, ["reversed", "sinister", "layered"]);
        choice(item, "outside", ["", "above", "below", "around"]);
        if (item.p !== undefined) {
          string(item.p, 64);
          positionCount += new Set(item.p).size;
          if ([...item.p].some(p => !positions.has(p))) throw new InvalidCoaError("Unknown COA charge position");
          if (positionCount > COA_LIMITS.positions) throw new RequestLimitError("Too many COA charge positions", 413);
        }
      }
    }
  }
}

/** Validate before cloning or changing stores. Normalize only documented legacy defaults. */
export function normalizeCoa(value: unknown, options: CoaOptions = {}): Coa {
  validateCoa(value, options);
  const coa: Coa = JSON.parse(JSON.stringify(value));
  for (const item of [...(coa.charges || []), ...(coa.ordinaries || []), ...(coa.inscriptions || [])]) {
    for (const field of ["above", "reversed", "sinister", "layered", "bold", "italic"] as const) {
      const record = item as unknown as Record<string, unknown>;
      if (Object.hasOwn(record, field)) record[field] = Boolean(record[field]);
    }
  }
  for (const item of coa.charges || []) item.p ??= "e";
  for (const item of coa.inscriptions || []) {
    item.size ??= 20;
    item.color ??= "#000000";
    item.path ??= "M-50 0 L50 0";
    if (item.shadow) {
      item.shadow.x ??= 0;
      item.shadow.y ??= 0;
      item.shadow.blur ??= 0;
      item.shadow.color ??= "#333333";
    }
  }
  validateCoaComplexity(coa);
  return coa;
}

function parseJSON(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw new InvalidCoaError("Invalid COA JSON");
  }
}

export function parseCoa(text: string, options: CoaOptions = {}): Coa {
  limitText(text, COA_LIMITS.coaBytes, "COA payload is too large");
  return normalizeCoa(parseJSON(text), options);
}

export const IMPORT_LIMITS = {bytes: 2 * 1024 * 1024, items: 64} as const;

/** Validate the entire gallery, including entries not displayed in editor mode. */
export function parseCoaImport(text: string, options: CoaOptions = {}): Coa[] {
  limitText(text, IMPORT_LIMITS.bytes, "JSON import is too large");
  const value = parseJSON(text);
  if (!Array.isArray(value) || !value.length) throw new InvalidCoaError("Expected a non-empty COA array");
  if (value.length > IMPORT_LIMITS.items) throw new RequestLimitError("Too many imported COAs", 413);
  return value.map(coa => normalizeCoa(coa, options));
}
