import * as defaults from "$lib/config/defaults";
import {diapers, gradients} from "$lib/config/options";
import {charges} from "$lib/data/dataModel";
import {shields} from "./shields";
import {ra, rw} from "$lib/scripts/utils";
import {settingsStorage, reportSettingsRecovery} from "./storage";
import {validateTinctures} from "./validators";

const badKeys = new Set(["__proto__", "prototype", "constructor", "array"]);
const safeName = (name: string) => name.length > 0 && name.length <= 128 && !badKeys.has(name);
const identifier = (name: string) => safeName(name) && /^[\p{L}_][\p{L}\p{N}_]*$/u.test(name);
const isColor = (value: unknown): value is string =>
  typeof value === "string" && /^#(?:[a-f\d]{3,4}|[a-f\d]{6}|[a-f\d]{8})$/i.test(value);
const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
function invalid(): never {
  throw new Error("Invalid saved setting");
}

function read<T>(key: string, parse: (raw: string) => T, fallback: () => T): T {
  const raw = settingsStorage.getItem(key);
  if (raw === null) return fallback();
  if (raw === "null") {
    settingsStorage.ignore(key);
    return fallback();
  } // legacy unlocked setting
  try {
    return parse(raw);
  } catch {
    settingsStorage.ignore(key);
    return fallback();
  }
}
function number(min: number, max: number, integer = false) {
  return (raw: string) => {
    if (!raw.trim()) return invalid();
    const value = Number(raw);
    if (!Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) return invalid();
    return value;
  };
}
function choice(values: string[]) {
  return (raw: string) => (values.includes(raw) ? raw : invalid());
}
function color(raw: string) {
  return isColor(raw) ? raw : invalid();
}

function palette(raw: string): Record<string, string> {
  const value: unknown = JSON.parse(raw);
  if (!object(value)) return invalid();
  const result: Record<string, string> = {...defaults.DEFAULT_COLORS};
  for (const [name, color] of Object.entries(value)) {
    if (identifier(name) && isColor(color)) result[name] = color;
    else reportSettingsRecovery();
  }
  return result;
}
function fonts(raw: string): defaults.Fonts {
  const value: unknown = JSON.parse(raw);
  if (!object(value)) return invalid();
  const result = clone(defaults.DEFAULT_FONTS);
  for (const [name, font] of Object.entries(value)) {
    if (!safeName(name) || !/^[\p{L}\p{N} _.-]+$/u.test(name) || !object(font)) {
      reportSettingsRecovery();
      continue;
    }
    if (font.url === undefined) {
      result[name] = {};
      continue;
    }
    if (typeof font.url !== "string" || !font.url || font.url.length > 8192) {
      reportSettingsRecovery();
      continue;
    }
    try {
      const url = new URL(font.url, "https://armoria.vercel.app/");
      if (!["https:", "http:"].includes(url.protocol)) throw new Error();
      result[name] = {url: font.url};
    } catch {
      reportSettingsRecovery();
    }
  }
  return result;
}

