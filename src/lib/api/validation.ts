import type {Coa} from "$lib/types/coa";
import * as shared from "$lib/coa/validation";

// The API uses the same schema, with no local browser resources or DOM-only effects.
export function validateCoa(value: unknown): void {
  shared.validateCoa(value, {api: true});
}
export function normalizeCoa(value: unknown): Coa {
  return shared.normalizeCoa(value, {api: true});
}
export function parseCoa(text: string): Coa {
  return shared.parseCoa(text, {api: true});
}
