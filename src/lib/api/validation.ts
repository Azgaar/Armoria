import {divisions, lines, ordinaries, patterns, shields} from "$lib/data/dataModel";
import type {Coa} from "$lib/types/coa";
import {InvalidCoaError} from "./responses";

function object(value: unknown): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new InvalidCoaError("Invalid COA object");
}

function string(value: unknown): asserts value is string {
  if (typeof value !== "string") throw new InvalidCoaError("Invalid COA text field");
}

function identifier(value: unknown, supported: object): void {
  string(value);
  if (!Object.hasOwn(supported, value)) throw new InvalidCoaError("Unknown COA element");
}

function tincture(value: unknown): void {
  string(value);
  if (!value) throw new InvalidCoaError("Missing COA tincture");
  if (!value.includes("-")) return;
  const [pattern, first, second] = value.split("-");
  if (!first || !second) throw new InvalidCoaError("Invalid COA pattern");
  if (/^semy_of_[a-zA-Z][a-zA-Z0-9]*$/.test(pattern)) return;
  identifier(pattern, patterns);
  if (pattern === "semy") throw new InvalidCoaError("Invalid COA pattern");
}

function line(item: Record<string, unknown>): void {
  if (item.line !== undefined && item.line !== "straight") identifier(item.line, lines.data);
}

/** Check the shapes consumed by the renderer; messages must never include supplied values. */
export function validateCoa(value: unknown): asserts value is Coa {
  object(value);
  tincture(value.t1);
  if (value.shield !== undefined) identifier(value.shield, shields.data);
  if (value.name !== undefined) string(value.name);

  if (value.division !== undefined) {
    object(value.division);
    identifier(value.division.division, divisions.data);
    tincture(value.division.t);
    line(value.division);
  }

  for (const field of ["ordinaries", "charges", "inscriptions"] as const) {
    const items = value[field];
    if (items === undefined) continue;
    if (!Array.isArray(items)) throw new InvalidCoaError("Invalid COA collection");
    for (const item of items) {
      object(item);
      if (field === "inscriptions") {
        string(item.text);
        string(item.font);
        string(item.path);
        continue;
      }
      tincture(item.t);
      if (item.t2 !== undefined) tincture(item.t2);
      if (item.t3 !== undefined) tincture(item.t3);
      if (field === "ordinaries") {
        identifier(item.ordinary, ordinaries.data);
        line(item);
      } else {
        string(item.charge);
        if (item.p !== undefined) string(item.p);
      }
    }
  }
}

export function parseCoa(text: string): Coa {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new InvalidCoaError("Invalid COA JSON");
  }
  validateCoa(value);
  return value;
}