export interface UploadedCharge {
  category: string;
  type: "vector" | "raster";
  content: string;
  data?: {
    colors?: number;
    sinister?: boolean;
    reversed?: boolean;
    layered?: boolean;
    natural?: string;
    positions?: Record<string, number>;
  };
}
const builtInCharges = new Set(
  Object.keys(charges.types)
    .filter(category => category !== "uploaded")
    .flatMap(category => Object.keys(charges[category as keyof typeof charges]))
);
const positions = new Set(Object.keys(shields.data.spanish.positions));
function uploads(raw: string, colors: Record<string, string>): Record<string, UploadedCharge> {
  const value: unknown = JSON.parse(raw);
  if (!object(value)) return invalid();
  const result: Record<string, UploadedCharge> = {};
  for (const [name, item] of Object.entries(value)) {
    try {
      if (!identifier(name) || builtInCharges.has(name) || name.startsWith("inescutcheon") || !object(item)) invalid();
      if (typeof item.category !== "string" || !Object.hasOwn(charges.types, item.category)) invalid();
      if (item.type !== "vector" && item.type !== "raster") invalid();
      if (typeof item.content !== "string" || !item.content.trim()) invalid();
      const data: NonNullable<UploadedCharge["data"]> = {};
      if (item.data !== undefined) {
        if (!object(item.data)) invalid();
        if (item.data.colors !== undefined) {
          if (typeof item.data.colors !== "number" || ![1, 2, 3].includes(item.data.colors)) invalid();
          data.colors = item.data.colors;
        }
        for (const flag of ["sinister", "reversed", "layered"] as const) {
          if (item.data[flag] === undefined) continue;
          if (typeof item.data[flag] !== "boolean") invalid();
          data[flag] = item.data[flag];
        }
        if (item.data.natural !== undefined) {
          if (typeof item.data.natural !== "string" || !Object.hasOwn(colors, item.data.natural)) invalid();
          data.natural = item.data.natural;
        }
        if (item.data.positions !== undefined) {
          if (!object(item.data.positions)) invalid();
          const weights: Record<string, number> = {};
          for (const [p, weight] of Object.entries(item.data.positions)) {
            if (
              !p ||
              p.length > 64 ||
              [...p].some(p => !positions.has(p)) ||
              typeof weight !== "number" ||
              !Number.isInteger(weight) ||
              weight < 0 ||
              weight > 1000
            )
              invalid();
            weights[p] = weight;
          }
          const total = Object.values(weights).reduce((a, b) => a + b, 0);
          if (total < 1 || total > 10000) invalid();
          data.positions = weights;
        }
      }
      result[name] = {
        category: item.category,
        type: item.type,
        content: item.content,
        ...(item.data !== undefined ? {data} : {})
      };
    } catch {
      reportSettingsRecovery();
    }
  }
  return result;
}

/** Keep the existing per-key format: no storage schema migration is needed. */
export function readSavedSettings() {
  const colors = read("colors", palette, () => clone(defaults.DEFAULT_COLORS));
  return {
    size: read("size", number(80, 400, true), () => defaults.DEFAULT_SIZE),
    diaper: read("diaper", choice(diapers), () => defaults.DEFAULT_DIAPER),
    grad: read("grad", choice(gradients), () => ra(defaults.DEFAULT_GRADIENTS)),
    shield: read("shield", choice(Object.keys(shields.data)), () =>
      rw(shields[rw(shields.types) as keyof typeof shields] as Record<string, number>)
    ),
    colors,
    fonts: read("fonts", fonts, () => clone(defaults.DEFAULT_FONTS)),
    border: read("border", color, () => defaults.DEFAULT_BORDER),
    borderWidth: read("borderWidth", number(0, 4), () => defaults.DEFAULT_BORDER_WIDTH),
    background: read("background", color, () => defaults.DEFAULT_BACKGROUND),
    fontColor: read("fontColor", color, () => defaults.DEFAULT_FONT_COLOR),
    scale: read("scale", number(0.1, 4), () => defaults.DEFAULT_SCALE),
    grid: read("grid", number(1, 50, true), () => defaults.DEFAULT_GRID),
    showGrid: read(
      "showGrid",
      raw => {
        const value: unknown = JSON.parse(raw);
        return typeof value === "boolean" ? value : invalid();
      },
      () => defaults.DEFAULT_SHOW_GRID
    ),
    tinctures: read(
      "tinctures",
      raw => {
        const value: unknown = JSON.parse(raw);
        if (!validateTinctures(value, colors)) return invalid();
        // Weighted sampling caches from older exports are derived, not settings.
        const clean = clone(value);
        for (const group of Object.values(clean)) delete (group as unknown as Record<string, unknown>).array;
        return clean;
      },
      () => clone(defaults.DEFAULT_TINCTURES)
    ),
    uploaded: read(
      "uploaded",
      raw => uploads(raw, colors),
      () => ({}) as Record<string, UploadedCharge>
    )
  };
}
